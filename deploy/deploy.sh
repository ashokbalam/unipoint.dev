#!/bin/bash

# deploy.sh - Deployment script for unipoint.dev application on EC2
# This script automates the deployment process of the unipoint.dev application

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration
APP_NAME="unipoint"
APP_DIR="/opt/unipoint"
REPO_URL="https://github.com/ashokbalam/unipoint.dev.git"
BACKUP_DIR="${APP_DIR}/backups"
LOG_DIR="${APP_DIR}/logs"
ENV_FILE="${APP_DIR}/.env"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_LOG="${LOG_DIR}/deployment_${TIMESTAMP}.log"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=5

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
  local level=$1
  local message=$2
  local color=$NC
  
  case $level in
    "INFO") color=$BLUE ;;
    "SUCCESS") color=$GREEN ;;
    "WARNING") color=$YELLOW ;;
    "ERROR") color=$RED ;;
  esac
  
  echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${message}${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
  log "INFO" "Checking prerequisites..."
  
  # Check if docker is installed
  if ! command_exists docker; then
    log "ERROR" "Docker is not installed. Please run setup-server.sh first."
    exit 1
  fi
  
  # Check if docker-compose is installed
  if ! command_exists docker-compose; then
    log "ERROR" "Docker Compose is not installed. Please run setup-server.sh first."
    exit 1
  fi
  
  # Check if git is installed
  if ! command_exists git; then
    log "ERROR" "Git is not installed. Please run setup-server.sh first."
    exit 1
  fi
  
  log "SUCCESS" "All prerequisites are met."
}

# Function to create necessary directories
create_directories() {
  log "INFO" "Creating necessary directories..."
  
  mkdir -p "${APP_DIR}"
  mkdir -p "${BACKUP_DIR}"
  mkdir -p "${LOG_DIR}"
  
  log "SUCCESS" "Directories created successfully."
}

# Function to set up log rotation
setup_log_rotation() {
  log "INFO" "Setting up log rotation..."
  
  # Create logrotate configuration file
  cat > /etc/logrotate.d/unipoint << EOF
${LOG_DIR}/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 0640 root root
}
EOF
  
  log "SUCCESS" "Log rotation set up successfully."
}

# Function to handle environment variables
setup_environment_variables() {
  log "INFO" "Setting up environment variables..."
  
  # Check if .env file exists
  if [ ! -f "${ENV_FILE}" ]; then
    log "INFO" "Creating default .env file..."
    
    # Create default .env file with database configuration
    cat > "${ENV_FILE}" << EOF
# Database Configuration
DB_HOST=unipoint-db.clg8clb9ersw.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=unipoint_user
DB_PASSWORD=unipoint_pass
DB_DATABASE=unipoint_db

# Application Configuration
NODE_ENV=production
EOF
    
    log "WARNING" "Default .env file created. Please update with your actual credentials."
  else
    log "INFO" "Using existing .env file."
  fi
  
  # Source the environment variables
  set -a
  source "${ENV_FILE}"
  set +a
  
  log "SUCCESS" "Environment variables set up successfully."
}

# Function to pull the latest code from git repository
pull_latest_code() {
  log "INFO" "Pulling latest code from repository..."
  
  if [ ! -d "${APP_DIR}/repo" ]; then
    log "INFO" "Cloning repository..."
    git clone "${REPO_URL}" "${APP_DIR}/repo"
  else
    log "INFO" "Repository already exists. Updating..."
    cd "${APP_DIR}/repo"
    git fetch --all
    git reset --hard origin/main
  fi
  
  cd "${APP_DIR}/repo"
  CURRENT_COMMIT=$(git rev-parse HEAD)
  log "INFO" "Current commit: ${CURRENT_COMMIT}"
  
  log "SUCCESS" "Code updated successfully."
}

# Function to create a backup of the current deployment
create_backup() {
  log "INFO" "Creating backup of current deployment..."
  
  if [ -d "${APP_DIR}/repo" ]; then
    BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
    tar -czf "${BACKUP_FILE}" -C "${APP_DIR}" repo
    log "SUCCESS" "Backup created successfully: ${BACKUP_FILE}"
  else
    log "WARNING" "No existing deployment to backup."
  fi
}

