# 1. Use a lightweight Python base image (Slim version)
FROM python:3.11-slim

# 2. Set the timezone to Dublin time
# Install tzdata and set the timezone
RUN apt-get update && apt-get install -y tzdata \
    && ln -fs /usr/share/zoneinfo/Europe/Dublin /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy the dependency manifest and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all code in the current directory into the container.
COPY . .

# 6. Set environment variables to ensure Python output is printed directly to the log and not cached.
ENV PYTHONUNBUFFERED=1

# 7. Default command (will be overridden by docker-compose)
CMD ["python", "data_scripts/automation/2_scraper_bikes.py"]