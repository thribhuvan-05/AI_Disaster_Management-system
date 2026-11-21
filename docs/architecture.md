# System Architecture — AI Disaster Management System

## 1. Overview
The **AI Disaster Management System** is a unified multi-hazard emergency platform designed for real-time disaster risk assessment, operational prioritization, rescue dispatch, shelter management, and situational monitoring connecting four key user roles:
1. **Citizen**
2. **Administrator**
3. **Rescue Team**
4. **Emergency Coordinator**

---

## 2. High-Level System Architecture Diagram (Mermaid)

```mermaid
graph TD
    subgraph Frontend Layer
        A[React 18 + Vite SPA]
        A1[Leaflet / OpenStreetMap]
        A2[Recharts Analytics]
        A3[Lucide Icons & Tailwind CSS]
    end

    subgraph Backend Layer (FastAPI REST API)
        B[FastAPI Application Server]
        B1[JWT Authentication & Role Authorization]
        B2[REST Router Modules]
        B3[Data-Grounded AI Assistant]
    end

    subgraph Data & ML Layer
        C[SQLAlchemy ORM Data Storage]
        C1[(SQLite / PostgreSQL DB)]
        D[Scikit-Learn ML Risk Engine]
        D1[RandomForest Classifier Model]
        D2[Feature Scaling & Attribution Extractor]
    end

    A -->|HTTP / REST API JSON| B
    B --> B1
    B --> B2
    B2 --> C
    C --> C1
    B2 --> D
    D --> D1
    D --> D2
    B3 --> C
    A1 -->|Render Geo Markers| A
    A2 -->|Render Visual Data| A
```

---

## 3. Technology Stack Justification

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Fast HMR development, modular component lifecycle, high UI performance. |
| **Styling** | Tailwind CSS | Modern utility classes, glassmorphism UI styles, dark mode emergency look. |
| **Mapping Engine** | Leaflet + OpenStreetMap | Lightweight open-source interactive mapping with custom SVG/CSS risk markers. |
| **Backend Framework** | Python FastAPI | Asynchronous performance, automatic OpenAPI/Swagger documentation, native Pydantic schema validation. |
| **Database ORM** | SQLAlchemy 2.0 | Dual SQLite & PostgreSQL compatibility for immediate out-of-the-box local execution. |
| **Machine Learning** | Scikit-Learn (Random Forest) | High interpretability, non-linear multi-hazard feature scoring, robust feature attribution. |
