import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import auth, credentials
from dotenv import load_dotenv

load_dotenv()

# --- CRITICAL: Project ID Alignment ---
# Ensure this matches 'data-quality-helper' from your frontend
PROJECT_ID = "data-quality-helper" 

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        # We use the project_id to verify the token correctly
        firebase_admin.initialize_app(options={'projectId': PROJECT_ID})
except Exception as e:
    print(f"Firebase Admin Initialization Error: {e}")

security = HTTPBearer()

async def get_current_user(res: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the JWT token sent from the React frontend.
    """
    token = res.credentials
    try:
        # We MUST specify the app here to ensure the Project ID matches
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token Verification Failed: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}"
        )