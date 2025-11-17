# HomeEase RAG Chatbot

A production-ready RAG (Retrieval-Augmented Generation) chatbot system for the HomeEase platform using n8n, Docker, Qdrant vector database, and Google Gemini API.

> 🚀 **New to deployment?** Start with **[START-HERE.md](./START-HERE.md)** for a guided experience!
> 
> **Quick Links:**
> - 🐳 [Deploy Full Stack on Render](./RENDER-FULL-STACK.md) (~$14/month)
> - 💰 [Deploy with Free Tiers](./QUICKSTART-RENDER.md) ($0 to start)
> - 📊 [Compare Deployment Options](./DEPLOYMENT-COMPARISON.md)

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│  Chatbot API │─────▶│     n8n     │
│  Frontend   │◀─────│  (Express)   │◀─────│  Workflow   │
└─────────────┘      └──────────────┘      └─────────────┘
                              │                     │
                              ▼                     ▼
                      ┌──────────────┐      ┌─────────────┐
                      │  PostgreSQL  │      │   Qdrant    │
                      │  (Chat Log)  │      │ (Vector DB) │
                      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │   Gemini    │
                                            │     API     │
                                            └─────────────┘
```

## 📁 Project Structure

```
chatbot/
├── api/                          # Express API server
│   ├── server.js                 # Main API server
│   ├── package.json
│   └── Dockerfile
├── data-ingestion/               # Vector DB ingestion scripts
│   ├── ingest-data.js           # Main ingestion script
│   ├── test-search.js           # Test vector search
│   └── package.json
├── workflows/                    # n8n workflow definitions
│   └── homeease-rag-chatbot.json # Main RAG workflow
├── docker-compose.yml            # Docker orchestration
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### Step 1: Environment Setup

1. Copy the environment template:
```bash
cd chatbot
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
# Required
GEMINI_API_KEY=your-gemini-api-key-here

# Generate random secrets (use: openssl rand -hex 32)
N8N_ENCRYPTION_KEY=your-random-32-char-hex
N8N_JWT_SECRET=your-random-32-char-hex

# Set secure credentials
N8N_AUTH_USER=admin
N8N_AUTH_PASSWORD=your-secure-password
POSTGRES_USER=chatbot_user
POSTGRES_PASSWORD=your-postgres-password
```

