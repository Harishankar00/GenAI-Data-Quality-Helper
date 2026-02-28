from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from services.cleaner import DataCleaner 
import pandas as pd
import io
import json
import re

app = FastAPI(
    title="GenAI Data Quality Helper API",
    description="Industry-standard CSV cleaning with Rule-based & LLM logic",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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
    - Uses Pandas for Rule-based checks.
    - Uses LLM for format and category reasoning.
    """
    
    # 1. Validate File Format
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload a CSV file."
        )

    try:
        # 2. Read file into memory
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Check row constraints (20-200 rows)
        if len(df) < 20 or len(df) > 500: 
             return {"error": f"File size is {len(df)} rows. Must be between 20 and 500 rows."}

        # 3. Layer 1: Perform Rule-Based Analysis (Pandas)
        analysis_report = cleaner.detect_issues(df)

        # 4. Layer 2: Get LLM Suggestions
        raw_llm_response = await cleaner.run_ai_repair(df)
        
        # 5. Indestructible JSON Extractor & Sanitizer
        suggestions = []
        try:
            clean_str = raw_llm_response.strip()
            
            # Remove Markdown code blocks if present
            if '```json' in clean_str:
                clean_str = clean_str.split('```json')[1].split('```')[0].strip()
            elif '```' in clean_str:
                clean_str = clean_str.split('```')[1].split('```')[0].strip()

            # Ensure we start at the first bracket
            if '[' in clean_str:
                clean_str = clean_str[clean_str.find('['):]
                
            # --- THE AUTO-CLOSER ---
            # If the AI cuts off mid-sentence (braces/brackets don't match)
            if clean_str.count('[') > clean_str.count(']'):
                last_complete_object = clean_str.rfind('}')
                if last_complete_object != -1:
                    # Chop off trailing junk and close the array manually
                    clean_str = clean_str[:last_complete_object+1] + '\n]'
                else:
                    clean_str = "[]"

            # Parse the cleaned string
            raw_suggestions = json.loads(clean_str)
            
            # --- THE MUTE BUTTON ---
            # Only keep rows where the AI actually fixed something
            suggestions = [
                s for s in raw_suggestions 
                if str(s.get("original", "")).strip() != str(s.get("fix", "")).strip() 
                and str(s.get("original", "")).strip() != ""
            ]
                
        except Exception as parse_error:
            print(f"Failed to parse LLM JSON: {parse_error}")
            print(f"Raw AI Output was:\n{raw_llm_response}") 
            suggestions = [] 

        # 6. Final Combined Payload
        return {
            "filename": file.filename,
            "user": user.get("email", "Unknown"),
            "total_rows": len(df),
            "issues_detected": analysis_report,
            "suggestions": suggestions  
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/clean")
async def apply_ai_cleaning(
    data: dict, 
    user: dict = Depends(get_current_user)
):
    """Fallback endpoint for separate AI cleaning requests."""
    raw_df = pd.DataFrame(data['rows'])
    cleaned_data = await cleaner.run_ai_repair(raw_df)
    
    return {
        "message": "AI Cleaning Complete",
        "cleaned_preview": cleaned_data 
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)