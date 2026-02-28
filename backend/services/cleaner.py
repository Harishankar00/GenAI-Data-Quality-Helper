import pandas as pd
import numpy as np
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

class DataCleaner:
    def __init__(self):
        # Using a free, high-quality model via Hugging Face Inference API
        # Requirements: Get a free API token from huggingface.co
        self.repo_id = "mistralai/Mistral-7B-Instruct-v0.3"
        self.llm = HuggingFaceEndpoint(
            repo_id=self.repo_id,
            huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_TOKEN"),
            temperature=0.1 # Low temperature for factual cleaning
        )

    def detect_issues(self, df: pd.DataFrame):
        """
        Layer 1: Rule-Based Detection (Fast & Reliable)
        Detects missing values, duplicates, and outliers[cite: 91, 92, 93, 96].
        """
        issues = []
        
        # 1. Missing Values [cite: 92]
        null_report = df.isnull().sum()
        for col, count in null_report.items():
            if count > 0:
                issues.append({"column": col, "issue": "Missing Values", "count": int(count)})

        # 2. Duplicate Rows [cite: 96]
        dup_count = df.duplicated().sum()
        if dup_count > 0:
            issues.append({"column": "All", "issue": "Duplicate Rows", "count": int(dup_count)})

        # 3. Numerical Outliers (Z-Score method) 
        for col in df.select_dtypes(include=[np.number]).columns:
            z_scores = (df[col] - df[col].mean()) / df[col].std()
            outliers = df[np.abs(z_scores) > 3]
            if not outliers.empty:
                issues.append({"column": col, "issue": "Outliers Detected", "count": len(outliers)})

        return issues

    async def run_ai_repair(self, df: pd.DataFrame):
        """
        Layer 2: AI-Powered Reasoning
        Used for fixing inconsistent categories or invalid formats[cite: 95, 101, 104].
        """
        # To save tokens, we only analyze the first 5 rows as a sample for 'Confidence' labels [cite: 100, 121]
        sample_data = df.head(5).to_json()
        
        template = """
        You are a Data Quality Expert. Analyze this CSV data:
        {data}
        
        Identify inconsistent categories (e.g. 'N.Y.' vs 'New York') or invalid formats[cite: 94, 95].
        For each issue, provide:
        1. Original Value
        2. Suggested Correction
        3. Confidence Score (0-1) [cite: 100]
        
        Return the response in a structured JSON format.
        """
        
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        # Clean the data using LLM reasoning 
        response = chain.invoke({"data": sample_data})
        return response