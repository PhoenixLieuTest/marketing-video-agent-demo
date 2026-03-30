Hardened OpenClaw Integration: Secure AI Agent Gateway

This repository demonstrates a security-first approach to integrating the OpenClaw AI Agent into a modern web application (React + FastAPI).

🛡️ The Security Challenge
OpenClaw is a powerful AI agent, but its default network configuration can expose sensitive service endpoints to the public internet if misconfigured. The goal of this project is to implement a Two-Layer Defense to ensure the AI agent remains accessible to the local backend while being invisible to external threats.

🏗️ Security Architecture (Hardening Logic)

Layer 1: Container Isolation
We encapsulate the OpenClaw Gateway Server within a Docker container. This ensures that the agent's environment is decoupled from the host OS, preventing potential exploits from escalating to the local system.

Layer 2: Loopback Network Binding
The core of the security strategy lies in the network configuration:
Inside the Container (openclaw.json): We bind the gateway to lan.

Why? Binding to 127.0.0.1 inside a container would restrict traffic to the container itself, making it unreachable by the host’s backend.
On the Host (docker-compose.yml): We map the port specifically to 127.0.0.1:18789:18789.

The Result: The Docker daemon only listens on the host's loopback interface. Even if an attacker knows your IP, they cannot access the port because 127.0.0.1 is non-routable from external networks.

🚀 Configuration
1. OpenClaw Hardening (openclaw.json)
Set the gateway to lan mode to allow container-to-host communication, while enabling token-based authentication.
{
  "gateway": {
    "bind": "lan",
    "mode": "local",
    "port": 18789,
    "auth": {
      "mode": "token"
    },
    "controlUi": {
      "enabled": true,
      "allowedOrigins": [
        "http://127.0.0.1:18789",
        "http://localhost:18789",
        "http://localhost:5173"
      ],
      "allowInsecureAuth": true,
      "dangerouslyAllowHostHeaderOriginFallback": true,
      "dangerouslyDisableDeviceAuth": true
    }
  }
}

2. Docker Orchestration (docker-compose.yml)
Explicitly bind to the local loopback address to prevent 0.0.0.0 exposure.
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    ports:
      - "127.0.0.1:18789:18789" # Strict local binding
    env_file:
      - .env
    volumes:
      - ./openclaw-home:/home/node/.openclaw
    deploy:
      resources:
        limits:
          memory: 2g
          cpus: '1.5'

3. Resource Constraints:
   To prevent Denial of Service (DoS) or system instability during heavy video rendering, hardware limits are enforced:
   1. Memory: Limited to 2GB.
   2. CPU: Limited to 1.5 cores.


4. Environment Variables

   For openclaw directory (.env):
   OPENCLAW_GATEWAY_TOKEN=your_long_random_token_here

   For fast api back end directory(.env):
   GATEWAY_URL=http://127.0.0.1:18789
   BACKEND_PORT=8000
   JSON_2_VIDEO=your_api_key_here


5﹒Docker Deployment
   Run the following command to start the hardened gateway:
   docker compose down
   docker compose up -d


marketing-video-agent-demo/
├── openclaw/               # Hardened Gateway Layer
│   ├── docker-compose.yml  # Strict 127.0.0.1 port binding
│   └── openclaw-home/      # Config & Persistence
├── frontend/               # React + Vite UI
│   ├── src/
│   │   ├── components/     # UI Components (e.g., VideoGenForm)
│   │   ├── hooks/          # Logic (e.g., useOpenClawTest)
│   │   ├── services/       # API abstraction (Axios/Fetch)
│   │   └── types/          # TypeScript Interfaces
└── backend/                # FastAPI (Python) Server

💻 Tech Stack
Frontend: React, TypeScript, Vite (Grouped hooks/services for maintainability)
Backend: Python FastAPI
AI Orchestration: OpenClaw Agent via Docker
Infrastructure: Docker Compose, Network Security Hardening, WSL2
