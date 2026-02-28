# NeuroStack AI: GenAI CSV Copilot
### **Track 3: Autonomous Data Quality & Correction Engine**

NeuroStack AI is a high-performance, full-stack analytical tool designed to solve the "Dirty Data" problem. It employs a **Hybrid Intelligence Pipeline**—fusing deterministic rule-based heuristics with probabilistic LLM reasoning—to audit, detect, and suggest corrections for messy datasets.



---

## 🏗️ System Architecture

The application is built on a decoupled **Micro-Service Architecture**:

1.  **The Sentinel Layer (Pandas/NumPy):** Executes high-speed, deterministic checks for statistical outliers (Z-Score > 3σ), duplicate row hashing, and null-value mapping.
2.  **The Reasoning Layer (Llama 3.1 via LangChain):** Processes contextual anomalies. It identifies semantic inconsistencies (e.g., standardizing 'NY' to 'New York') and malformed strings (e.g., fixing `user@@gmail.com`) that traditional regex often fails to catch.
3.  **The Sanitization Layer (FastAPI/Regex):** A custom-built post-processor that utilizes Regular Expressions and "Auto-Closer" logic to ensure LLM outputs are valid, double-quoted JSON, even if truncated.

---

## 🚀 Core Features

### 🔍 Comprehensive Anomaly Detection
* **Missing Values:** Automated null-report generation.
* **Duplicate Detection:** Row-level redundancy identification.
* **Statistical Outliers:** Z-Score based numerical anomaly flagging.
* **Invalid Formats:** Context-aware repair of Email, Phone, and Date formats.
* **Category Standardization:** Semantic grouping of inconsistent labels (e.g., L.A., Los Angeles, LA).

### 🛠️ Interactive Audit Dashboard
* **Real-time Analysis:** Instant feedback on file health.
* **Corrected Preview Table:** Side-by-side comparison of original vs. suggested values.
* **Confidence Scoring:** Probability-based labeling (High/Medium) for AI suggestions.
* **One-Click Export:** Seamless transition from messy data to a clean CSV.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Hooks, Context API), Tailwind CSS |
| **Backend** | FastAPI (Python 3.10+), Uvicorn |
| **AI Orchestration** | LangChain, OpenAI-Compatible Routing |
| **LLM Engine** | Llama-3.1-8B-Instruct (via Hugging Face Router) |
| **Data Processing** | Pandas, NumPy |
| **Authentication** | Firebase Identity Platform |

---

## ⚙️ Installation & Setup

### Backend (FastAPI)
1.  **Navigate to directory:** `cd backend`
2.  **Environment Setup:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  **Environment Variables:** Create a `.env` file:
    ```env
    HUGGINGFACE_API_TOKEN=your_token_here
    ```
4.  **Launch:** `python main.py`

### Frontend (React)
1.  **Navigate to directory:** `cd frontend`
2.  **Install Dependencies:** `npm install`
3.  **Configure Firebase:** Update `src/firebase.js` with your project credentials.
4.  **Launch:** `npm start`

---

## 📊 Data Quality Implementation (Track 3 Requirements)

NeuroStack AI strictly adheres to the Track 3 problem statement:
* **Row Limit:** Enforced validation for 20–200 rows.
* **Detection Logic:** Dual-layer (Deterministic + Probabilistic).
* **UI Components:** Integrated "Audit Report" summary and "Correction Preview" table.
* **Logic Fusion:** Rule-based logic handles volume/statistics; LLM handles nuance/formatting.



---

## 🛡️ Privacy & Security
* **Memory-Only Processing:** CSV data is processed in-memory using `io.BytesIO`. No user data is persisted to disk, ensuring strict data privacy.
* **Identity Management:** Secure authentication handled exclusively via Firebase JWT tokens.

---