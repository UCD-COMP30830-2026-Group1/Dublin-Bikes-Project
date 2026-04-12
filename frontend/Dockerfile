# Runtime Environment: Use the lightest Nginx directly due to compile at local env
FROM nginx:stable-alpine

# Copy the dist folder generated after running `npm run build` on local machine into this directory
COPY ./dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]