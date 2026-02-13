#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/psyfit"
cd "$APP_DIR"

DEPLOY_TIMESTAMP=$(date +%s)
NEW_CONTAINER_NAME="psyfit-web-${DEPLOY_TIMESTAMP}"
ENV_FILE="/tmp/psyfit_env_${DEPLOY_TIMESTAMP}.txt"

echo "=== Starting deployment (${DEPLOY_TIMESTAMP}) ==="

# Load rbenv
eval "$(~/.rbenv/bin/rbenv init -)"

# Load environment variables
set -a
source "$APP_DIR/.env"
set +a

# Pull latest code
echo "--- Pulling latest code ---"
git pull origin main

# ============================================================
# Phase 1: Docker Deployment (PRIMARY - serves production traffic)
# ============================================================
echo "=== Phase 1: Docker Deployment ==="

# Step 1: Find current active container via kamal-proxy
find_active_container() {
  local proxy_output
  proxy_output=$(docker exec kamal-proxy kamal-proxy list 2>/dev/null || echo "")

  if [ -z "$proxy_output" ]; then
    echo ""
    return
  fi

  # Extract target IP from kamal-proxy list output
  local target_ip
  target_ip=$(echo "$proxy_output" | grep -oP '\d+\.\d+\.\d+\.\d+' | head -1)

  if [ -z "$target_ip" ]; then
    echo ""
    return
  fi

  # Find container with that IP on the kamal network
  docker network inspect kamal \
    --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null | \
    grep "$target_ip" | awk '{print $1}' | head -1
}

CURRENT_CONTAINER=$(find_active_container)
echo "Current active container: ${CURRENT_CONTAINER:-none}"

# Step 2: Build Docker image
echo "--- Building Docker image ---"
docker build -t psyfit-local:latest --platform linux/amd64 . 2>&1 | tail -5

# Step 3: Extract environment variables from current container
if [ -n "$CURRENT_CONTAINER" ]; then
  echo "--- Extracting env from ${CURRENT_CONTAINER} ---"
  docker exec "$CURRENT_CONTAINER" env | \
    grep -v "^HOSTNAME=" | grep -v "^KAMAL_" | grep -v "^PATH=" | \
    grep -v "^HOME=" | grep -v "^RUBY_DOWNLOAD" | grep -v "^BUNDLE_" | \
    grep -v "^GEM_HOME=" | grep -v "^LANG=" | grep -v "^LD_PRELOAD=" \
    > "$ENV_FILE"

  # Update RAILS_MASTER_KEY to match repo
  if [ -f "$APP_DIR/config/master.key" ]; then
    master_key=$(cat "$APP_DIR/config/master.key")
    if grep -q "^RAILS_MASTER_KEY=" "$ENV_FILE"; then
      sed -i "s/RAILS_MASTER_KEY=.*/RAILS_MASTER_KEY=${master_key}/" "$ENV_FILE"
    else
      echo "RAILS_MASTER_KEY=${master_key}" >> "$ENV_FILE"
    fi
  fi
else
  echo "WARNING: No active container found. Using .env file as fallback."
  cp "$APP_DIR/.env" "$ENV_FILE"
fi

# Step 4: Start new container
echo "--- Starting new container: ${NEW_CONTAINER_NAME} ---"
docker run -d \
  --name "$NEW_CONTAINER_NAME" \
  --network kamal \
  --env-file "$ENV_FILE" \
  -v psyfit_storage:/rails/storage \
  psyfit-local:latest

