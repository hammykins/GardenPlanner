from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from app.services.email_service import send_registration_email
import secrets
import time
import os

router = APIRouter()

# In-memory store for demo (replace with DB in production)
pending_registrations = {}

class RegisterRequest(BaseModel):
	email: EmailStr

@router.post("/auth/register")
async def register_user(data: RegisterRequest, request: Request):
	# Generate token
	token = secrets.token_urlsafe(32)
	pending_registrations[token] = {
		"email": data.email,
		"created": time.time()
	}
	# Build registration link (use frontend URL for user experience)
	frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
	registration_link = f"{frontend_url}/setup-password?token={token}"
	# Send email
	send_registration_email(data.email, registration_link)
	return {"message": f"Registration link sent to {data.email}"}


class SetupPasswordRequest(BaseModel):
	token: str
	username: str
	password: str

# GET endpoint for password setup link validation
@router.get("/auth/setup-password")
async def validate_setup_password(token: str):
	reg = pending_registrations.get(token)
	if not reg:
		raise HTTPException(400, "Invalid or expired registration token")
	return {"message": "Token valid", "email": reg["email"]}

from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from passlib.hash import bcrypt
from fastapi import Depends

@router.post("/auth/setup-password")
async def setup_password(data: SetupPasswordRequest, db: Session = Depends(get_db)):
	reg = pending_registrations.get(data.token)
	if not reg:
		raise HTTPException(400, "Invalid or expired registration token")
	# Check if username is taken
	if db.query(User).filter_by(username=data.username).first():
		raise HTTPException(400, "Username already taken")
	# Check if email is already registered
	if db.query(User).filter_by(email=reg["email"]).first():
		raise HTTPException(400, "Email already registered")
	# Hash password
	hashed_pw = bcrypt.hash(data.password)
	# Create user
	user = User(email=reg["email"], username=data.username, hashed_password=hashed_pw)
	db.add(user)
	db.commit()
	del pending_registrations[data.token]
	return {"message": "Password set successfully. You can now log in."}

class LoginRequest(BaseModel):
	username: str
	password: str

@router.post("/auth/login")
async def login_user(data: LoginRequest, db: Session = Depends(get_db)):
	if not data.username or not data.password:
		raise HTTPException(400, "Username and password required")
	user = db.query(User).filter_by(username=data.username).first()
	if not user or not user.hashed_password:
		raise HTTPException(401, "Invalid username or password")
	if not bcrypt.verify(data.password, user.hashed_password):
		raise HTTPException(401, "Invalid username or password")
	# For demo, return a mock token
	return {"message": "Login successful", "token": "mock-token", "username": user.username}
