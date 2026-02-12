#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/psyfit"
cd "$APP_DIR"

echo "=== Starting deployment ==="

# Load rbenv
eval "$(~/.rbenv/bin/rbenv init -)"

# Load environment variables
set -a
source "$APP_DIR/.env"
set +a

# Pull latest code
echo "--- Pulling latest code ---"
git pull origin main

# Install Ruby dependencies
echo "--- Installing Ruby dependencies ---"
bundle config set --local path vendor/bundle
bundle config set --local without development:test
bundle install

# Install frontend dependencies and build
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

# User SPA → public/ (root)
rm -rf "$APP_DIR/public/index.html" "$APP_DIR/public/assets/index-"*.js "$APP_DIR/public/assets/index-"*.css
cp -r "$APP_DIR/frontend_user/dist/"* "$APP_DIR/public/"

# Admin SPA → public/admin/
rm -rf "$APP_DIR/public/admin"
mkdir -p "$APP_DIR/public/admin"
cp -r "$APP_DIR/frontend_admin/dist/"* "$APP_DIR/public/admin/"

# Run database migrations
echo "--- Running database migrations ---"
bundle exec rails db:migrate

# Precompile assets (if any Rails assets)
echo "--- Precompiling assets ---"
bundle exec rails assets:precompile 2>/dev/null || true

# Restart Puma
echo "--- Restarting Puma ---"
systemctl restart psyfit-puma

echo "=== Deployment complete ==="