### Step 2: Start Services

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **n8n** (http://localhost:5678) - Workflow automation
- **Qdrant** (http://localhost:6333) - Vector database
- **PostgreSQL** (localhost:5432) - Chat history
- **Chatbot API** (http://localhost:3001) - REST API

Check status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

### Step 3: Configure n8n

1. Access n8n at http://localhost:5678
2. Login with credentials from `.env`
3. Import the workflow:
   - Go to Workflows → Import from File
   - Select `workflows/homeease-rag-chatbot.json`

4. Configure credentials:
   - **Google Gemini API**: Add your API key
   - **Qdrant**: URL: `http://qdrant:6333`
   - **PostgreSQL**: 
     - Host: `postgres`
     - Database: `chatbot_db`
     - User/Password: from `.env`

5. Activate the workflow

### Step 4: Ingest Knowledge Base

Install dependencies and run ingestion:

```bash
cd data-ingestion
npm install
npm run ingest
```

This will:
- Create Qdrant collection `homeease_knowledge`
- Generate embeddings for FAQs and navigation data
- Upload vectors to Qdrant

Test the search:
```bash
npm run test-search
```

### Step 5: Integrate Frontend

The chatbot component is already created in `client/src/components/Chatbot.jsx`.

Add to your React app:

```javascript
// In client/src/App.js
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div>
      {/* Your existing app */}
      <Chatbot />
    </div>
  );
}
```

Add environment variable in `client/.env`:
```env
REACT_APP_CHATBOT_API_URL=http://localhost:3001
```

## 🔧 Configuration

### n8n Workflow

The RAG pipeline workflow:
1. **Webhook** - Receives chat messages
2. **Extract Message** - Parses user input
3. **Generate Embedding** - Creates vector using Gemini
4. **Search Vector DB** - Queries Qdrant for relevant context
5. **Aggregate Context** - Combines search results
6. **Build Prompt** - Creates prompt with context
7. **Gemini Chat** - Generates response
8. **Log to Database** - Stores chat history
9. **Respond** - Returns response to API

### Vector Database

- **Collection**: `homeease_knowledge`
- **Vector Size**: 768 (Gemini text-embedding-004)
- **Distance Metric**: Cosine similarity
- **Data Sources**: 
  - `faqs.csv` - Frequently asked questions
  - `navigation-tags.csv` - Site navigation and routes

### API Endpoints

**POST** `/api/chat`
```json
{
  "message": "How do I book a service?",
  "sessionId": "optional-session-id",
  "userId": "optional-user-id"
}
```

**GET** `/api/chat/history/:sessionId`

**DELETE** `/api/chat/history/:sessionId`

**GET** `/api/health`

## 📊 Monitoring

### Check Service Health

```bash
# n8n
curl http://localhost:5678/healthz

# Qdrant
curl http://localhost:6333/health

# Chatbot API
curl http://localhost:3001/api/health
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f n8n
docker-compose logs -f chatbot-api
```

### Database Access

```bash
# PostgreSQL
docker exec -it homeease-postgres psql -U chatbot_user -d chatbot_db

# Qdrant UI
# Open http://localhost:6333/dashboard
```

## 🧪 Testing

### Test Vector Search

```bash
cd data-ingestion
node test-search.js
```

### Test API

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I book a service?"}'
```

### Manual n8n Workflow Test

1. Go to http://localhost:5678
2. Open the workflow
3. Click "Execute Workflow"
4. Use the "Listen for Test Webhook" feature

## 🔐 Security

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong random secrets for encryption keys
- [ ] Enable HTTPS/SSL for all services
- [ ] Configure CORS properly in API
- [ ] Set up rate limiting (already configured)
- [ ] Use environment-specific API keys
- [ ] Implement authentication for n8n
- [ ] Secure PostgreSQL with SSL
- [ ] Use Docker secrets for sensitive data

### Environment Variables

Never commit `.env` file! Add to `.gitignore`:
```
chatbot/.env
chatbot/data/
chatbot/workflows/.env
```

## 🚢 Deployment

### 🎯 Deploy to Render

Choose your deployment approach:

**Option 1: Full Stack on Render (Recommended)**
- 🐳 **[RENDER-FULL-STACK.md](./RENDER-FULL-STACK.md)** - Deploy entire Docker stack (n8n + Qdrant + API)
- Deploys all 3 services on Render
- Cost: ~$14/month
- Best for production use

**Option 2: Hybrid Deployment**
- 📖 **[QUICKSTART-RENDER.md](./QUICKSTART-RENDER.md)** - Fast hybrid deployment
- 📚 **[RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)** - Detailed hybrid guide
- API on Render, n8n/Qdrant on external clouds
- Can start free with external services

**Pre-deployment verification:**
```bash
node verify-deployment.js
```

### Production Docker Compose (Self-hosted)

For self-hosted production deployment, update `docker-compose.yml`:

```yaml
services:
  n8n:
    environment:
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-domain.com/
      - N8N_HOST=your-domain.com
```

### Cloud Deployment Options

1. **Render** (Recommended) - See QUICKSTART-RENDER.md
2. **AWS**: ECS/EKS with RDS and managed Qdrant
3. **Google Cloud**: Cloud Run with Cloud SQL
4. **Azure**: Container Instances with Cosmos DB
5. **DigitalOcean**: App Platform with Managed Database
6. **Self-hosted**: VPS with Docker Compose

### Scaling

For high traffic:
- Use Redis for session management
- Scale API horizontally with load balancer
- Use managed Qdrant Cloud
- Enable n8n queue mode
- Add caching layer (Redis)

## 🛠️ Troubleshooting

### n8n Connection Issues

```bash
# Check if n8n is running
docker-compose ps n8n

# Restart n8n
docker-compose restart n8n

# Check logs
docker-compose logs -f n8n
```

### Vector Search Not Working

```bash
# Check Qdrant collection
curl http://localhost:6333/collections/homeease_knowledge

# Re-ingest data
cd data-ingestion
npm run ingest
```

### API Connection Refused

```bash
# Check if API is running
docker-compose ps chatbot-api

# Check API logs
docker-compose logs -f chatbot-api

# Restart API
docker-compose restart chatbot-api
```

### Gemini API Errors

- Verify API key is correct in `.env`
- Check quota limits: https://console.cloud.google.com/
- Ensure billing is enabled
- Check API key has Gemini API enabled

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions:
- Open GitHub issue
- Check documentation
- Review logs for errors

---

**Built with ❤️ for HomeEase**
