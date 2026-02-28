import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import os

# 1. Initialize Firebase Admin SDK
# The serviceAccountKey.json is the private key you download from Firebase Console.
# We check if it exists to prevent the server from crashing on startup.
if not firebase_admin._apps:
    cert_path = "serviceAccountKey.json"
    if os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred)
    else:
        print("CRITICAL ERROR: serviceAccountKey.json not found in backend folder.")

# 2. Define the Security Scheme
# This tells FastAPI to look for the 'Authorization: Bearer <TOKEN>' header.
security = HTTPBearer()

async def get_current_user(res: HTTPAuthorizationCredentials = Security(security)):
    """
    Industry-Standard Middleware:
    1. Extracts the JWT from the request header.
    2. Verifies it with Firebase servers.
    3. Returns user details or blocks the request with a 401 Unauthorized error.
    """
    token = res.credentials
    
    try:
        # Verify the ID token from the frontend React app
        # check_revoked=True adds a layer of security by checking if the user session was killed.
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        
        # Return the user's unique identity (UID) and email
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name")
        }
        
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )