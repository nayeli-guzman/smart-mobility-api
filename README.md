# 🚀 Smart Mobility Platform (Cloud Native)

A cloud-native smart mobility platform designed to simulate, ingest, process, and analyze real-time urban mobility data.

This project implements a **microservices-based architecture on AWS**, including authentication, event ingestion, analytics, and user management, following cloud computing best practices.

---

## 📌 Project Overview

This platform simulates a smart city mobility system capable of:

* Generating real-time mobility events (vehicles, congestion, zones)
* Ingesting and storing data via scalable APIs
* Providing analytics and administrative summaries
* Managing users and preferences
* Securing access using JWT-based authentication (Amazon Cognito)

---

## 🏗️ Architecture

The system is composed of independent microservices:

```
root/
├── backend/
│   ├── smart-mobility-auth/
│   ├── smart-mobility-mobility-api/
│   ├── smart-mobility-admin-api/
│   ├── smart-mobility-user-api/
│   └── smart-mobility-simulator/
│
├── frontend/
│   └── (web application)
```

### Backend Services

| Service          | Description                          |
| ---------------- | ------------------------------------ |
| **auth**         | Cognito User Pool and authentication |
| **mobility-api** | Event ingestion and querying         |
| **admin-api**    | Analytics and admin summaries        |
| **user-api**     | User profile and preferences         |
| **simulator**    | Generates real-time mobility events  |

---

## ⚙️ Tech Stack

### Backend

* AWS Lambda
* API Gateway (HTTP API)
* DynamoDB
* Amazon Cognito
* Serverless Framework

### Frontend

* (Your frontend stack, e.g. React + Vite)

---

## 🔐 Authentication & Authorization

* Authentication handled via **Amazon Cognito**
* JWT tokens validated by API Gateway
* Role-based authorization implemented in backend:

  * `admin` → access to analytics & admin endpoints
  * `user` → access to personal data only

---

## 📡 API Endpoints (Summary)

### Mobility API

```
POST   /mobility/events
GET    /mobility/events
GET    /mobility/events/{eventId}
GET    /mobility/users/{userId}/history
```

### Admin API

```
GET /analytics/congestion-summary
GET /admin/summary
```

### User API

```
GET   /users/{userId}
PATCH /users/{userId}/preferences
```

---

## 🚀 Getting Started (Reproducible Setup)

### 1. Prerequisites

* Node.js (>= 18)
* Python (>= 3.11)
* AWS CLI configured
* Serverless Framework

```bash
npm install -g serverless
```

---

### 2. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-mobility.git
cd smart-mobility
```

---

## 🔧 Backend Deployment

Each backend service is deployed independently.

### Step 1: Deploy Authentication (Cognito)

```bash
cd backend/smart-mobility-auth
serverless deploy
```

---

### Step 2: Deploy APIs

Deploy in this order:

```bash
cd ../smart-mobility-mobility-api
serverless deploy

cd ../smart-mobility-admin-api
serverless deploy

cd ../smart-mobility-user-api
serverless deploy
```

---

### Step 3: Add Admin User

After deployment, assign a user to the `admin` group:

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_USER_POOL_ID \
  --username YOUR_EMAIL \
  --group-name admin \
  --region eu-north-1
```

Then **log in again** to refresh your JWT token.

---

### Step 4: Deploy Simulator

```bash
cd ../smart-mobility-simulator
serverless deploy
```

This will start generating real-time mobility events it is going to be running with containers.

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Make sure your frontend is configured with:

* API Gateway URLs
* Cognito Client ID

---

## 🧪 Testing the APIs

Use Postman or curl with a valid JWT token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
https://YOUR_API_ID.execute-api.eu-north-1.amazonaws.com/admin/summary
```

---

## 📊 Observability

* Logs available in **CloudWatch**
* Metrics:

  * Lambda invocations
  * Errors
  * API Gateway responses

---

## 🔄 Reproducibility

This project is fully reproducible thanks to:

* Infrastructure as Code (Serverless Framework)
* Independent microservices
* Declarative AWS resources (CloudFormation)
* Environment-based configuration

To recreate the system, simply:

1. Configure AWS credentials
2. Deploy each service
3. Connect frontend (https://main.d1xjhbruratny3.amplifyapp.com)

---

## 📁 Deliverables

* Cloud architecture diagram
* Backend microservices (Serverless)
* Frontend application 
* Deployment-ready infrastructure
* API endpoints with authentication & authorization

---

## 📌 Notes

* DynamoDB uses **on-demand billing** for cost optimization
* Lambda ensures automatic scalability
* API Gateway provides secure exposure of services


