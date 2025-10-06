# Aparavi Demo — React + React Flow UI

Built this project as a learning and demonstration tool, not as a copy of Aparavi’s product. My goal was to explore unstructured‑data management end‑to‑end—ingesting files, detecting sensitive data, applying governance policies, and preparing AI‑ready inputs—because these are the problems Aparavi solves
aparavi.com
. Implementing the pipeline myself in Python, Node.js and React (with a visual, low‑code interface) shows that I understand the data life cycle and can build full‑stack solutions that meet Aparavi’s mission of cleaning, organizing and automating unstructured data
aparavi.com
. This prototype also provides a platform for future integration with Aparavi’s SDK, demonstrating my intent to extend and adapt the project rather than simply replicating an existing product.

This project provides a visual representation of the **Aparavi-style unstructured data pipeline**, built using **React**, **React Flow**, and **Tailwind CSS**. It connects with FastAPI microservices for ingestion, classification, policy enforcement, and RAG (Retrieval-Augmented Generation) summarization.

---

## 🧠 Architecture Overview

```text
+----------------+      +----------------+      +----------------+      +----------------+
|   Discover     | ---> |   Classify     | ---> |    Policy      | ---> |      RAG       |
|  (FastAPI)     |      |  (FastAPI)     |      |  (FastAPI)     |      |  (FastAPI)     |
+----------------+      +----------------+      +----------------+      +----------------+
        |                     |                      |                       |
        |                     |                      |                       |
        +----------> React Flow UI visual pipeline <--------------------------+
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/pjavadi84/aparavi-demo-toolchain-v1.git
cd aparavi-demo-toolchain-v1/react-flow-ui
```

### 2️⃣ Install Dependencies
Make sure you’re using **Node ≥ 20.19.0**.

```bash
npm install
```

If you see `could not determine executable to run` or missing Tailwind binary, upgrade npm and reinstall:
```bash
npm install -g npm@latest
npm install -D tailwindcss@3.4.13 postcss autoprefixer
npx tailwindcss init -p
```

### 3️⃣ Configure Tailwind
Ensure these files exist:

**`tailwind.config.js`**
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import this in `src/main.tsx`:
```ts
import './index.css';
```

### 4️⃣ Start the Frontend
```bash
npm run dev
```
Then open **http://localhost:5175**.

---

## ⚙️ Backend Setup
In the project root (`aparavi-demo-toolchain-v1`), start all FastAPI services:

```bash
# Terminal 1
cd services/ingest
uvicorn main:app --reload --port 8001

# Terminal 2
cd ../policy
uvicorn main:app --reload --port 8002

# Terminal 3
cd ../rag
uvicorn main:app --reload --port 8003
```

Each endpoint serves part of the pipeline:
- **/discover** → scans `data/sample_files/`
- **/classify** → tags PII (emails, SSNs)
- **/apply** → enforces policies like QuarantineSSN
- **/rag** → summarizes content using simulated embeddings

---

## 🧩 UI Features
✅ Interactive flow built with **React Flow**  
✅ Live status transitions (`running`, `done`, `error`)  
✅ Real-time logs and FastAPI fetch results  
✅ Tailwind-based clean design  
✅ Auto-scroll and status updates for each node

---

## 🧠 Example Run
When you click **Run Pipeline**:
1. The system discovers local sample documents.
2. Detects PII (emails, SSNs).
3. Applies policies (e.g., quarantine).
4. Generates an AI-based summary via RAG.

Example log output:
```bash
📂 Discover complete
🔍 Classification complete
⚙️ Apply result: {"applied": [{"file": "contract.txt", "action": "quarantine"}]}
🤖 RAG answer: Executive Summary ...
```

---

## 📸 Demo Preview
![Aparavi Demo UI Screenshot](./docs/screenshot.png)
_The pipeline nodes animate through stages as backend responses stream in._

---

## 🧱 Tech Stack
- **Frontend:** React + Vite + React Flow + TailwindCSS
- **Backend:** FastAPI (Python)
- **Visualization:** React Flow
- **Policy & RAG Logic:** Simulated ML classification + regex PII detection

---

## 👨‍💻 Author
**Pouya Javadi**  
Software Engineer @ Meta | Building human-centered AI tools  
[LinkedIn](https://linkedin.com/in/pouyajavadi)

---

## 📄 License
Released under the [MIT License](./LICENSE) © 2025 Pouya Javadi
