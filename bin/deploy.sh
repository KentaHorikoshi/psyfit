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
bundle install --deployment --without development test

# Install frontend dependencies and build
echo "--- Building frontend_user ---"
cd "$APP_DIR/frontend_user"
npm ci
npm run build

echo "--- Building frontend_admin ---"
cd "$APP_DIR/frontend_admin"
npm ci
npm run build

cd "$APP_DIR"

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
