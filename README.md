# Smart Road Intelligence Platform

An **industry-grade, real-time geospatial intelligence system** designed to monitor road conditions, incidents, and traffic signals, and to compute **optimal, risk-aware routing** using live data streams.

This project is built with **production-first principles** and is intentionally structured to be **open-source friendly**, extensible, and suitable for research, civic-tech, and large-scale system design demonstrations.

---

## 🚀 Project Vision

Modern navigation systems optimize primarily for distance and time. **Smart Road Intelligence Platform** goes further:

* Incorporates **real-time incidents** (flooding, accidents, hazards)
* Supports **dynamic re-routing** based on live signal feeds
* Exposes a **clean, observable backend architecture** suitable for city-scale deployments
* Demonstrates **industry-aligned frontend UX** for geospatial decision systems

This repository serves as both:

* A **reference implementation** for real-time map intelligence systems
* A **foundation for open-source collaboration** in traffic, safety, and smart-city domains

---

## 🧭 Key Features

### Real-Time Capabilities

* Live incident ingestion (WebSockets / event streams)
* Auto-synced signal feed
* Temporal filtering (last 1h / 24h / all)

### Intelligent Routing

* Route strategy evaluation (direct vs optimal)
* ETA & distance projection
* Incident-aware path visualization

### Advanced Map UX

* MapLibre-based rendering
* Dark-mode optimized basemap
* Route overlays with severity markers
* Traffic heatmap layer toggle

### Operational Dashboard

* Signal feed sidebar
* Threshold & category filters
* Live operational status indicators

---

## 🖥️ UI Preview

### Main Intelligence Dashboard

> Real-time signal feed, route planning, and incident visualization
[Dashboard View](docs/images/Screenshot (64).png)

---

### Temporal Analysis & Heatmap View

> Traffic heatmap with time-window controls and resolution tuning
[Temporal Heatmap View](docs/images/Screenshot (65).png)

---

## 🏗️ Architecture Overview

This repository follows a **scalable monorepo layout**, making it suitable for microservice evolution.

```
smart-road-intelligence-platform/
│
├── frontend/                # Next.js + MapLibre + ShadCN UI
├── backend-gateway/         # API Gateway (auth, rate-limit, aggregation)
├── route-service/           # Routing & path optimization engine
├── event-service/           # Incident ingestion & streaming
├── ml-service/              # (Planned) predictive risk & ETA models
│
├── infra/                   # Docker, compose, infra configs
└── docs/                    # Architecture, images, specs
```

### Design Principles

* Clear service boundaries
* Stateless APIs where possible
* Event-driven communication
* Observability-first (logs, metrics, traces)

---

## 🧰 Tech Stack

### Frontend

* **Next.js (App Router, TypeScript)**
* **MapLibre GL** for map rendering
* **Tailwind CSS + ShadCN UI**
* Zustand (state management)

### Backend

* Node.js (TypeScript)
* WebSockets for real-time updates
* REST + event-driven APIs

### Infrastructure

* Docker & Docker Compose
* Environment-based configuration
* Production-ready folder structure

---

## 🔐 Production-Grade Considerations

This project is intentionally aligned with **industry best practices**:

* JWT-based authentication (extensible to OAuth)
* Rate limiting & API boundaries
* Role-based access (operator vs admin – planned)
* Observability hooks (logging, metrics)
* Clean separation between UI, domain logic, and infra

---

## 🧪 Local Development

```bash
# Clone the repository
git clone https://github.com/amanvermaa01/smart-road-intelligence-platform
cd smart-road-intelligence-platform

# Start services (example)
docker-compose up --build
```

Frontend will be available at:

```
http://localhost:3000
```

---

## 🌍 Open Source Philosophy

This repository is:

* **MIT licensed**
* Open to **issues, discussions, and pull requests**
* Designed to be forked for research, hackathons, and civic projects

Potential open-source extensions:

* ML-based incident prediction
* City-scale traffic simulation
* Public data ingestion (weather, civic alerts)
* Mobile-first navigation client

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request with context

Please follow clean code and architectural consistency.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Aman Verma**
Computer Science Engineer | Full-Stack • Systems • Real-Time Platforms

GitHub: [https://github.com/amanvermaa01](https://github.com/amanvermaa01)

---

> If you are building or researching **real-time, safety-aware navigation systems**, this platform is designed to be a strong, extensible starting point.