# Step 5: Wait for health check
echo "--- Waiting for new container to be healthy ---"
NEW_IP=$(docker inspect "$NEW_CONTAINER_NAME" \
  --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
echo "New container IP: ${NEW_IP}"

HEALTH_OK=false
for i in $(seq 1 30); do
  if curl -sf --max-time 5 -H "Host: psytech.jp" "http://${NEW_IP}:3000/api/v1/health" > /dev/null 2>&1; then
    echo "Health check passed on attempt ${i}"
    HEALTH_OK=true
    break
  fi
  echo "Waiting for health check... (${i}/30)"
  sleep 2
done

if [ "$HEALTH_OK" != true ]; then
  echo "ERROR: New container failed health check after 60 seconds"
  echo "--- Container logs ---"
  docker logs "$NEW_CONTAINER_NAME" 2>&1 | tail -20
  docker stop "$NEW_CONTAINER_NAME" || true
  rm -f "$ENV_FILE"
  exit 1
fi

# Step 6: Switch kamal-proxy to new container
echo "--- Switching kamal-proxy to new container ---"
docker exec kamal-proxy kamal-proxy deploy psyfit-web \
  --target "${NEW_IP}:3000" --host psytech.jp

# Step 7: Verify through kamal-proxy
sleep 2
if curl -sf --max-time 5 -H "Host: psytech.jp" \
  "http://127.0.0.1:8080/api/v1/health" > /dev/null 2>&1; then
  echo "Production health check passed through kamal-proxy"

  # Stop old container
  if [ -n "$CURRENT_CONTAINER" ] && [ "$CURRENT_CONTAINER" != "$NEW_CONTAINER_NAME" ]; then
    echo "--- Stopping old container: ${CURRENT_CONTAINER} ---"
    docker stop "$CURRENT_CONTAINER" || true
  fi

  echo "=== Docker deployment successful ==="
else
  echo "ERROR: kamal-proxy health check failed after switch. Rolling back..."

  if [ -n "$CURRENT_CONTAINER" ]; then
    OLD_IP=$(docker inspect "$CURRENT_CONTAINER" \
      --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
    docker exec kamal-proxy kamal-proxy deploy psyfit-web \
      --target "${OLD_IP}:3000" --host psytech.jp
    echo "ROLLBACK: Reverted to ${CURRENT_CONTAINER}"
  fi

  docker stop "$NEW_CONTAINER_NAME" || true
  rm -f "$ENV_FILE"
  exit 1
fi

# Clean up env file (contains secrets)
rm -f "$ENV_FILE"

# ============================================================
# Phase 2: Systemd Puma Update (FALLBACK - best effort)
# ============================================================
echo "=== Phase 2: Systemd Puma Update (fallback) ==="
(
  # Install Ruby dependencies
  echo "--- Installing Ruby dependencies ---"
  bundle config set --local path vendor/bundle
  bundle config set --local without development:test
  bundle install

  # Build frontends
  echo "--- Building frontend_user ---"
  cd "$APP_DIR/frontend_user"
  npm ci
  npm run build

  echo "--- Building frontend_admin ---"
  cd "$APP_DIR/frontend_admin"
  npm ci
  npm run build

  # Copy frontend builds to Rails public/ directory
  echo "--- Copying frontend builds to public/ ---"
  cd "$APP_DIR"
  rm -rf "$APP_DIR/public/index.html" "$APP_DIR/public/assets/index-"*.js "$APP_DIR/public/assets/index-"*.css
  cp -r "$APP_DIR/frontend_user/dist/"* "$APP_DIR/public/"
  rm -rf "$APP_DIR/public/admin"
  mkdir -p "$APP_DIR/public/admin"
  cp -r "$APP_DIR/frontend_admin/dist/"* "$APP_DIR/public/admin/"

  # Run database migrations
  echo "--- Running database migrations ---"
  bundle exec rails db:migrate

  # Precompile assets
  echo "--- Precompiling assets ---"
  bundle exec rails assets:precompile 2>/dev/null || true

  # Restart Puma
  echo "--- Restarting Puma ---"
  systemctl restart psyfit-puma

  echo "=== Systemd Puma update complete ==="
) || echo "WARNING: Systemd Puma update failed (non-critical, Docker deployment is primary)"

# ============================================================
# Phase 3: Cleanup
# ============================================================
echo "=== Phase 3: Cleanup ==="

# Remove old stopped psyfit-web containers (keep the most recent one for rollback)
STOPPED_CONTAINERS=$(docker ps -a --filter "name=psyfit-web-" --filter "status=exited" \
  --format '{{.Names}}' | sort | head -n -1)
if [ -n "$STOPPED_CONTAINERS" ]; then
  echo "$STOPPED_CONTAINERS" | xargs -r docker rm || true
fi

# Remove dangling images
docker image prune -f || true

echo "=== Deployment complete (${DEPLOY_TIMESTAMP}) ==="
