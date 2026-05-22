# SportSphere AI - Production Deployment & Audit Guide

This guide provides the complete security audit results, production hardening overview, and step-by-step instructions to deploy the frontend and backend of **SportSphere AI** using Google Cloud.

---

## 🔒 Part 1: Security Audit Results

We conducted a thorough audit of the repository to ensure production readiness:

| Vulnerability Check | Status | Resolution / Action Taken |
| :--- | :---: | :--- |
| **Hardcoded API Keys** | Clean | Verified no active credentials exist in files. Centralized env loader. |
| **Exposed Secrets** | Clean | Added `.env` ignoring rules. Created global `.env.example`. |
| **CORS Origins** | Hardened | Replaced wildcard `["*"]` with custom domain list `CORS_ORIGINS`. |
| **Debug Mode** | Clean | FastAPI debug mode disabled; uvicorn reload disabled for production. |
| **Relative/Hardcoded URLs** | Resolved | Updated React `App.jsx` to load `VITE_API_URL` dynamically. |
| **Error Management** | Hardened | Added global HTTP and general Exception handlers to return clean JSON error payloads. |
| **Dependencies** | Validated | Verified Node `npm run build` succeeds and Python wheels compile for modern runtimes. |

---

## ⚙️ Part 2: Configured Environment Variables

Create a `.env` file using the following template in the root of the project:

```env
# --- Backend Configuration ---
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_MAPS_API_KEY=your-maps-api-key-here
PORT=8080
BACKEND_URL=https://sportsphere-ai-backend-xxx.run.app
CORS_ORIGINS=http://localhost:5173,https://sportsphere-ai.web.app

# --- Frontend Configuration ---
VITE_API_URL=https://sportsphere-ai-backend-xxx.run.app
```

---

## 🚀 Part 3: Deploying the Backend (Google Cloud Run)

We have containerized the FastAPI backend. Follow these steps to build and host it on Google Cloud Run:

### Steps:
1. **Initialize Google Cloud CLI**:
   Ensure you have the `gcloud` CLI installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project your-gcloud-project-id
   ```

2. **Build and Submit Container**:
   Build the docker image using Google Cloud Build (which compiles it securely in the cloud):
   ```bash
   gcloud builds submit --tag gcr.io/your-gcloud-project-id/sportsphere-backend .
   ```

3. **Deploy to Cloud Run**:
   Deploy the image. Make sure to allow unauthenticated traffic if you want the public frontend to reach it:
   ```bash
   gcloud run deploy sportsphere-backend \
     --image gcr.io/your-gcloud-project-id/sportsphere-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_api_key_here",CORS_ORIGINS="https://sportsphere-ai.web.app"
   ```

4. **Verify Backend Status**:
   Once deployed, the terminal will output a Service URL (e.g., `https://sportsphere-backend-xxx.a.run.app`). Query the health endpoint to confirm:
   ```bash
   curl https://sportsphere-backend-xxx.a.run.app/health
   # Returns: {"status": "ok"}
   ```

---

## 🌐 Part 4: Deploying the Frontend (Firebase Hosting / GCS)

We created static website hosting configurations. We highly recommend **Firebase Hosting** (Google Cloud's developer hosting) for zero-config SSL, CDN distribution, and SPA redirects.

### Option A: Deploying via Firebase Hosting (Recommended)
1. **Install Firebase Tools**:
   ```bash
   npm install -g firebase-tools
   ```
2. **Login and Setup**:
   ```bash
   firebase login
   ```
3. **Build the React Application**:
   Compile the production bundle (this populates the `dist/` directory):
   ```bash
   npm run build
   ```
4. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```
   *Your app is now live at `https://sportsphere-ai.web.app`.*

---

### Option B: Deploying via Google Cloud Storage (GCS Static Website)
If you prefer standard GCS buckets:
1. **Create Bucket**:
   ```bash
   gsutil mb -b on -c standard gs://sportsphere-ai-frontend
   ```
2. **Make Objects Publicly Viewable**:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://sportsphere-ai-frontend
   ```
3. **Configure Website Properties**:
   ```bash
   gsutil web set -m index.html -e index.html gs://sportsphere-ai-frontend
   ```
4. **Build and Sync Files**:
   ```bash
   npm run build
   gsutil -m rsync -r dist gs://sportsphere-ai-frontend
   ```

---

## 🛠️ Part 5: Deployment Verification

To test that everything coordinates correctly before leaving:
1. Start local backend in venv:
   ```bash
   cd backend
   .\venv\Scripts\python -m uvicorn app:app --port 8000
   ```
2. Run frontend build checks:
   ```bash
   npm run build
   ```
   *All builds are verified green.*
