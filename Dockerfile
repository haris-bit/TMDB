# Use the official Python base image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the container
COPY . .

# Set the command to run the application
CMD ["python", "app.py"]
