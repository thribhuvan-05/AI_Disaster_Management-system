# Step-by-Step Viva Demonstration Checklist

This document provides a guided viva demonstration walkthrough for verifying the complete 24-step end-to-end disaster management workflow.

---

## 24-Step Viva Verification Checklist

| Step # | Action | How to Demonstrate in Prototype | Status |
| :--- | :--- | :--- | :--- |
| **1** | Register Citizen | Open `/register`, enter name & email, select role "Citizen". | **VERIFIED** |
| **2** | Login | Login as `citizen@disaster.org` / `password123`. | **VERIFIED** |
| **3** | Submit disaster report | Navigate to `/citizen/report`, enter disaster: Flood at Kanchipuram. | **VERIFIED** |
| **4** | Validate report | Input validation ensures coordinates & parameters are non-null. | **VERIFIED** |
| **5** | Store report in Database | FastAPI inserts new row into `incidents` table in SQLite/PostgreSQL. | **VERIFIED** |
| **6** | Run AI risk engine | ML Engine evaluates inputs via Random Forest classifier. | **VERIFIED** |
| **7** | Generate risk level | ML engine computes risk level (`CRITICAL` / `HIGH`). | **VERIFIED** |
| **8** | Generate risk explanation | Human-readable contributing explanations generated from features. | **VERIFIED** |
| **9** | Display incident on map | Incident pin appears on Leaflet map with pulsing red marker. | **VERIFIED** |
| **10** | Login as Admin | Use 1-Click Quick Login button to switch to `admin@disaster.org`. | **VERIFIED** |
| **11** | View incident | Incident appears in Admin Command Center & AI Prioritized Table. | **VERIFIED** |
| **12** | Prioritize incident | AI Priority Score (e.g. 80.04/100) ranks incident at top. | **VERIFIED** |
| **13** | Assign Rescue Team | Admin opens Dispatch drawer, selects "NDRF Alpha Team" & submits. | **VERIFIED** |
| **14** | Login as Rescue Team | Switch to `rescue@disaster.org` / `rescue123`. | **VERIFIED** |
| **15** | View assignment | Mission appears in Rescue Team Mission Portal. | **VERIFIED** |
| **16** | Change rescue status | Click stepper buttons (`En Route` -> `Arrived` -> `In Progress` -> `Completed`). | **VERIFIED** |
| **17** | Login as Coordinator | Switch to `coordinator@disaster.org` / `coordinator123`. | **VERIFIED** |
| **18** | View updated operation | Coordinator sees live updated mission status & active alerts. | **VERIFIED** |
| **19** | Find suitable shelter | Navigate to `/admin/shelters`, view "Kanchipuram Community Shelter". | **VERIFIED** |
| **20** | Update shelter allocation | Click "Allocate People", enter 50 citizens. Available capacity drops. | **VERIFIED** |
| **21** | Display alert | Broadcast critical emergency warning alert on `/admin/alerts`. | **VERIFIED** |
| **22** | View analytics | Open `/admin/analytics` to view Recharts charts. | **VERIFIED** |
| **23** | Ask AI assistant | Navigate to `/assistant`, click "Which shelters have available capacity?". | **VERIFIED** |
| **24** | Verify factual answer | Assistant queries DB records & displays exact capacity breakdown. | **VERIFIED** |
