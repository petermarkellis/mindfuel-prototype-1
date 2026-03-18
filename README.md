# React Flow Data Product Management Prototype

![Screenshot of the Prototype](./screenshot.png)

## 🚀 Live Demo

**Try the live prototype:** [https://mindfuel-prototype.petermarkellis.com/](https://mindfuel-prototype.petermarkellis.com/)
**Password:** `mindfuel2024`

---

This repository contains a **mock prototype** built to explore the integration of [React Flow](https://reactflow.dev/) into a Data Product Management platform. The prototype was developed during my time as a Frontend Engineer at [Mindfuel.ai](https://mindfuel.ai).

## Project Purpose

The goal of this prototype was to:

- **Visualize** how lists of connected entities (such as data products, assets, and sources) could be improved using an off-the-shelf solution like React Flow.
- **Explore user interactions** with a graph-based interface for managing data products.
- **Gather initial feedback** from our user testing group via Slack to inform future product decisions.

## Tech Stack

### Frontend
- **React + Vite** – Modern React development with fast HMR
- **React Flow** – Interactive node-based graph visualization
- **Tailwind CSS** – Utility-first CSS framework for rapid UI development
- **GSAP** – Animation library for smooth UI transitions
- **Tabler Icons** – Modern icon set for UI controls

### Backend & Database
- **Neon** – Serverless PostgreSQL with autoscaling
- **@neondatabase/serverless** – Optimized Neon driver for Vercel serverless functions
- **PostgreSQL** – Robust relational database for data persistence
- **Vercel Serverless API** – Backend API endpoints for database operations

### Deployment
- **Vercel** – Full-stack hosting and CI/CD platform
- **Neon Cloud** – Managed serverless database hosting

## Features

- Interactive graph visualization of data products and their relationships
- Custom node types, edge types, and controls
- Responsive, animated side panels and control panels
- Inline editing of node details (title, risk, etc.)
- Node locking, custom connection handles, and more
- User feedback loop via Slack

## Deployment

- **Hosted on Vercel** for fast, reliable previews and production deployments
- **CI/CD** enabled for automatic builds and previews on every push

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- A Neon account (for database functionality)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Neon Database:**
   - Create a new project at [neon.tech](https://neon.tech)
   - Create a database and copy the connection string (DATABASE_URL)
   - Go to SQL Editor and run the schema from `supabase/migrations/001_initial_schema.sql`
   - See `docs/NEON_SETUP.md` for detailed setup instructions

4. **Configure Environment Variables:**
   
   **Local Development:** Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require
   ```
   
   **Vercel Deployment:** Add `DATABASE_URL` to your Vercel project environment variables

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:5173](http://localhost:5173) in your browser.**

### Database Schema

The database schema is located in `supabase/migrations/001_initial_schema.sql` and includes:
- `nodes` table - Stores all graph nodes with metadata
- `edges` table - Stores relationships between nodes
- `risks` table - Risk level definitions
- `users` table - User information for creators/updaters

## Usage

- Click on nodes to view and edit details in the SideDrawer.
- Drag from any connector (top, bottom, left, right) to create relationships between nodes.
- Use the custom controls to zoom, fit view, reset, or lock node positions.
- Edit node titles and risk values inline for rapid prototyping.

## Caveats

- Not all side connectors are functional; some are present for orientation and user testing purposes only.
- This prototype omits features such as admin settings, a global navigation bar, and other production-level functionality.
- Please note: this is a mock prototype app intended for demonstration and feedback gathering.
- This is a desktop only experience

## Screenshot

![Screenshot of the Prototype](./screenshot.png)

## Feedback

This prototype was used to gather feedback from our user testing group in Slack. If you have suggestions or want to discuss the approach, feel free to open an issue or reach out!

---

## Design Engineer

**Peter Ellis**
[petermarkellis@gmail.com](mailto:petermarkellis@gmail.com)
