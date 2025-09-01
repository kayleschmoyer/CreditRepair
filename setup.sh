#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

install_git() {
  echo "Installing Git..."
  if command_exists brew; then
    brew install git
  elif command_exists apt-get; then
    sudo apt-get update && sudo apt-get install -y git
  else
    echo "Please install Git manually from https://git-scm.com/downloads" && exit 1
  fi
}

install_node() {
  echo "Installing Node.js..."
  if command_exists brew; then
    brew install node
  elif command_exists apt-get; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "Please install Node.js from https://nodejs.org/" && exit 1
  fi
}

install_docker() {
  echo "Installing Docker..."
  if command_exists brew; then
    brew install --cask docker
    echo "Docker Desktop installed. Please start it if it isn't running."
  elif command_exists apt-get; then
    sudo apt-get update && sudo apt-get install -y docker.io
    sudo systemctl start docker || true
  else
    echo "Please install Docker from https://docs.docker.com/get-docker/" && exit 1
  fi
}

install_supabase() {
  echo "Installing Supabase CLI..."
  if command_exists brew; then
    brew install supabase/tap/supabase
  else
    curl -sL https://supabase.com/cli/install | sh
    export PATH="/root/.supabase/bin:$PATH"
  fi
}

for dep in git node docker supabase; do
  if ! command_exists $dep; then
    install_$dep
  fi
 done

if ! docker info >/dev/null 2>&1; then
  echo "Docker does not appear to be running. If you're on Mac or Windows, open Docker Desktop and try again."
  exit 1
fi

supabase start

supabase storage create-bucket reports || true
supabase storage create-bucket letters || true

STATUS=$(supabase status)
API_URL=$(echo "$STATUS" | grep 'API URL' | awk '{print $3}')
ANON_KEY=$(echo "$STATUS" | grep 'anon key' | awk '{print $3}')
SERVICE_KEY=$(echo "$STATUS" | grep 'service_role key' | awk '{print $3}')
DB_URL=$(echo "$STATUS" | grep 'DB URL' | awk '{print $3}')

cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
ENV

export SUPABASE_DB_URL=$DB_URL

npm run db:apply
npm run db:seed

supabase functions serve --env-file .env.local >/dev/null 2>&1 &
FUNC_PID=$!

npm install
npm run dev &
DEV_PID=$!

sleep 5
if command_exists xdg-open; then
  xdg-open http://localhost:3000 >/dev/null 2>&1 || true
elif command_exists open; then
  open http://localhost:3000 >/dev/null 2>&1 || true
fi

wait $DEV_PID
kill $FUNC_PID
