# Use the official Python base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY vote.py .

# Set the environment variables for MariaDB connection
ENV DB_HOST=localhost
ENV DB_USER=admin
ENV DB_PASSWORD=admin
ENV DB_DATABASE=votingapp
ENV MY_ROOT_PASSWORD=admin123

# Set the command to run the Python application
CMD ["python", "vote.py"]
