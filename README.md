# NeuroStack AI: GenAI CSV Copilot
### **Track 3: Autonomous Data Quality & Correction Engine**

[![Frontend](https://img.shields.io/badge/Frontend-Deployed_on_Vercel-black?logo=vercel)](https://gen-ai-data-quality-helper.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Deployed_on_Hugging_Face-yellow?logo=huggingface)](https://harishankar000-genai-data-quality-helper.hf.space)
[![Database](https://img.shields.io/badge/Database-Firebase-yellow?logo=firebase)](#)
[![AI](https://img.shields.io/badge/AI-Llama_3.1-blue)](#)

NeuroStack AI is a high-performance, full-stack analytical tool designed to solve the "Dirty Data" problem. It employs a Hybrid Intelligence Pipeline—fusing deterministic rule-based heuristics with probabilistic LLM reasoning—to audit, detect, and suggest corrections for messy CSV datasets.

---

## 🌐 Live Demo
- Frontend: https://gen-ai-data-quality-helper.vercel.app/  
- Backend (FastAPI): https://harishankar000-genai-data-quality-helper.hf.space

---

## 🏗️ System Architecture
1. **Sentinel Layer (Pandas/NumPy):** High-speed deterministic checks (Z-score outliers, duplicate hashing, null mapping).  
2. **Reasoning Layer (Llama-3.1 via LangChain):** Semantic anomaly detection and contextual corrections.  
3. **Sanitization Layer (FastAPI/Regex):** Post-processor ensuring valid, double-quoted JSON outputs from LLMs.

---

## 🚀 Core Features
- Missing value reporting, duplicate detection, Z-score outlier flagging  
- Context-aware repairs for Email, Phone, Date formats  
- Category standardization (e.g., L.A. → Los Angeles)  
- Interactive Audit Dashboard: corrected preview, confidence scoring, one-click CSV export

---

## 💻 Tech Stack
- Frontend: React 18 (Vite, Hooks), Tailwind CSS  
- Backend: FastAPI (Python 3.10+), Uvicorn  
- AI Orchestration: LangChain  
- LLM Engine: Llama-3.1-8B-Instruct  
- Data: Pandas, NumPy  
- Auth/Storage: Firebase (Auth & Storage)

---

## ⚙️ Installation & Setup

### Firebase (prerequisite)
1. Create a Firebase project and enable:
    - Authentication (Email/Password, Google, etc.)
    - Cloud Storage (for optional CSV uploads)
2. Create a Firebase service account (Project settings → Service accounts) and download the JSON key. Keep this secure.
3. Set security rules and authentication providers appropriate for your deployment.

### Backend (FastAPI)
1. Navigate to backend:
```bash
cd backend
```
2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```
3. Install dependencies (ensure firebase-admin is in requirements):
```bash
pip install -r requirements.txt
```
4. Create `.env` with required keys:
```env
HUGGINGFACE_API_TOKEN=your_token_here
FIREBASE_SERVICE_ACCOUNT_JSON_PATH=/path/to/firebase-service-account.json
# or set FIREBASE_SERVICE_ACCOUNT_JSON with the JSON content (ensure secure storage)
```
5. Launch:
```bash
uvicorn main:app --reload --port 7860
```
Note: Backend uses Firebase Admin SDK (service account) to verify tokens and access Storage if needed.

### Frontend
1. Navigate to frontend:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Configure Firebase for the web app:
    - Update `src/firebase.js` with your Firebase config (apiKey, authDomain, projectId, storageBucket, etc.)
    - Or store values in `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```
4. Run dev server:
```bash
npm run dev
```
4. Ensure frontend passes Firebase ID tokens to backend for authenticated API calls.

---

## 📊 Track 3 Compliance
- Enforces 20–200 row limit  
- Dual-layer detection (Deterministic + Probabilistic)  
- Integrated "Audit Report" and "Correction Preview" UI components

---

## 🛡️ Privacy & Security
- In-memory CSV processing (no disk persistence by default)  
- Authentication via Firebase JWTs (Backend verifies tokens with Firebase Admin SDK)  
- Optional Cloud Storage for uploads with Firebase Storage rules  
- Minimal data retention; production deployments must follow org security policies and secure service account keys

