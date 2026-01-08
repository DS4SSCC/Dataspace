# Inzichtverlicht

Kleine CKAN listing.

## Inhoud
- `app.py` — Flask-applicatie (HTTP server, standaard poort 5000).
- `requirements.txt` — Python dependencies.
- `Dockerfile` — Docker image configuratie voor de applicatie.

## Vereisten
- Python 3.8+ (voor lokaal draaien)
- Docker (optioneel, voor containerized run)

## Lokaal draaien (virtuele omgeving)

1. Maak en activeer een virtuele omgeving:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Installeer dependencies:

```bash
pip install -r requirements.txt
```

3. Start de server:

```bash
python app.py
```

De server luistert standaard op poort `5000`.

## Met Docker

Build image:

```bash
docker build -t inzichtverlicht-flask .
```

Run container (poort doorkoppelen):

```bash
docker run -p 5000:5000 inzichtverlicht-flask
```
