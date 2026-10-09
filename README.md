# AI-Powered IT Support Agent

An AI-driven IT support system that understands employee requests, automatically performs system-status checking, and creates/updates tickets using MCP (Model Context Protocol) concepts. 

## Tech Stack
* **Frontend**: React.js (Vite), Vanilla CSS (Premium Dark Mode UI)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Local or Atlas)
* **Cache/Queue**: Redis
* **AI/LLM**: Google Gemini API (Free Tier available)
* **Infrastructure**: Docker, Docker Compose

## Features
* **Natural Language Understanding**: Understands user intent via Gemini API.
* **LLM Tool Calling**: AI automatically decides to call functions like `create_ticket` or `check_system_status` based on the conversation context.
* **Live Ticket Sync**: React dashboard polls and updates when the AI creates a ticket.
* **Secure**: JWT Authentication, password hashing, and Helmet for HTTP headers.

---

## Running Locally

1. **Prerequisites**: Docker & Docker Compose installed.
2. **Environment Variables**:
   In `backend/.env` (create if not exists) or just pass it in docker-compose.yml:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is provided, the AI operates in "Mock Mode" for easy testing.*

3. **Start the Project**:
   ```bash
   docker-compose up --build
   ```

4. **Access**:
   * Frontend: `http://localhost:3000`
   * Backend API: `http://localhost:5000`

---

## AWS Free Tier Deployment Guide

To deploy this entire stack on AWS Free Tier:

### 1. Database & Cache
Instead of running MongoDB and Redis on a small EC2 instance (which consumes memory), use external Free Tiers:
* **MongoDB Atlas**: Create a free shared cluster. Get the connection string and set `MONGO_URI`.
* **Redis Labs (Redis Enterprise Cloud)**: Create a free 30MB instance. Get the endpoint and set `REDIS_URL`.

### 2. EC2 Instance (Backend & Frontend)
1. Go to AWS EC2 console.
2. Launch a **t2.micro** instance (Free tier eligible) using Amazon Linux 2 or Ubuntu 22.04.
3. **Security Groups**: Open ports `80` (HTTP), `443` (HTTPS), and `22` (SSH). 
4. SSH into your instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```
5. Install Docker and Docker Compose on the EC2 instance.
6. Clone your repository (or copy these files) to the EC2 instance.
7. Modify your `docker-compose.yml` for production:
   * Remove the `mongo` and `redis` services.
   * Update the environment variables in the `backend` service to point to your MongoDB Atlas and Redis Labs URIs.
   * Make sure `GEMINI_API_KEY` is set.
8. Run `docker-compose up -d --build`.

### 3. Frontend Production Build (Optimization)
In the current setup, Vite runs in dev mode inside Docker. For production on EC2:
* Modify the Frontend Dockerfile to build the static files (`npm run build`).
* Use an Nginx image to serve the `/dist` folder on port 80.
* Configure Nginx as a reverse proxy to route `/api/*` requests to the Node.js backend on port 5000.

### Security Concepts Included
- **JWT**: Stateless, secure authentication.
- **Bcrypt**: Passwords are mathematically hashed, preventing data breach leaks.
- **Helmet**: Adds security headers to Express.
- **CORS**: Prevents unauthorized domains from accessing the API.

### Performance Concepts Included
- **Redis Integration**: Configured in backend, ready to be used for caching frequent queries or rate limiting.
- **Vite**: Extremely fast frontend tooling.
- **Docker Multi-container**: Scalable architecture.
