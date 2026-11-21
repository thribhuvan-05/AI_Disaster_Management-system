# AI DISASTER MANAGEMENT SYSTEM
### An Intelligent Platform for Disaster Risk Assessment, Emergency Response, and Resource Coordination

> **Academic Project & Viva Prototype Disclosure**: This software is a fully working software prototype developed for academic demonstration using controlled synthetic datasets (Indian regional locations: Chennai, Kanchipuram, Visakhapatnam, Hyderabad, Mumbai, Delhi). It uses an explainable Scikit-Learn Machine Learning Risk Engine and data-grounded AI query assistant.

---

## 1. Problem Statement & Objectives
During major multi-hazard natural disasters (Floods, Cyclones, Earthquakes, Landslides, Wildfires), emergency response efforts suffer from delayed incident reporting, lack of automated risk scoring, manual rescue dispatch bottlenecks, and inaccurate shelter capacity tracking.

The **AI Disaster Management System** addresses these challenges by unifying four primary stakeholders in a single real-time platform:
1. **Citizens**: Report incidents, receive automated AI risk assessments, locate emergency shelters and trauma hospitals, and track rescue status.
2. **Administrators**: Operational Command Center with interactive Leaflet maps, AI prioritized incident queues, and instant rescue dispatching.
3. **Rescue Teams**: Field mission portal with progressive status stepper controls (`Assigned` $\rightarrow$ `En Route` $\rightarrow$ `Arrived` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`).
4. **Emergency Coordinators**: Strategic situation room monitoring multi-agency resource saturation, hospital beds, and alert broadcasts.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Leaflet & React-Leaflet, Recharts, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Pydantic V2, Uvicorn, Python-Jose (JWT), Bcrypt |
| **Database** | SQLAlchemy 2.0 ORM with dual SQLite default (`sqlite:///./disaster_management.db`) and PostgreSQL support |
| **AI / ML** | Python, Pandas, NumPy, Scikit-Learn (RandomForest Classifier, StandardScaler, Feature Attribution) |
| **Testing** | Pytest & FastAPI TestClient |

---

## 3. Project Directory Structure
```
AI Disaster Management System/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API Route Handlers (auth, incidents, risk, rescue, shelters, hospitals, alerts, dashboard, assistant)
│   │   ├── core/         # Config & Security (JWT, bcrypt)
│   │   ├── db/           # SQLAlchemy Database models & sessions
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── main.py       # FastAPI Entrypoint
│   ├── tests/            # Automated Pytest suite (100% pass rate)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Leaflet Map, Navbar, Sidebar, StatCard, Badges, AlertBanner
│   │   ├── context/      # AuthContext session provider
│   │   ├── pages/        # Login, Register, Citizen, Admin, Rescue, Coordinator, Shelters, Hospitals, Alerts, Analytics, Assistant
│   │   ├── services/     # Axios API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── ml/
│   ├── train_model.py    # Synthetic dataset generator & Random Forest trainer
│   ├── feature_engineering.py # Indicator calculations & explanations
│   ├── predict.py        # Inference module
│   └── model.pkl         # Serialized ML model artifact (90% accuracy)
├── database/
│   ├── schema.sql        # Standalone SQL DDL
│   └── seed_data.py      # Demo dataset initializer
├── docs/                 # Complete Viva documentation package
│   ├── architecture.md
│   ├── database.md
│   ├── ml_pipeline.md
│   ├── api.md
│   ├── testing.md
│   └── demo.md
├── .env.example
└── README.md
```

---

## 4. Demo User Credentials (1-Click Login Enabled)

For quick demonstration, the login page features 1-click role switcher buttons:

| User Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@disaster.org` | `admin123` | Master Command Center, Dispatch Drawer, Analytics |
| **Citizen** | `citizen@disaster.org` | `password123` | Report Incident Form with AI Preview, Shelters |
| **Rescue Team** | `rescue@disaster.org` | `rescue123` | Mission Queue & Status Stepper Controls |
| **Emergency Coordinator** | `coordinator@disaster.org` | `coordinator123` | Situation Room & Alert Broadcasts |

---

## 5. Quick Start Instructions (Run Locally)

### Prerequisite Checklist
- Python 3.10+ installed
- Node.js v18+ & npm installed

---

### Step 1: Initialize Database & ML Model
```bash
# Train ML Model (generates ml/model.pkl)
python ml/predict.py

# Initialize database schema and seed demo data
python database/seed_data.py
```

---

### Step 2: Run FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive OpenAPI Swagger documentation available at: `http://localhost:8000/docs`

---

### Step 3: Run React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open browser at `http://localhost:3000` (or the local Vite URL output).

---

### Step 4: Run Automated Tests
```bash
python -m pytest backend/tests
```

---

## 6. End-to-End Demonstration Scenario (24-Step Viva Workflow)

1. **Citizen Login**: Sign in as `citizen@disaster.org`.
2. **Report Incident**: Navigate to **Report Incident**, select **Flood** at **Kanchipuram**, set Rainfall = 220mm, Water Level = 4.2m.
3. **AI Risk Assessment**: System automatically triggers the ML engine, classifying risk as **CRITICAL** (Priority Score: 80.04/100) with contributing explanations.
4. **Admin Command Center**: Login as `admin@disaster.org`. View the incident on the Leaflet map and AI Prioritized table.
5. **Rescue Team Dispatch**: Click **Dispatch**, select **NDRF Alpha Team**, and assign target shelter.
6. **Rescue Field Mission**: Login as `rescue@disaster.org`. Advance mission status stepper: `Assigned` $\rightarrow$ `En Route` $\rightarrow$ `Arrived` $\rightarrow$ `Rescue In Progress` $\rightarrow$ `Completed`.
7. **Shelter Allocation**: Navigate to **Shelters**, click **Allocate People**, enter 50 citizens. Available capacity updates live in database.
8. **AI Assistant Query**: Navigate to **AI Assistant**, ask *"Which shelters have available capacity?"*. The assistant queries real database records and returns factual bed availability.

---

## 7. Limitations & Future Enhancements
- **Live Sensor Integration**: Future production deployments can connect to IoT water-level sensors and IMD Doppler weather APIs.
- **Push Notifications**: Future releases can integrate SMS gateways (Twilio/Firebase) for emergency broadcast push notifications.
- **Satellite Imaging**: Computer vision models (CNNs) can be integrated for automated flood inundation detection from satellite imagery.
