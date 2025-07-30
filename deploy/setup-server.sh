#!/bin/bash

# setup-server.sh - Setup script for unipoint.dev application on EC2
# This script installs all dependencies required to run the application
# Works on Amazon Linux 2023 and Ubuntu systems

set -e  # Exit immediately if a command exits with a non-zero status

# Print colored status messages
print_status() {
  echo -e "\e[1;34m>>> $1\e[0m"
}

print_success() {
  echo -e "\e[1;32m>>> $1\e[0m"
}

print_error() {
  echo -e "\e[1;31m>>> $1\e[0m"
}

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$NAME
else
  print_error "Cannot detect OS"
  exit 1
fi

print_status "Detected OS: $OS"

# Update system packages
print_status "Updating system packages..."
if [[ "$OS" == *"Ubuntu"* ]]; then
  apt-get update -y
  apt-get upgrade -y
elif [[ "$OS" == *"Amazon Linux"* ]]; then
  yum update -y
else
  print_error "Unsupported OS: $OS"
  exit 1
fi
print_success "System packages updated successfully"

# Install useful utilities
print_status "Installing useful utilities..."
if [[ "$OS" == *"Ubuntu"* ]]; then
  apt-get install -y htop wget curl unzip vim git
elif [[ "$OS" == *"Amazon Linux"* ]]; then
  yum install -y htop wget curl unzip vim git
fi
print_success "Utilities installed successfully"

# Install Docker
print_status "Installing Docker..."
if [[ "$OS" == *"Ubuntu"* ]]; then
  apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
  add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io
elif [[ "$OS" == *"Amazon Linux"* ]]; then
  yum install -y docker
fi

# Start and enable Docker service
systemctl start docker
systemctl enable docker
print_success "Docker installed and enabled successfully"

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="v2.23.3"
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
print_success "Docker Compose installed successfully"

# Add current user to docker group
print_status "Adding current user to docker group..."
usermod -aG docker $USER
print_success "User added to docker group"

# Install Node.js and npm
print_status "Installing Node.js and npm..."
if [[ "$OS" == *"Ubuntu"* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
elif [[ "$OS" == *"Amazon Linux"* ]]; then
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  yum install -y nodejs
fi
print_success "Node.js and npm installed successfully"

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/unipoint
print_success "Application directory created at /opt/unipoint"

# Set up firewall if needed
print_status "Setting up firewall rules..."
if [[ "$OS" == *"Ubuntu"* ]]; then
  apt-get install -y ufw
  ufw allow ssh
  ufw allow http
  ufw allow https
  ufw allow 4000/tcp
  ufw --force enable
elif [[ "$OS" == *"Amazon Linux"* ]]; then
  # Amazon Linux uses security groups for firewall, so we'll just check if ports are accessible
  print_status "Amazon Linux uses security groups for firewall. Please ensure ports 22, 80, 443, and 4000 are open in your EC2 security group."
fi
print_success "Firewall rules set up successfully"

# Create a directory for deployment scripts
print_status "Creating deployment scripts directory..."
mkdir -p /opt/unipoint/deploy
print_success "Deployment scripts directory created"

print_success "Server setup completed successfully!"
print_status "Please log out and log back in for docker group membership to take effect."
print_status "Next steps: Clone your repository and run the deployment script."
