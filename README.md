# Aparavi Demo Pipeline (v1)

> A simplified low-code data pipeline showing how unstructured data flows through discovery, classification, policy enforcement, and AI summarization (RAG).  
> Built with **FastAPI**, **Node.js**, and a lightweight **HTML UI**.

### Overview
This demo simulates how Aparavi’s Data Toolchain for AI handles unstructured files:
1. **Ingest** – Discover files & extract metadata.  
2. **Classify** – Detect PII (e.g., SSNs, emails).  
3. **Policy** – Apply governance rules (e.g., quarantine).  
4. **RAG** – Generate context-aware summaries.

### Tech Stack
- Python FastAPI  
- Node.js + Express  
- Vanilla JS / HTML UI  
- Regex-based PII detection  
- Mock embeddings for RAG summarization  

---

### 🚀 How to Run
```bash
# Terminal 1 - Ingest
cd services/ingest
uvicorn main:app --port 8001

# Terminal 2 - Policy
cd services/policy
node index.js

# Terminal 3 - AI
cd services/ai
uvicorn main:app --port 8003

# Then open apps/web/index.html


---

### ✅ 4. Verify

Then visit:  
👉 **https://github.com/pjavadi84/aparavi-demo-pipeline**

You should see your folders + README beautifully formatted.

---

Would you like me to help you write a short, professional **GitHub project description** (for the top of your repo page and LinkedIn post)?  
Something like *“A lightweight AI data governance pipeline inspired by Aparavi’s unstructured data management stack.”*