# Function to stop running containers
stop_containers() {
  log "INFO" "Stopping running containers..."
  
  if [ -f "${APP_DIR}/repo/docker-compose.yml" ]; then
    cd "${APP_DIR}/repo"
    docker-compose down
    log "SUCCESS" "Containers stopped successfully."
  else
    log "WARNING" "docker-compose.yml not found. No containers to stop."
  fi
}

# Function to build and start the application
build_and_start() {
  log "INFO" "Building and starting the application..."
  
  if [ -f "${APP_DIR}/repo/docker-compose.yml" ]; then
    cd "${APP_DIR}/repo"
    
    # Copy environment variables to the repository directory
    cp "${ENV_FILE}" "${APP_DIR}/repo/.env"
    
    # Build and start containers
    docker-compose up --build -d
    
    log "SUCCESS" "Application built and started successfully."
  else
    log "ERROR" "docker-compose.yml not found. Cannot start application."
    exit 1
  fi
}

# Function to check the health of services
check_health() {
  log "INFO" "Checking health of services..."
  
  # Check if backend service is running
  for i in $(seq 1 ${HEALTH_CHECK_RETRIES}); do
    log "INFO" "Checking backend service (attempt ${i}/${HEALTH_CHECK_RETRIES})..."
    
    if curl -s http://localhost:4000 > /dev/null; then
      log "SUCCESS" "Backend service is up and running."
      backend_healthy=true
      break
    else
      log "WARNING" "Backend service is not responding yet."
      sleep ${HEALTH_CHECK_INTERVAL}
    fi
  done
  
  if [ -z "${backend_healthy}" ]; then
    log "ERROR" "Backend service health check failed after ${HEALTH_CHECK_RETRIES} attempts."
    show_logs
    prompt_rollback
    exit 1
  fi
  
  # Check if frontend service is running
  for i in $(seq 1 ${HEALTH_CHECK_RETRIES}); do
    log "INFO" "Checking frontend service (attempt ${i}/${HEALTH_CHECK_RETRIES})..."
    
    if curl -s http://localhost:80 > /dev/null; then
      log "SUCCESS" "Frontend service is up and running."
      frontend_healthy=true
      break
    else
      log "WARNING" "Frontend service is not responding yet."
      sleep ${HEALTH_CHECK_INTERVAL}
    fi
  done
  
  if [ -z "${frontend_healthy}" ]; then
    log "ERROR" "Frontend service health check failed after ${HEALTH_CHECK_RETRIES} attempts."
    show_logs
    prompt_rollback
    exit 1
  fi
  
  log "SUCCESS" "All services are healthy."
}

# Function to show logs for troubleshooting
show_logs() {
  log "INFO" "Showing logs for troubleshooting..."
  
  if [ -f "${APP_DIR}/repo/docker-compose.yml" ]; then
    cd "${APP_DIR}/repo"
    
    log "INFO" "Backend logs:"
    docker-compose logs --tail=100 backend
    
    log "INFO" "Frontend logs:"
    docker-compose logs --tail=100 frontend
  else
    log "WARNING" "docker-compose.yml not found. Cannot show logs."
  fi
}

