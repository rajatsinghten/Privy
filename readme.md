# Privy - Privacy-Aware API Gateway

A context-aware privacy enforcement engine that evaluates every data access request in real-time with comprehensive policy enforcement, risk assessment, and consent management.

## 🎯 Features

- **Privacy-Aware API Gateway**: Real-time access control for data requests
- **Policy Engine**: Rule-based enforcement for purpose limitation, jurisdiction constraints, and role-based access
- **Risk Engine**: Heuristic-based risk scoring (0-1 scale) with configurable thresholds
- **Consent Manager**: User consent storage and validation
- **Audit Logger**: Complete audit trail of all requests with PostgreSQL persistence
- **JWT Authentication**: Token-based authentication with role-based access control
- **PostgreSQL Database**: Persistent storage using SQLAlchemy ORM

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/JSON + JWT
       ▼
┌─────────────────────────────────────┐
│     API Gateway (FastAPI)           │
│  ┌───────────────────────────────┐  │
│  │   JWT Authentication          │  │
│  └───────────────────────────────┘  │
│            ▼                         │
│  ┌───────────────────────────────┐  │
│  │    Policy Engine              │  │
│  │  • Purpose validation         │  │
│  │  • Role checking              │  │
│  │  • Jurisdiction rules         │  │
│  └───────────────────────────────┘  │
│            ▼                         │
│  ┌───────────────────────────────┐  │
│  │    Consent Manager            │  │
│  │  • Check user consent         │  │
│  └───────────────────────────────┘  │
│            ▼                         │
│  ┌───────────────────────────────┐  │
│  │    Risk Engine                │  │
│  │  • Calculate risk score       │  │
│  └───────────────────────────────┘  │
│            ▼                         │
│  ┌───────────────────────────────┐  │
│  │    Audit Logger               │  │
│  │  • Log to PostgreSQL          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              ▼
      ┌──────────────┐
      │  PostgreSQL  │
      │   Database   │
      └──────────────┘
```

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Docker Compose

### Start the Application

```bash
# Clone or navigate to the project directory
cd Privy

# Start all services
docker compose up -d

# Verify services are running
docker compose ps

# View logs
docker compose logs -f
```

The application will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Frontend**: http://localhost:3000

### Stop the Application

```bash
docker compose down
```

## 🔐 Authentication

### Test Users

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | admin | Full access to all resources |
| analyst | analyst123 | analyst | Analytics, research, reporting (US/EU/UK) |
| external | external123 | external | Reporting only (US only, low sensitivity) |

### Login Example

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "admin"
}
```

## 📡 API Endpoints

### 1. Health Check

**GET /api/health**

```bash
curl http://localhost:8000/api/health
```

### 2. Request Data Access

**POST /api/request-data** (Requires Authentication)

Evaluates a data access request through policy, consent, and risk engines.

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Make data access request
curl -X POST http://localhost:8000/api/request-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requester_id": "user_123",
    "role": "analyst",
    "purpose": "analytics",
    "location": "US",
    "data_sensitivity": "medium"
  }'
```

**Response:**
```json
{
  "decision": "ALLOW",
  "reason": "All checks passed: policy compliant, consent granted, risk acceptable",
  "risk_score": 0.425,
  "timestamp": "2026-01-14T10:30:00.000Z",
  "policy_checks": {
    "allowed": true,
    "reason": "All policy checks passed",
    "checks": {
      "role_valid": true,
      "purpose_allowed": true,
      "jurisdiction_allowed": true,
      "sensitivity_allowed": true
    }
  },
  "consent_status": {
    "has_consent": true,
    "reason": "Consent granted for purpose: analytics",
    "granted_purposes": ["analytics", "research", "reporting"]
  }
}
```

### 3. Get Audit Logs

**GET /api/audit-logs** (Admin Only)

Retrieve audit logs with filtering options.

**Query Parameters:**
- `limit`: Maximum number of logs (default: 100, max: 1000)
- `offset`: Number of logs to skip (default: 0)
- `requester_id`: Filter by requester ID
- `decision`: Filter by decision (ALLOW/DENY)

```bash
curl -X GET "http://localhost:8000/api/audit-logs?limit=10&decision=DENY" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Audit Statistics

