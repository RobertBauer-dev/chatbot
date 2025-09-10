# Conversational AI Platform

Eine vollständige White-Label Conversational AI Plattform für Unternehmenskunden mit Chatbots und Voicebots, die in einer On-Premise-Umgebung läuft.

## 🏗️ Architektur-Übersicht

### Grobe Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (Java/Python) │
│   Port: 3000    │    │   Port: 8080    │    │   Ports: 8081,  │
└─────────────────┘    └─────────────────┘    │   8000          │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   MongoDB       │
                                              │   Port: 27017   │
                                              └─────────────────┘
```

### Detaillierte Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  React Application (Port 3000)                                              │
│  ├── ChatInterface.js          - Haupt-Chat-UI                             │
│  ├── LoginForm.js              - Authentifizierung                         │
│  ├── Header.js                 - Navigation                                │
│  ├── AuthContext.js            - Authentifizierungs-Context                │
│  ├── authService.js            - API-Calls für Auth                        │
│  └── chatService.js            - API-Calls für Chat                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/REST
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Spring Boot Gateway (Port 8080)                                           │
│  ├── ApiGatewayApplication.java  - Hauptklasse                             │
│  ├── JwtAuthenticationFilter.java - JWT-Authentifizierung                  │
│  ├── AuthController.java         - Login/Register Endpoints                │
│  ├── AuthService.java            - Authentifizierungs-Logik                │
│  ├── LoginRequest.java           - DTO für Login                           │
│  └── LoginResponse.java          - DTO für Login Response                  │
│                                                                             │
│  Routing:                                                                   │
│  ├── /api/sessions/** → session-service:8081                               │
│  ├── /api/nlu/** → nlu-service:8000                                        │
│  └── /api/chat/** → session-service:8081                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/gRPC
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MICROSERVICES LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                │
│  │   Session Service       │    │   NLU Service           │                │
│  │   (Spring Boot)         │    │   (Python FastAPI)      │                │
│  │   Port: 8081            │    │   Port: 8000            │                │
│  ├─────────────────────────┤    ├─────────────────────────┤                │
│  │ SessionService.java     │    │ main.py                 │                │
│  │ ChatService.java        │    │ nlu_service.py          │                │
│  │ ChatController.java     │    │ intent_classifier.py    │                │
│  │ SessionController.java  │    │ request_models.py       │                │
│  │ Session.java            │    │ mongodb.py              │                │
│  │ ConversationMessage.java│    │                         │                │
│  │ SessionRepository.java  │    │                         │                │
│  └─────────────────────────┘    └─────────────────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ MongoDB Protocol
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  MongoDB (Port 27017)                                                       │
│  ├── sessions         - Benutzer-Sessions und Kontexte                     │
│  ├── conversations    - Chat-Nachrichten und Verläufe                      │
│  ├── intents          - Intent-Definitionen und Beispiele                  │
│  └── analytics        - Klassifizierungs-Logs und Metriken                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Schnellstart

### Voraussetzungen

- Docker & Docker Compose
- Java 17+ (für lokale Entwicklung)
- Node.js 18+ (für lokale Frontend-Entwicklung)
- Maven 3.6+ (für lokale Backend-Entwicklung)

### Installation und Start

1. **Repository klonen:**
```bash
git clone <repository-url>
cd chatbot
```

2. **Services starten:**
```bash
# Alle Services mit Docker Compose starten
docker-compose up --build

