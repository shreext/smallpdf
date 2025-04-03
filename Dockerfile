FROM node:16

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port and start the app
EXPOSE 5000
CMD ["node", "server.js"]