**GET /api/audit-logs/stats** (Admin Only)

```bash
curl -X GET http://localhost:8000/api/audit-logs/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "total_requests": 150,
  "allowed": 120,
  "denied": 30,
  "allow_rate": 0.8
}
```

## 🧪 Testing Guide

### Test Scenario 1: Successful Request (ALLOW)

User has consent, passes policy, acceptable risk.

```bash
curl -X POST http://localhost:8000/api/request-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requester_id": "user_123",
    "role": "analyst",
    "purpose": "analytics",
    "location": "US",
    "data_sensitivity": "medium"
  }'
```

✅ Expected: **ALLOW** - Has consent, policy compliant, low-medium risk

### Test Scenario 2: Policy Violation (DENY)

External role attempting to access high sensitivity data.

```bash
curl -X POST http://localhost:8000/api/request-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requester_id": "user_123",
    "role": "external",
    "purpose": "analytics",
    "location": "US",
    "data_sensitivity": "high"
  }'
```

❌ Expected: **DENY** - External role cannot access high sensitivity data

### Test Scenario 3: No Consent (DENY)

Unknown user without consent.

```bash
curl -X POST http://localhost:8000/api/request-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requester_id": "user_999",
    "role": "analyst",
    "purpose": "analytics",
    "location": "US",
    "data_sensitivity": "low"
  }'
```

❌ Expected: **DENY** - No consent found for user_999

### Test Scenario 4: High Risk (DENY)

Multiple high-risk factors combined.

```bash
curl -X POST http://localhost:8000/api/request-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requester_id": "user_123",
    "role": "external",
    "purpose": "marketing",
    "location": "GLOBAL",
    "data_sensitivity": "high"
  }'
```

❌ Expected: **DENY** - Risk score exceeds threshold (>0.7)

### View Audit Logs

```bash
curl -X GET "http://localhost:8000/api/audit-logs?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## 📋 Policy Rules

### Valid Purposes
- `analytics`, `research`, `compliance`, `audit`, `reporting`, `operational`, `marketing`, `security`

### Valid Jurisdictions
- `US`, `EU`, `UK`, `APAC`, `LATAM`, `GLOBAL`

### Role-Based Permissions

**Admin:**
- ✅ All purposes allowed
- ✅ All jurisdictions allowed
- ✅ Can access high sensitivity data

**Analyst:**
- ✅ Purposes: analytics, research, reporting
- ✅ Jurisdictions: US, EU, UK
- ✅ Max sensitivity: medium

**External:**
- ✅ Purposes: reporting only
- ✅ Jurisdictions: US only
- ✅ Max sensitivity: low

## ⚖️ Risk Engine

### Risk Factors (Weighted)

| Factor | Weight | Values |
|--------|--------|--------|
| **Role** | 25% | admin=0.1, analyst=0.3, external=0.7 |
| **Data Sensitivity** | 35% | low=0.1, medium=0.5, high=0.9 |
| **Purpose** | 25% | audit=0.1, marketing=0.8 |
| **Jurisdiction** | 15% | US/EU/UK=0.2, GLOBAL=0.6 |

**Risk Threshold:** 0.7 (configurable via `RISK_THRESHOLD` env variable)

Requests with `risk_score > 0.7` are automatically denied.

## 🎫 Consent Manager

### Pre-configured Consents

| User ID | Granted Purposes |
|---------|------------------|
| user_123 | analytics, research, reporting |
| user_456 | operational, security, audit |
| user_789 | compliance, audit |

Requests are denied if:
- No consent found for requester
- Requested purpose not in granted consents
- Consent has expired

## 🛠️ Development Setup

### Local Development (Without Docker)

**Prerequisites:**
- Python 3.11+
- PostgreSQL 15+
- Node.js 18+ (for frontend)

**Backend Setup:**

```bash
cd server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL
psql postgres -c "CREATE DATABASE privy_db;"
psql postgres -c "CREATE USER privy_user WITH PASSWORD 'privy_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE privy_db TO privy_user;"

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**

