# Use official Node.js image (small Alpine Linux)
FROM node:22-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy only package files first (better for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Now copy the rest of the app code
COPY . .

# The app listens on port 3000
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
