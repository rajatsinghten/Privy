# Privy Backend

Privacy-focused data access API built with FastAPI.

## Setup

### Local Development

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Docker

```bash
docker build -t privy-server .
docker run -p 8000:8000 privy-server
```

## Project Structure

```
server/
├── app/
│   ├── main.py           # FastAPI app initialization
│   ├── api/
│   │   └── routes.py     # API endpoint definitions
│   ├── core/
│   │   ├── config.py     # Application configuration
│   │   └── security.py   # Security utilities
│   ├── services/
│   │   ├── policy_engine.py    # Policy evaluation
│   │   ├── risk_engine.py      # Risk assessment
│   │   └── consent_manager.py  # Consent management
│   ├── models/
│   │   └── audit_log.py  # Data models
│   └── schemas/
│       └── request_schema.py   # Pydantic schemas
├── requirements.txt
├── Dockerfile
└── README.md
```
