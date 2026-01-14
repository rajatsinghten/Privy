from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.database import init_db

app = FastAPI(
    title="Privy API",
    version="1.0.0",
)

# 🚨 NUCLEAR CORS (FOR DEV ONLY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # ← NO guessing, allow EVERYTHING
    allow_credentials=False,      # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers AFTER middleware
app.include_router(router, prefix="/api")

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok"}
