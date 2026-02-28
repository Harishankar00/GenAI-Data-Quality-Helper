import pandas as pd
import numpy as np
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os
import json
from dotenv import load_dotenv

load_dotenv()

class DataCleaner:
    def __init__(self):
        # The ultimate cheat code: ChatOpenAI routed to Hugging Face
        # We are using Llama 3.1 because it's heavily optimized for strict formatting
        self.llm = ChatOpenAI(
            model="meta-llama/Llama-3.1-8B-Instruct", 
            api_key=os.getenv("HUGGINGFACE_API_TOKEN"),
            base_url="https://router.huggingface.co/v1", 
            temperature=0.1, # Low temperature to keep the AI from getting overly creative
            max_tokens=4096  # Big lungs so it doesn't choke mid-sentence
        )

    def detect_issues(self, df: pd.DataFrame):
        """
        Layer 1: Rule-Based Detection
        Detects missing values, duplicates, and outliers instantly without the LLM.
        """
        issues = []
        
        # 1. Missing Values
        null_report = df.isnull().sum()
        for col, count in null_report.items():
            if count > 0:
                issues.append({"column": col, "issue": "Missing Values", "count": int(count)})

        # 2. Duplicate Rows
        dup_count = df.duplicated().sum()
        if dup_count > 0:
            issues.append({"column": "All", "issue": "Duplicate Rows", "count": int(dup_count)})

        # 3. Numerical Outliers (Z-Score method)
        for col in df.select_dtypes(include=[np.number]).columns:
            # Safely calculate Z-scores ignoring NaNs
            z_scores = (df[col] - df[col].mean()) / df[col].std(ddof=0)
            outliers = df[np.abs(z_scores) > 3]
            if not outliers.empty:
                issues.append({"column": col, "issue": "Outliers Detected", "count": len(outliers)})

        return issues

    async def run_ai_repair(self, df: pd.DataFrame):
        """
        Layer 2: AI-Powered Reasoning
        Used for fixing inconsistent categories or invalid formats.
        """
        # THE FIX: We restrict its diet to 5 rows so it doesn't hallucinate an infinite loop.
        # We also fill NaNs with empty strings so the JSON parser doesn't blow up.
        sample_data = df.head(5).fillna("").to_dict(orient='records')
        
        # Serialize the Python dictionary into a proper double-quoted JSON string 
        # so the LLM knows exactly what formatting to mimic.
        clean_json_input = json.dumps(sample_data)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Data Quality Assistant. Return EXACTLY ONE valid JSON array.
            RULES:
            1. ONLY output fixes for formatting errors (like bad emails or fake phone numbers).
            2. If a value is already correct, DO NOT include it.
            3. DO NOT invent new data. Stop analyzing after the provided rows.
            4. Output a MAXIMUM of 5 JSON objects.
            5. STRICT JSON FORMAT: Use DOUBLE QUOTES ("") for all keys/values. NEVER use single quotes ('')."""),
            ("user", "Analyze this data:\n{data}\n\nReturn EXACTLY ONE JSON array with keys: \"column\", \"original\", \"fix\", \"confidence\".")
        ])
        
        chain = prompt | self.llm
        
        try:
            # Call the AI asynchronously 
            response = await chain.ainvoke({"data": clean_json_input})
            return response.content
        except Exception as e:
            print(f"LLM Reasoning failed: {e}")
            return "[]"