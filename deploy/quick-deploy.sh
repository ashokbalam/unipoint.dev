#!/bin/bash
# quick-deploy.sh - Simple deployment script for unipoint.dev
# Run this script from the project root directory to quickly deploy the application

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored status messages
print_status() {
  echo -e "${BLUE}>>> $1${NC}"
}

print_success() {
  echo -e "${GREEN}>>> $1${NC}"
}

print_error() {
  echo -e "${RED}>>> ERROR: $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}>>> WARNING: $1${NC}"
}

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
  print_error "This script must be run from the project root directory (where docker-compose.yml is located)"
  exit 1
fi

# Check prerequisites
check_prerequisites() {
  print_status "Checking prerequisites..."
  
  # Check if git is installed
  if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
  fi
  
  # Check if docker is installed
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
  fi
  
  # Check if docker-compose is installed
  if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed as a standalone command."
    # Check if docker compose (v2) is available
    if ! docker compose version &> /dev/null; then
      print_error "Docker Compose is not available. Please install Docker Compose first."
      exit 1
    else
      print_status "Using Docker Compose v2 plugin."
      # Set an alias for the rest of the script
      shopt -s expand_aliases
      alias docker-compose='docker compose'
    fi
  fi
  
  print_success "All prerequisites are met."
}

# Pull latest code from git repository
pull_latest_code() {
  print_status "Pulling latest code from repository..."
  
  # Check if .git directory exists
  if [ ! -d ".git" ]; then
    print_error "This doesn't appear to be a git repository. Cannot pull latest code."
    exit 1
  fi
  
  # Get current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  
  # Pull latest changes
  if ! git pull origin $CURRENT_BRANCH; then
    print_error "Failed to pull latest code. Check your internet connection and git configuration."
    exit 1
  fi
  
  # Get current commit hash for logging
  CURRENT_COMMIT=$(git rev-parse HEAD)
  print_success "Code updated successfully to commit: ${CURRENT_COMMIT:0:8}"
}

# Stop running containers
stop_containers() {
  print_status "Stopping running containers..."
  
  if ! docker-compose down; then
    print_error "Failed to stop containers. Check docker service status."
    exit 1
  fi
  
  print_success "Containers stopped successfully."
}

# Build and start containers
build_and_start() {
  print_status "Building and starting containers..."
  
  if ! docker-compose up --build -d; then
    print_error "Failed to build and start containers. Check the error messages above."
    exit 1
  fi
  
  print_success "Containers built and started successfully."
}

# Show container status
show_status() {
  print_status "Container status:"
  docker-compose ps
  
  # Check if containers are running
  if [ "$(docker-compose ps -q | wc -l)" -eq 0 ]; then
    print_error "No containers are running. Deployment may have failed."
    exit 1
  fi
  
  # Get public IP address (if on EC2)
  PUBLIC_IP=$(curl -s -m 5 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
  
  print_status "Deployment completed successfully!"
  echo ""
  echo "-----------------------------------------------------------"
  echo "🎉 unipoint.dev is now running! Access it at:"
  echo ""
  echo "  Frontend: http://${PUBLIC_IP}"
  echo "  Backend API: http://${PUBLIC_IP}:4000"
  echo ""
  echo "To view logs:"
  echo "  docker-compose logs -f"
  echo ""
  echo "To stop the application:"
  echo "  docker-compose down"
  echo "-----------------------------------------------------------"
}

# Main function
main() {
  print_status "Starting quick deployment of unipoint.dev..."
  
  check_prerequisites
  pull_latest_code
  stop_containers
  build_and_start
  show_status
}

# Run the main function
main
