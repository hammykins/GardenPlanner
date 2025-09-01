FROM node:18.17.1-slim

# Set working directory
WORKDIR /app

# Add node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package files
COPY package.json ./
COPY package-lock.json* yarn.lock* ./

# Install dependencies with specific npm version
RUN npm install -g npm@9.8.1 && \
    npm ci --only=production --silent && \
    npm cache clean --force

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
