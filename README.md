# Krysskjema

A full-stack web app for tracking **kryss** (crosses/demerits) assigned to team members for performance issues like late arrivals and other infractions. Also supports **icing** (ice challenges between members) and a shared **quote board**.

## How to Run
``` bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

``` bash
cd frontend
npm run dev
```

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19 + TypeScript (Vite)      |
| Backend   | Python 3.9+ / FastAPI             |
| Database  | Firebase Cloud Firestore          |

## Project Structure

```
Krysskjema/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # env var loading
│   │   ├── crud.py            # Firestore CRUD (kryss, ice, quotes)
│   │   ├── firebase_client.py # Firebase Admin SDK init
│   │   ├── kryss_calc.py      # ln-based kryss computation
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models.py          # Pydantic models
│   │   ├── people.py          # Team member constants
│   │   └── routes.py          # API route handlers
│   ├── tests/
│   │   └── test_kryss_calc.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomSelect.tsx
│   │   │   ├── EditIceModal.tsx
│   │   │   ├── EditKryssModal.tsx
│   │   │   ├── EditQuoteModal.tsx
│   │   │   ├── IceForm.tsx
│   │   │   ├── IceTable.tsx
│   │   │   ├── KryssForm.tsx
│   │   │   ├── KryssTable.tsx
│   │   │   ├── QuoteForm.tsx
│   │   │   └── SummaryPanel.tsx
│   │   ├── hooks/
│   │   │   └── useUnsavedGuard.ts
│   │   ├── pages/
│   │   │   ├── AddChoicePage.tsx
│   │   │   ├── FormPage.tsx
│   │   │   ├── IceFormPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LogPage.tsx
│   │   │   ├── QuoteFormPage.tsx
│   │   │   ├── QuotesPage.tsx
│   │   │   └── StatsPage.tsx
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── kryssCalc.ts
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** → give it a name → continue.
3. Disable Google Analytics (optional) → **Create project**.

### 2. Enable Cloud Firestore

1. In your Firebase project, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (allows all reads/writes — fine for development).
4. Select a region and click **Enable**.

> **⚠️ Test mode** allows anyone with your project credentials to read/write data. Do not use in production without proper security rules.

### 3. Create a Service Account Key

1. Go to **Project Settings → Service accounts**.
2. Click **Generate new private key** → **Generate key**.
3. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend/` directory.

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # macOS / Linux
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env:
#   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
#   FIRESTORE_PROJECT_ID=your-firebase-project-id
#   CORS_ORIGINS=http://localhost:5173

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

### API Endpoints

| Method | Path              | Description                    |
| ------ | ----------------- | ------------------------------ |
| GET    | `/health`         | Health check                   |
| GET    | `/people`         | List team members              |
| GET    | `/kryss?limit=N`  | List kryss entries (desc)      |
| POST   | `/kryss`          | Create a kryss entry           |
| PUT    | `/kryss/{id}`     | Update a kryss entry           |
| DELETE | `/kryss/{id}`     | Delete a kryss entry           |
| GET    | `/ice?limit=N`    | List ice entries (desc)        |
| POST   | `/ice`            | Create an ice entry            |
| PUT    | `/ice/{id}`       | Update an ice entry            |
| DELETE | `/ice/{id}`       | Delete an ice entry            |
| GET    | `/quotes?limit=N` | List quotes (desc)             |
| POST   | `/quotes`         | Create a quote                 |
| PUT    | `/quotes/{id}`    | Update a quote                 |
| DELETE | `/quotes/{id}`    | Delete a quote                 |

### Example Requests

**Create – Forsentkomming (late arrival):**
```bash
curl -X POST http://localhost:8000/kryss \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-21",
    "recipientPersonId": "p1",
    "givenByPersonId": "p2",
    "category": "Forsentkomming",
    "minutesLate": 10
  }'
```

**Create – Udugelighet:**
```bash
curl -X POST http://localhost:8000/kryss \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-21",
    "recipientPersonId": "p3",
    "givenByPersonId": "p4",
    "category": "Udugelighet",
    "comment": "Glemte å ta med utstyret",
    "kryssCount": 2
  }'
```

**Delete:**
```bash
curl -X DELETE http://localhost:8000/kryss/DOCUMENT_ID
```

### Running Tests

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

The frontend expects the backend at `http://localhost:8000` by default. To change this, set the `VITE_API_URL` environment variable or create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:8000
```

---

## Business Rules

### Categories

| Category        | Required Fields                | kryssCount                     |
| --------------- | ------------------------------ | ------------------------------ |
| Forsentkomming  | `minutesLate` (integer ≥ 0)   | Auto-computed (see below)      |
| Udugelighet     | `comment`, `kryssCount` (≥ 1) | User-provided                  |
| Annet           | `comment`, `kryssCount` (≥ 1) | User-provided                  |

### Kryss Calculation for Forsentkomming

```
raw = ln(1 + minutesLate)
if raw < 1 → kryssCount = 1
else:
  integerPart = floor(raw)
  frac = raw − integerPart
  if frac ≥ 0.5 → integerPart + 1
  else          → integerPart
```

| minutesLate | ln(1 + m) | kryssCount |
| ----------- | --------- | ---------- |
| 0           | 0.000     | 1          |
| 1           | 0.693     | 1          |
| 3           | 1.386     | 1          |
| 4           | 1.609     | 2          |
| 10          | 2.397     | 2          |
| 12          | 2.565     | 3          |

The backend is the **source of truth** for this calculation. The frontend computes it for display only.

---

## Team Members

Currently hardcoded as 5 placeholder members. To change, edit:

- **Backend:** `backend/app/people.py`
- **Frontend:** The frontend fetches members from the `/people` API endpoint — no frontend changes needed.

---

## Notes

- **Auth:** Not implemented. The code is structured to add authentication later (e.g., Firebase Auth).
- **Firestore rules:** Running in **test mode** (open access). Secure before any production use.
- **Editing entries:** Full CRUD (create, read, update, delete) is supported for kryss, ice, and quotes in both the backend and frontend.
