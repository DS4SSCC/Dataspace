# Gebruik een officiële Python image
FROM python:3.11-slim

# Zorg dat Python geen .pyc files schrijft en output direct logt
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Werkdirectory in de container
WORKDIR /app

# Vereisten kopiëren en installeren
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Broncode kopiëren
COPY app.py /app/

# Expose de poort waarop Flask draait
EXPOSE 5000

# Start de Flask app
CMD ["python", "app.py"]