```bash
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create `.env` file in server directory:

```env
DATABASE_URL=postgresql://privy_user:privy_password@localhost:5432/privy_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RISK_THRESHOLD=0.7
```

## 📁 Project Structure

```
Privy/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   └── api/            # API client
│   ├── Dockerfile
│   └── package.json
├── server/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── api/
│   │   │   └── routes.py   # API endpoints
│   │   ├── core/
│   │   │   ├── config.py   # Configuration
│   │   │   ├── database.py # Database setup
│   │   │   └── security.py # JWT authentication
│   │   ├── models/
│   │   │   └── audit_log.py # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── request_schema.py # Pydantic schemas
│   │   └── services/
│   │       ├── policy_engine.py
│   │       ├── risk_engine.py
│   │       ├── consent_manager.py
│   │       └── audit_logger.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml       # Docker Compose configuration
├── LICENSE
└── README.md
```

## 🐳 Docker Configuration

### Services

**postgres** (PostgreSQL 15)
- Port: 5432
- Database: privy_db
- User: privy_user
- Health checks enabled

**server** (FastAPI)
- Port: 8000
- Depends on postgres
- Auto-restart enabled

**client** (React + Vite)
- Port: 3000
- Development server with HMR

### Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs server
docker compose logs postgres

# Restart a service
docker compose restart server

# Rebuild and restart
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database)
docker compose down -v

# Check service status
docker compose ps

# Execute command in container
docker compose exec server python -c "print('Hello')"
```

## 🔍 Troubleshooting

### Issue: Port already in use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
docker compose down
# Edit docker-compose.yml to change port mapping
docker compose up -d
```

### Issue: Database connection failed

```bash
# Check postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Issue: Authentication fails

```bash
# Rebuild server with fresh code
docker compose up -d --build server

# Check password hashes are correct
docker compose exec server python -c "
from app.api.routes import MOCK_USERS
print(MOCK_USERS)
"
```

### Issue: Old code changes not reflecting

```bash
# Force rebuild without cache
docker compose build --no-cache
docker compose up -d
```

## 📊 Database Schema

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    requester_id VARCHAR(255) NOT NULL,
    requester_role VARCHAR(50) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    data_sensitivity VARCHAR(50),
    decision VARCHAR(50) NOT NULL,
    reason TEXT,
    risk_score FLOAT NOT NULL,
    request_metadata JSONB
);

CREATE INDEX idx_requester_id ON audit_logs(requester_id);
CREATE INDEX idx_decision ON audit_logs(decision);
CREATE INDEX idx_timestamp ON audit_logs(timestamp);
```

## 🚀 Production Considerations

### Security
- ✅ Change default `SECRET_KEY` in production
- ✅ Use strong passwords for database
- ✅ Enable HTTPS/TLS
- ✅ Implement rate limiting
- ✅ Add input validation
- ✅ Use environment-specific configs

### Database
- ✅ Use connection pooling
- ✅ Set up automated backups
- ✅ Create proper indexes
- ✅ Monitor query performance
- ✅ Use read replicas for scaling

### Monitoring
- ✅ Add structured logging
- ✅ Set up error tracking (e.g., Sentry)
- ✅ Monitor API performance metrics
- ✅ Set up alerts for failures
- ✅ Track audit log growth

### Scalability
- ✅ Use async database drivers
- ✅ Implement caching (Redis)
- ✅ Consider horizontal scaling
- ✅ Use load balancer
- ✅ Implement message queues for async tasks

## 📝 License

See LICENSE file in project root.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on the repository.
