# 🌾 AI Agriculture

AI Agriculture is an intelligent agricultural management system that uses Artificial Intelligence and Machine Learning to help farmers make better agricultural decisions.

The system provides:

* 🌱 Crop Recommendation
* 🦠 Plant Disease Detection
* ⚠️ Disease Risk Prediction
* 📊 Yield Prediction

---

## 📁 Project Structure

```text
AI-Agriculture/
│
├── frontend/                  # React frontend
│
├── backend/                   # Node.js + Express backend
│
├── ai-service/                # Python + FastAPI AI service
│   ├── models/                # Local ML models (not included in GitHub)
│   ├── dataset/               # Local datasets (not included in GitHub)
│   ├── venv/                  # Python virtual environment (not included)
│   ├── app.py
│   ├── requirements.txt
│   ├── predict.py
│   ├── predict_crop.py
│   ├── predict_disease_risk.py
│   └── predict_yield.py
│
├── datasets/                  # Local datasets (not included in GitHub)
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### AI Service

* Python
* FastAPI
* Uvicorn
* NumPy
* Pandas
* Pillow
* Scikit-learn
* TensorFlow / Keras
* Joblib

---

## ⚙️ Requirements

Install the following software before running the project:

* Node.js
* npm
* Python
* MongoDB
* Git

Check installations:

```bash
node --version
npm --version
python --version
git --version
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/SivalankaBala/AI-Agriculture.git
```

Move into the project:

```bash
cd AI-Agriculture
```

---

# 🎨 2. Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 🖥️ 3. Backend Setup

Open another terminal.

Go to the backend:

```bash
cd AI-Agriculture/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables.

Start the backend:

```bash
npm run dev
```

The backend runs on the configured backend port.

---

# 🤖 4. AI Service Setup

Open another terminal.

Go to the AI service:

```bash
cd AI-Agriculture/ai-service
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

# 🧠 5. AI Models

The trained ML models are not stored directly in GitHub because the model files are large.

The AI service requires the following four models:

```text
ai-service/models/
│
├── crop_recommendation_model.pkl
├── disease_risk_model.pkl
├── tomato_disease_model.keras
└── yield_prediction_model.pkl
```

### Download the Models

Download the model package from Google Drive:

**AI Agriculture Model Package:**  

 `https://drive.google.com/file/d/1-bnDfd_8Rk9oH2Y3xbWeKx6RDQicO8-e/view?usp=drive_link`

The downloaded file will be:

```text
ai-service-models.zip
```

### Extract the Models

After downloading the ZIP file, extract its contents into:

```text
AI-Agriculture/ai-service/models/
```

After extraction, verify that the folder contains:

```text
AI-Agriculture/
└── ai-service/
    └── models/
        ├── crop_recommendation_model.pkl
        ├── disease_risk_model.pkl
        ├── tomato_disease_model.keras
        └── yield_prediction_model.pkl
```

### Important

Do **not** add the model files or `ai-service-models.zip` to Git.

They are already excluded by `.gitignore`.

The GitHub repository contains the AI source code and `requirements.txt`, while the trained model files are distributed separately.

# ▶️ 6. Start the AI Service

Make sure the virtual environment is activated:

```powershell
venv\Scripts\activate
```

Start FastAPI:

```bash
uvicorn app:app --reload --port 8000
```

The AI service will normally be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 🧪 7. Testing

After starting the AI service, open:

```text
http://localhost:8000/docs
```

Use the Swagger UI to test the available API endpoints.

You can test:

* Crop recommendation
* Plant disease detection
* Disease risk prediction
* Yield prediction

Make sure the required model files are present before testing prediction endpoints.

---

# 👥 8. Team Development

Team members should **not directly work on `main`**.

Create a separate branch:

```bash
git checkout -b feature-name
```

Example:

```bash
git checkout -b frontend-development
```

After making changes:

```bash
git add .
git commit -m "Update frontend"
```

Push the branch:

```bash
git push -u origin frontend-development
```

Then create a **Pull Request** on GitHub.

After review, the changes can be merged into `main`.

---

# 🔄 9. Updating Your Local Project

Before starting new work:

```bash
git checkout main
git pull origin main
```

Then create your feature branch:

```bash
git checkout -b feature-name
```

---

# 🚫 10. Important Git Notes

The following files/folders are intentionally ignored by Git:

```text
node_modules/
venv/
__pycache__/
datasets/
dataset/
models/
*.pkl
*.keras
*.pt
*.pth
*.h5
*.onnx
*.jpg
*.jpeg
*.png
.env
```

These files are not deleted from your computer.

They are simply not uploaded to GitHub.

---

# 📦 11. Model Distribution

Because the trained models are large, they should be distributed separately from the Git repository.

Each team member needs the required model files in:

```text
ai-service/models/
```

The final project documentation should contain the agreed method for obtaining these model files.

---

# 📊 12. Project Status

Current project components:

* ✅ Frontend
* ✅ Backend
* ✅ MongoDB connection
* ✅ AI service
* ✅ GitHub repository
* ✅ Git branches / team workflow
* ✅ `.gitignore`
* ✅ Source code uploaded to GitHub
* ⚠️ Trained ML models stored separately

---

# 🌾 Project Goal

The goal of AI Agriculture is to provide farmers with an easy-to-use platform that combines agricultural data, machine learning, and disease analysis to support better crop-related decisions.
