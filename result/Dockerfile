# Use the official Node.js base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the application code into the container
COPY result.js .

# Set the environment variables for MariaDB connection
ENV DB_HOST=localhost
ENV DB_USER=admin
ENV DB_PASSWORD=admin
ENV DB_DATABASE=votingapp
ENV MY_ROOT_PASSWORD=admin123


# Set the command to run the Node.js application
CMD ["node", "result.js"]
