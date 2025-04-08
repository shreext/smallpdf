FROM ubuntu:22.04
# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice curl gnupg

RUN curl -fsSL 
https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs
    
# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port and start the app
EXPOSE 3000
CMD ["node", "server.js"]
