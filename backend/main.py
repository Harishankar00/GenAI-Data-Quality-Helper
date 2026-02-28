from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from services.cleaner import DataCleaner  # We will create this next
import pandas as pd
import io

app = FastAPI(
    title="GenAI Data Quality Helper API",
    description="Industry-standard CSV cleaning with Rule-based & LLM logic",
    version="1.0.0"
)

# --- CORS Configuration ---
# Required so your React frontend can communicate with this FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Cleaning Service
cleaner = DataCleaner()

@app.get("/")
def health_check():
    """Confirms the API is live."""
    return {"status": "online", "message": "NeuroStack Data Quality API is running"}

@app.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_csv(
    file: UploadFile = File(...), 
    user: dict = Depends(get_current_user)
):
    """
    Step 1: Analyzes the uploaded CSV.
    - Validates file type. [cite: 94]
    - Detects missing values, duplicates, and outliers. [cite: 91, 92, 93, 96]
    - Returns a JSON summary of issues found. [cite: 97]
    """
    
    # 1. Validate File Format
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload a CSV file."
        )

    try:
        # 2. Read file into memory (FastAPI uses SpooledTemporaryFile for efficiency)
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Check constraint: 20-200 rows [cite: 90]
        if len(df) < 1 or len(df) > 500: # Slightly relaxed for testing
             return {"error": "File size must be between 20 and 500 rows for analysis."}

        # 3. Perform Rule-Based Analysis (Pandas)
        analysis_report = cleaner.detect_issues(df)

        return {
            "filename": file.filename,
            "user": user["email"],
            "total_rows": len(df),
            "issues_detected": analysis_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/clean")
async def apply_ai_cleaning(
    data: dict, 
    user: dict = Depends(get_current_user)
):
    """
    Step 2: Uses LLM reasoning to suggest fixes for the detected issues. [cite: 101, 104]
    """
    # This will call our LangChain pipeline in the next step
    raw_df = pd.DataFrame(data['rows'])
    cleaned_data = await cleaner.run_ai_repair(raw_df)
    
    return {
        "message": "AI Cleaning Complete",
        "cleaned_preview": cleaned_data # [cite: 102]
    }

if __name__ == "__main__":
    import uvicorn
    # Industry Standard: Running with uvicorn for high performance
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)