
import requests
import os
from dotenv import load_dotenv
load_dotenv()

BREVO_API_KEY = os.getenv('BREVO_API_KEY')
BREVO_FROM_EMAIL = os.getenv('BREVO_FROM_EMAIL', 'noreply@milkymoods.com')
BREVO_FROM_NAME = os.getenv('BREVO_FROM_NAME', 'Garden Planner')

BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

def send_registration_email(to_email: str, registration_link: str):
    # Debug print to verify API key loaded
    masked_key = (BREVO_API_KEY[:8] + '...' if BREVO_API_KEY else 'None')
    print(f"[DEBUG] Using Brevo API key: {masked_key}")
    headers = {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    data = {
        'sender': {
            'name': BREVO_FROM_NAME,
            'email': BREVO_FROM_EMAIL
        },
        'to': [
            {'email': to_email}
        ],
        'subject': 'Garden Planner Registration',
        'htmlContent': f"""
            <h2>Welcome to Garden Planner!</h2>
            <p>Please click the link below to set your password and complete registration:</p>
            <a href='{registration_link}'>{registration_link}</a>
        """
    }
    response = requests.post(BREVO_API_URL, headers=headers, json=data)
    response.raise_for_status()
