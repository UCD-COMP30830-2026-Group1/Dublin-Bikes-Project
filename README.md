# Dublin Bikes — Real-Time Station & Route Planning App

A full-stack web application for Dublin Bikes users, providing real-time station availability, intelligent route planning, and machine learning-powered bike availability predictions.

**🌐 Live Demo:** [https://bikes.thegaff.io](https://bikes.thegaff.io)

---

## ✨ Features

- **Real-Time Station Map** — Live bike and stand availability across all Dublin Bikes stations, colour-coded and updated every 5 minutes
- **Smart Route Planner** — Three-leg journey planner (walk → cycle → walk) powered by Google Routes API, with time and distance estimates for each leg
- **ML Availability Predictions** — Random Forest model predicts bike availability 30 minutes ahead at any station, with a confidence rating
- **Weather Integration** — Current conditions and 24-hour hourly forecast from OpenWeather API
- **Nearest Stations** — Automatically surfaces the closest stations to your current location via "Localise Me"

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Google Maps JavaScript API |
| Backend | Python Flask, Gunicorn, SQLAlchemy ORM |
| Machine Learning | Scikit-learn (Random Forest), Pandas |
| Database | Amazon RDS (MySQL) |
| Deployment | AWS EC2, Docker Compose, Nginx, Cloudflare |
| Data Collection | Python scrapers (JCDecaux API, OpenWeather API) |
| Testing | pytest, unittest.mock (93% coverage) |

---

## 🏗 Architecture

```
End User
    ↓ HTTPS (bikes.thegaff.io)
Cloudflare (DNS + CDN, Full Strict Mode)
    ↓
AWS EC2 — Docker Compose Internal Network
    ├── Nginx Container       (SSL termination, reverse proxy, port 80/443)
    ├── Flask Backend         (REST API + ML inference, port 5000 internal only)
    ├── Bikes Scraper Bot     (JCDecaux API, every 5 mins)
    └── Weather Scraper Bot   (OpenWeather API, every hour)
            ↓
    Amazon RDS (MySQL)
    ├── Active DB             (7-day rolling window, live API queries)
    └── Archive DB            (2-month dataset, offline ML training)
```

---

## 📁 Project Structure

```
Dublin-Bikes-Project/
├── frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── pages/                   # MapView, StationList, RoutePlanning, Dashboard
│   │   ├── api/                     # stationService.js, routePlanningService.js
│   │   └── App.jsx
│   └── nginx.conf                   # Nginx config (SSL + reverse proxy)
├── flask_app/                       # Flask backend
│   ├── routes/                      # station_routes, weather_routes, route_planning
│   └── ml/                          # train_model.py, feature_engineering.py
├── data_scripts/
│   └── automation/
│       ├── 2_scraper_bikes.py       # JCDecaux scraper (every 5 mins)
│       └── 3_scraper_weather.py     # OpenWeather scraper (every hour)
├── common/
│   ├── models.py                    # SQLAlchemy ORM models
│   ├── database.py                  # Singleton connection pool
│   ├── api_response.py              # Standardised JSON response wrapper
│   └── extensions.py               # Flask-Caching setup
├── tests/
│   ├── smoke/
│   │   ├── test_smoke.py            # System-level connectivity tests
│   │   └── test_predict.py          # Post-deployment verification script
│   └── unit/                        # Unit tests (93% coverage)
├── docker-compose.yml
├── Dockerfile
└── dbinfo.py                        # ⚠️ NOT in repo — see Configuration
```

---

## ⚙️ Configuration

This project requires a `dbinfo.py` file containing database credentials and API keys. This file is excluded from the repository for security reasons. Create it in the project root with the following structure:

```python
# Database
URI_ML     = "mysql+pymysql://user:password@your-rds-endpoint/active_db"
URI_2DAY   = "mysql+pymysql://user:password@your-rds-endpoint/archive_db"
DB_NAME_ML = "active_db"

# JCDecaux
JCKEY        = "your_jcdecaux_api_key"
NAME         = "dublin"
STATIONS_URI = "https://api.jcdecaux.com/vls/v1/stations"

# OpenWeather
WEATHER_KEY = "your_openweather_api_key"
WEATHER_URI = "https://api.openweathermap.org/data/3.0/onecall"
CITY_LAT    = 53.3498
CITY_LNG    = -6.2603

# Google Routes API key
GOOGLE_ROUTES_API_KEY=your_google_routes_api_key

# Google Maps key
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```


---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/UCD-COMP30830-2026-Group1/Dublin-Bikes-Project.git
cd Dublin-Bikes-Project

# Add your credentials (see Configuration above)

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

The application will be available at `http://localhost`.

---

## 🤖 Machine Learning

The prediction model is a **Random Forest Regressor** trained on two months of historical station availability and weather data.

**Features:** hour of day, day of week, available bikes, station capacity, temperature, humidity, wind speed, rainfall

**Training the model:**

```bash
# From the project root
python flask_app/ml/train_model.py
```

The trained model is saved as `flask_app/ml/model.pkl`.

---

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run full test suite with coverage
pytest tests/ -v --cov=flask_app --cov-report=term-missing

# Run post-deployment smoke test against live server
python tests/smoke/test_predict.py --url https://bikes.thegaff.io
```

**Coverage summary:**

| Module | Coverage |
|---|---|
| `flask_app/__init__.py` | 100% |
| `feature_engineering.py` | 100% |
| `train_model.py` | 98% |
| `station_routes.py` | 94% |
| `weather_routes.py` | 98% |
| `route_planning.py` | 84% |
| **Total** | **93%** |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stations/live` | All stations with latest availability |
| GET | `/api/stations/static` | Static station metadata |
| GET | `/api/stations/realtime` | Live data from JCDecaux |
| GET | `/api/stations/historical?number=42` | Historical availability for a station |
| GET | `/api/stations/predict?number=42` | ML bike availability prediction |
| GET | `/api/weather/current` | Current weather conditions |
| GET | `/api/weather/forecast` | 24-hour hourly forecast |
| POST | `/api/routes/plan` | Plan a three-leg cycling journey |

---

## 🐳 Deployment Notes

| Container | Memory | CPU | Role |
|---|---|---|---|
| `dublin-bikes-api` | 700MB | 0.80 | Flask API + ML inference |
| `bikes-bot` | 200MB | 0.10 | JCDecaux scraper |
| `weather-bot` | 200MB | 0.10 | OpenWeather scraper |
| `dublin-bikes-front` | 100MB | — | Nginx static file serving |

- All containers run with `restart: always` for automatic recovery
- Swap memory enabled on EC2 host for transient spike absorption
- SSL handled by Nginx via Let's Encrypt certificate
- Credentials injected via `dbinfo.py` volume mount, never baked into Docker image
- Flask port 5000 is internal only (`expose`, not `ports`)

---

## 👥 Team

**Group 1 — COMP30830 Software Engineering, UCD 2026**

| Name | Contribution |
|---|---|
| Youssef Bouarada | 33.33% |
| Yangxiaoshi Gao | 33.33% |
| Yuhan Wang |33.33% |