# Oder mit dem Build-Skript
./build.sh
```

3. **Anwendung öffnen:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- NLU Service: http://localhost:8000
- MongoDB: localhost:27017

### Demo-Zugangsdaten

- **Username:** demo
- **Password:** password123

## 📁 Projektstruktur

```
chatbot/
├── docker-compose.yml              # Docker Compose Konfiguration
├── build.sh                       # Build-Skript für alle Services
├── README.md                      # Diese Dokumentation
│
├── api-gateway/                   # API Gateway Service
│   ├── pom.xml                    # Maven Dependencies
│   ├── Dockerfile                 # Docker Image Definition
│   └── src/main/java/com/chatbot/gateway/
│       ├── ApiGatewayApplication.java      # Spring Boot Hauptklasse
│       ├── security/
│       │   └── JwtAuthenticationFilter.java # JWT Authentifizierung
│       ├── controller/
│       │   └── AuthController.java         # Auth Endpoints
│       ├── service/
│       │   └── AuthService.java            # Auth Business Logic
│       ├── dto/
│       │   ├── LoginRequest.java           # Login Request DTO
│       │   └── LoginResponse.java          # Login Response DTO
│       └── resources/
│           └── application.yml             # Spring Konfiguration
│
├── session-service/               # Session Management Service
│   ├── pom.xml                    # Maven Dependencies
│   ├── Dockerfile                 # Docker Image Definition
│   └── src/main/java/com/chatbot/session/
│       ├── SessionServiceApplication.java  # Spring Boot Hauptklasse
│       ├── model/
│       │   ├── Session.java                # Session Entity
│       │   └── ConversationMessage.java    # Message Entity
│       ├── dto/
│       │   ├── ChatRequest.java            # Chat Request DTO
│       │   └── ChatResponse.java           # Chat Response DTO
│       ├── repository/
│       │   └── SessionRepository.java      # MongoDB Repository
│       ├── service/
│       │   ├── SessionService.java         # Session Business Logic
│       │   └── ChatService.java            # Chat Business Logic
│       ├── controller/
│       │   ├── ChatController.java         # Chat Endpoints
│       │   └── SessionController.java      # Session Endpoints
│       └── resources/
│           └── application.yml             # Spring Konfiguration
│
├── nlu-service/                   # Natural Language Understanding Service
│   ├── requirements.txt           # Python Dependencies
│   ├── Dockerfile                 # Docker Image Definition
│   ├── main.py                    # FastAPI Hauptanwendung
│   ├── models/
│   │   └── request_models.py      # Pydantic Models
│   ├── services/
│   │   ├── nlu_service.py         # NLU Business Logic
│   │   └── intent_classifier.py   # Intent Klassifizierung
│   └── database/
│       └── mongodb.py             # MongoDB Verbindung
│
├── frontend/                      # React Frontend
│   ├── package.json               # Node.js Dependencies
│   ├── Dockerfile                 # Docker Image Definition
│   ├── nginx.conf                 # Nginx Konfiguration
│   ├── public/
│   │   └── index.html             # HTML Template
│   └── src/
│       ├── index.js               # React Entry Point
│       ├── index.css              # Globale Styles
│       ├── App.js                 # Haupt React Komponente
│       ├── contexts/
│       │   └── AuthContext.js     # Authentifizierungs Context
│       ├── services/
│       │   ├── authService.js     # Auth API Service
│       │   └── chatService.js     # Chat API Service
│       └── components/
│           ├── Header.js          # Header Komponente
│           ├── LoginForm.js       # Login Formular
│           └── ChatInterface.js   # Chat Interface
│
└── scripts/
    └── mongo-init.js              # MongoDB Initialisierung
