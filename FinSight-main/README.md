# FinSight – AI-Powered Financial Insight & Compliance Assistant

FinSight is an AI-assisted financial analytics platform that helps users evaluate their financial health, predict potential financial stress, and receive actionable recommendations.
It also includes **Smart Compliance Copilot**, a built-in assistant that helps users navigate compliance-related considerations seamlessly.

This project integrates data-driven scoring logic with modern web technologies and LLM-based explanations to create an intelligent decision-support system.

---

## Features

### Core Financial Insight Engine

* Accepts structured financial inputs from users
* Computes financial stability indicators
* Estimates financial stress timeline
* Generates personalized recommendations

### AI Explanation Layer

* Uses LLM integration to interpret scoring results
* Converts technical outputs into human-readable advice
* Provides contextual reasoning behind predictions

### Smart Compliance Copilot

* Integrated compliance-support module
* Accessible directly from the homepage
* Helps users understand financial/legal considerations
* Runs within the same backend server as FinSight

### Unified Dashboard Experience

* Seamless navigation between analytics and compliance tools
* Single-server architecture
* Modular feature-based routing

---

## Tech Stack

Frontend:

* HTML / CSS / JavaScript
* React (if applicable — update if needed)

Backend:

* Python (Flask / FastAPI — update based on your stack)

AI Integration:

* DeepSeek API (LLM wrapper for explanation layer)

Other:

* Custom scoring engine
* REST API routing
* Modular backend structure

---

## Project Structure

```
FinSight-main/
│
├── backend/
│   ├── modules/
│   │   └── smart_compliance/
│   └── app.py
│
├── FinSight-frontend/
│
├── requirements.txt
└── README.md
```

---

## How It Works

1. User enters financial details
2. Scoring engine evaluates risk indicators
3. AI model explains predicted outcomes
4. Recommendations are generated
5. Optional: Smart Compliance Copilot provides regulatory guidance support

---

## Running the Project Locally

### Step 1: Clone repository

```
git clone <repo-url>
cd FinSight-main
```

### Step 2: Install dependencies

```
pip install -r requirements.txt
```

### Step 3: Start backend server

```
python app.py
```

### Step 4: Start frontend (if React)

```
npm install
npm start
```

---

## Smart Compliance Copilot Integration

Smart Compliance Copilot is implemented as a **modular feature route**:

```
/smart-compliance
```

It runs inside the same backend service as FinSight and does not require a separate server.

---

## Use Cases

* Personal financial awareness
* Budget-risk estimation
* Early financial stress prediction
* Compliance-awareness assistance
* Educational analytics dashboards

---

## Future Improvements

* User authentication system
* Persistent database storage
* Real-time analytics tracking
* Expanded compliance knowledge base
* Deployment on cloud infrastructure

---

## Author

Developed as part of a data-driven analytics project combining:

* Machine Learning concepts
* Financial scoring logic
* Backend system design
* LLM-assisted explanation generation
