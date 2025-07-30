FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

######################################################################
# Runtime stage – serve the built app with production-grade Nginx
######################################################################
FROM nginx:1.25-alpine as runtime

# Install extra Nginx modules required by the production config
# (e.g., headers_more for additional security headers management)
RUN apk add --no-cache nginx-mod-http-headers-more

# Copy built static files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# -------------------------------------------------------------------
# Configure Nginx for a Single-Page Application (SPA)
# -------------------------------------------------------------------
# Remove the default config shipped with the base image
RUN rm /etc/nginx/conf.d/default.conf
# Add a minimal production config that:
#   • Serves static files from /usr/share/nginx/html
#   • Falls back to index.html for client-side routing
#   • Sends reasonable cache headers for JS/CSS assets
RUN printf '%s\n' \
  'server {' \
  '    listen 80 default_server;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '' \
  '    # Try to serve file directly, fallback to index.html' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '' \
  '    # Cache static assets for 30 days' \
  '    location ~* \.(?:js|css|ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$ {' \
  '        expires 30d;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '}' \
  > /etc/nginx/conf.d/unipoint.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]