# Function to set up monitoring
setup_monitoring() {
  log "INFO" "Setting up monitoring..."
  
  # Create a simple monitoring script
  cat > "${APP_DIR}/monitor.sh" << 'EOF'
#!/bin/bash

APP_DIR="/opt/unipoint"
LOG_DIR="${APP_DIR}/logs"
MONITOR_LOG="${LOG_DIR}/monitor.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running health check..." >> "${MONITOR_LOG}"

# Check backend health
if ! curl -s http://localhost:4000 > /dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] Backend service is down!" >> "${MONITOR_LOG}"
  
  # Send email alert (customize as needed)
  # mail -s "ALERT: unipoint backend service is down" admin@example.com < "${MONITOR_LOG}"
  
  # Attempt to restart
  cd "${APP_DIR}/repo" && docker-compose restart backend
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backend service is up." >> "${MONITOR_LOG}"
fi

# Check frontend health
if ! curl -s http://localhost:80 > /dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] Frontend service is down!" >> "${MONITOR_LOG}"
  
  # Send email alert (customize as needed)
  # mail -s "ALERT: unipoint frontend service is down" admin@example.com < "${MONITOR_LOG}"
  
  # Attempt to restart
  cd "${APP_DIR}/repo" && docker-compose restart frontend
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Frontend service is up." >> "${MONITOR_LOG}"
fi
EOF
  
  chmod +x "${APP_DIR}/monitor.sh"
  
  # Set up cron job to run monitoring script every 5 minutes
  (crontab -l 2>/dev/null; echo "*/5 * * * * ${APP_DIR}/monitor.sh") | crontab -
  
  log "SUCCESS" "Monitoring set up successfully."
}

# Function to roll back to a previous deployment
rollback() {
  log "WARNING" "Rolling back to previous deployment..."
  
  # List available backups
  log "INFO" "Available backups:"
  ls -lt "${BACKUP_DIR}" | grep -v total | head -n 5
  
  # Prompt for backup selection
  read -p "Enter backup file name to restore (or 'latest' for most recent): " backup_file
  
  if [ "${backup_file}" == "latest" ]; then
    backup_file=$(ls -t "${BACKUP_DIR}" | head -n 1)
  fi
  
  if [ ! -f "${BACKUP_DIR}/${backup_file}" ]; then
    log "ERROR" "Backup file not found: ${backup_file}"
    exit 1
  fi
  
  # Stop current containers
  stop_containers
  
  # Remove current repo
  rm -rf "${APP_DIR}/repo"
  
  # Extract backup
  log "INFO" "Extracting backup: ${backup_file}..."
  tar -xzf "${BACKUP_DIR}/${backup_file}" -C "${APP_DIR}"
  
  # Start containers from backup
  cd "${APP_DIR}/repo"
  docker-compose up -d
  
  log "SUCCESS" "Rollback completed successfully."
}

# Function to prompt for rollback on failure
prompt_rollback() {
  log "WARNING" "Deployment encountered issues."
  read -p "Do you want to roll back to the previous deployment? (y/n): " choice
  
  if [ "${choice}" == "y" ] || [ "${choice}" == "Y" ]; then
    rollback
  else
    log "WARNING" "Continuing without rollback. Application may not be functioning correctly."
  fi
}

# Function to show status and access information
show_status() {
  log "INFO" "Deployment Status:"
  
  # Check if containers are running
  cd "${APP_DIR}/repo"
  docker-compose ps
  
  # Get public IP address
  PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
  
  log "INFO" "Access Information:"
  log "INFO" "Frontend URL: http://${PUBLIC_IP}"
  log "INFO" "Backend API URL: http://${PUBLIC_IP}:4000"
  log "INFO" "Deployment Log: ${DEPLOYMENT_LOG}"
}

# Main deployment process
main() {
  log "INFO" "Starting deployment of ${APP_NAME}..."
  
  # Check prerequisites
  check_prerequisites
  
  # Create necessary directories
  create_directories
  
  # Set up log rotation
  setup_log_rotation
  
  # Handle environment variables
  setup_environment_variables
  
  # Create backup of current deployment
  create_backup
  
  # Pull latest code
  pull_latest_code
  
  # Stop running containers
  stop_containers
  
  # Build and start the application
  build_and_start
  
  # Check health of services
  check_health
  
  # Set up monitoring
  setup_monitoring
  
  # Show status and access information
  show_status
  
  log "SUCCESS" "Deployment completed successfully!"
}

# Parse command line arguments
case "$1" in
  rollback)
    rollback
    ;;
  logs)
    show_logs
    ;;
  status)
    show_status
    ;;
  *)
    main
    ;;
esac

exit 0
