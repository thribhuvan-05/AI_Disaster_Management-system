# REST API Specifications — AI Disaster Management System

## API Base Endpoint
`http://localhost:8000/api/v1`

---

## Endpoint Reference Table

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Public | Register new citizen, rescue team, or coordinator account |
| **POST** | `/auth/login` | Public | Authenticate user & receive JWT access token |
| **GET** | `/auth/me` | Bearer Token | Retrieve currently logged-in user profile |
| **POST** | `/incidents` | Citizen / Admin | Report new disaster & run automated ML Risk Engine |
| **GET** | `/incidents` | Public | List all incidents sorted by priority score |
| **GET** | `/incidents/{id}` | Public | Get detailed incident by ID |
| **PUT** | `/incidents/{id}/status` | Admin / Rescue | Update status (`Reported`, `Assigned`, `En Route`, `Arrived`, `Completed`) |
| **POST** | `/risk/predict` | Public | Standalone ML risk engine prediction & feature explanation |
| **GET** | `/rescue-teams` | Public | List rescue teams and availability status |
| **POST** | `/rescue-assignments` | Admin / Coordinator | Dispatch available rescue team to incident |
| **PUT** | `/rescue-assignments/{id}` | Admin / Rescue | Advance rescue team mission stepper status |
| **GET** | `/shelters` | Public | List shelters with current occupancy & available capacity |
| **POST** | `/shelters/{id}/allocate` | Admin / Rescue | Allocate citizens to shelter & recalculate remaining capacity |
| **GET** | `/hospitals` | Public | List medical emergency facilities and available bed count |
| **GET** | `/alerts` | Public | List active emergency warning alerts |
| **POST** | `/alerts` | Admin / Coordinator | Broadcast new critical emergency alert |
| **GET** | `/dashboard/summary` | Public | Get aggregate system KPIs (Total Incidents, Critical, Shelters, Beds) |
| **GET** | `/dashboard/analytics` | Public | Get Recharts distribution datasets |
| **POST** | `/assistant/query` | Public | Data-Grounded AI Assistant natural language query |