```

## 🔧 Detaillierte Dateibeschreibungen

### Docker & Orchestrierung

#### `docker-compose.yml`
- **Zweck:** Orchestriert alle Services in einem Docker-Netzwerk
- **Services:** MongoDB, API Gateway, Session Service, NLU Service, Frontend
- **Netzwerk:** `chatbot-network` für interne Kommunikation
- **Volumes:** MongoDB Daten-Persistierung

#### `build.sh`
- **Zweck:** Automatisiertes Build-Skript für alle Services
- **Funktionen:** Maven Build, npm Build, Docker Compose Start

### API Gateway (`api-gateway/`)

#### `ApiGatewayApplication.java`
- **Zweck:** Spring Boot Hauptklasse mit Gateway-Konfiguration
- **Features:** Route-Definition für Microservices, CORS-Konfiguration

#### `JwtAuthenticationFilter.java`
- **Zweck:** Globale JWT-Authentifizierung für alle Requests
- **Features:** Token-Validierung, User-Context-Extraktion, Public-Path-Bypass

#### `AuthController.java`
- **Zweck:** REST-Endpoints für Authentifizierung
- **Endpoints:** `/api/auth/login`, `/api/auth/register`

#### `AuthService.java`
- **Zweck:** Authentifizierungs-Business-Logic
- **Features:** JWT-Generierung, Passwort-Hashing, Demo-User-Management

### Session Service (`session-service/`)

#### `Session.java`
- **Zweck:** MongoDB Entity für Benutzer-Sessions
- **Features:** Session-Status, Kontext-Management, Message-History

#### `ConversationMessage.java`
- **Zweck:** Entity für Chat-Nachrichten
- **Features:** Message-Typen (USER/BOT/SYSTEM), Intent-Informationen

#### `ChatService.java`
- **Zweck:** Chat-Business-Logic und NLU-Service-Integration
- **Features:** Message-Processing, Intent-Klassifizierung, Response-Generierung

#### `SessionService.java`
- **Zweck:** Session-Management-Business-Logic
- **Features:** Session-Erstellung, Cleanup, User-Session-Retrieval

### NLU Service (`nlu-service/`)

#### `main.py`
- **Zweck:** FastAPI Hauptanwendung
- **Features:** REST-API, CORS, Health-Checks, Service-Initialisierung

#### `intent_classifier.py`
- **Zweck:** Intent-Klassifizierung mit regelbasiertem Ansatz
- **Features:** Pattern-Matching, Entity-Extraktion, Confidence-Scoring

#### `nlu_service.py`
- **Zweck:** NLU-Business-Logic und MongoDB-Integration
- **Features:** Classification-Logging, Analytics, Intent-Management

### Frontend (`frontend/`)

#### `App.js`
- **Zweck:** Haupt-React-Komponente mit Routing
- **Features:** Authentifizierungs-Context, Conditional-Rendering

#### `ChatInterface.js`
- **Zweck:** Haupt-Chat-UI-Komponente
- **Features:** Message-Exchange, Suggestion-Chips, Real-time-Updates

#### `LoginForm.js`
- **Zweck:** Authentifizierungs-Formular
- **Features:** Login/Register-Toggle, Form-Validation, Demo-Credentials

#### `AuthContext.js`
- **Zweck:** React Context für Authentifizierungs-Status
- **Features:** Token-Management, User-State, Login/Logout-Functions

### Datenbank (`scripts/mongo-init.js`)

#### MongoDB Initialisierung
- **Zweck:** Datenbank-Setup und Sample-Data
- **Features:** Collection-Erstellung, Index-Definition, Intent-Beispiele

## 🔄 Datenfluss

### Chat-Nachricht Verarbeitung

```
1. User sendet Nachricht über Frontend
   ↓
2. Frontend → API Gateway (/api/chat/message)
   ↓
3. API Gateway → Session Service (mit JWT-Validierung)
   ↓
4. Session Service speichert User-Message in MongoDB
   ↓
5. Session Service → NLU Service (/api/nlu/classify)
   ↓
6. NLU Service klassifiziert Intent und extrahiert Entities
   ↓
7. NLU Service → Session Service (Intent + Confidence)
   ↓
8. Session Service generiert Bot-Response basierend auf Intent
   ↓
9. Session Service speichert Bot-Message in MongoDB
   ↓
10. Session Service → API Gateway (ChatResponse)
    ↓
11. API Gateway → Frontend (JSON Response)
    ↓
12. Frontend zeigt Bot-Response und Suggestions an
```

## 🛠️ Entwicklung

### Lokale Entwicklung

```bash
# Backend Services starten
cd api-gateway && mvn spring-boot:run
cd session-service && mvn spring-boot:run
cd nlu-service && python main.py

# Frontend starten
cd frontend && npm start
```

### Testing

```bash
# API Tests
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"password123"}'

# Chat Test
curl -X POST http://localhost:8080/api/chat/message/public \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?"}'
```

## 📊 Monitoring & Analytics

### Health Checks
- API Gateway: http://localhost:8080/actuator/health
- Session Service: http://localhost:8081/actuator/health
- NLU Service: http://localhost:8000/health

### Analytics Endpoints
- NLU Analytics: http://localhost:8000/api/nlu/analytics
- Intent Distribution: http://localhost:8000/api/nlu/intents

## 🔒 Sicherheit

- **JWT-basierte Authentifizierung** mit HMAC-Signierung
- **CORS-Konfiguration** für Cross-Origin-Requests
- **Input-Validation** mit Bean Validation
- **TLS-gesicherte Kommunikation** (in Produktion)
- **Rate Limiting** (über API Gateway)

## 🚀 Deployment

### Produktions-Deployment

1. **Umgebungsvariablen setzen:**
```bash
export MONGODB_URI=mongodb://prod-mongo:27017/chatbot_prod
export JWT_SECRET=your-production-secret
```

2. **Docker Compose mit Produktions-Konfiguration:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Kubernetes Manifests anwenden
kubectl apply -f k8s/
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🆘 Support

Bei Fragen oder Problemen:
- Erstelle ein Issue im Repository
- Kontaktiere das Entwicklungsteam
- Konsultiere die API-Dokumentation

---

**Entwickelt mit ❤️ für moderne Conversational AI Anwendungen**
