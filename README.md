# CircularSync AI — Circular Economy Intelligence Platform

**CircularSync AI** turns a neighborhood into a self-sustaining resource network. Producers log discarded raw materials, the platform's AI matching engine pairs them with nearby consumers, a dynamic logistics optimizer consolidates pickups, and an impact engine calculates verifiable CO2, water, landfill, and financial savings.

---

## 🌟 Tech Stack & Features

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS + Radix UI primitives, Ledger & Loam custom design tokens, Recharts, D3.js (`d3-force`), Leaflet + OpenStreetMap tiles, Lucide icons, Google Fonts (Fraunces, IBM Plex Sans, IBM Plex Mono).
- **Backend**: Node.js, Express.js, Prisma ORM, Supabase Postgres, Supabase Storage, JWT auth, bcrypt, Zod, node-cron.
- **AI Engines**:
  1. **NLP Keyword Classifier**: Material taxonomy extraction, unit parsing, quality grade inference.
  2. **AI Symbiosis Matchmaker**: Transparent 4-part weighted scoring (`0.4*compatibility + 0.3*volume + 0.2*distance + 0.1*timing`) with slide-over Reasoning Drawer.
  3. **Predictive Waste Engine**: 4-week SMA, weekend multipliers (×1.3), Open-Meteo keyless rain weather signal (×0.7), 7-day forecast chart & alert banner.
  4. **Dynamic Logistics Optimizer**: Grid-based spatial clustering & Nearest-Neighbor TSP route ordering with Leaflet OSM map.
  5. **Impact Intelligence Engine**: CO2, water, landfill, cost savings calculation with client-side PDF ESG report export.
  6. **Community Network Visualizer**: D3 force-directed graph with animated material flow pulses & symbiosis gaps.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `server` directory:
```bash
cp server/.env.example server/.env
```

### 3. Run Development Servers
```bash
npm run dev
```

- Frontend client runs at `http://localhost:3000`
- Backend API runs at `http://localhost:5000`
- Demo quick login available at `http://localhost:3000/demo-login`
