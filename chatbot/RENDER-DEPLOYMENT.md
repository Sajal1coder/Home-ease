# Deploying HomeEase Chatbot to Render

This guide explains how to deploy the HomeEase Chatbot system to Render and external services.

## 🏗️ Architecture Overview

The chatbot system consists of 3 main components:
1. **Chatbot API** (Node.js/Express) - Deployed on Render
2. **n8n Workflow** - Deployed on Render or n8n Cloud
3. **Qdrant Vector DB** - Deployed on Qdrant Cloud

## 📋 Prerequisites

Before deploying, you'll need:
- Render account (free tier available)
- n8n Cloud account OR separate Render service for n8n
- Qdrant Cloud account (free tier available)
- Google Gemini API key
- GitHub repository with your code

## 🚀 Deployment Steps

### Step 1: Deploy Qdrant Vector Database

**Option A: Qdrant Cloud (Recommended)**
1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a new cluster (free tier available)
3. Note the cluster URL (e.g., `https://xyz.aws.cloud.qdrant.io:6333`)
4. Get your API key from the cluster settings
5. Run data ingestion to populate the vector database:
   ```bash
   cd data-ingestion
   npm install
   # Set environment variables
   export QDRANT_URL="your-qdrant-cloud-url"
   export QDRANT_API_KEY="your-qdrant-api-key"
   export GEMINI_API_KEY="your-gemini-api-key"
   npm run ingest
   ```

**Option B: Self-hosted Qdrant on Render**
1. Create a new Web Service on Render
2. Use Docker image: `qdrant/qdrant:latest`
3. Add persistent disk for `/qdrant/storage`
4. Note the service URL

### Step 2: Deploy n8n Workflow Engine

**Option A: n8n Cloud (Recommended)**
1. Sign up at [n8n.cloud](https://n8n.cloud/)
2. Create a new instance
3. Import the workflow from `workflows/homeease-rag-working.json`
4. Configure credentials:
   - **Google Gemini API**: Add your API key
   - **Qdrant**: Add cloud URL and API key
5. Activate the workflow
6. Copy the webhook URL (found in the webhook node)

**Option B: Self-hosted n8n on Render**
1. Create a new Web Service on Render
2. Use Docker image: `n8nio/n8n:latest`
3. Add environment variables:
   ```
   N8N_ENCRYPTION_KEY=generate-random-32-char-hex
   N8N_USER_MANAGEMENT_JWT_SECRET=generate-random-32-char-hex
   GEMINI_API_KEY=your-gemini-api-key
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://your-n8n-service.onrender.com/
   ```
4. Add persistent disk for `/home/node/.n8n`
5. Import and configure the workflow as in Option A

### Step 3: Deploy Chatbot API to Render

**Automatic Deployment with render.yaml:**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Select the `chatbot` folder (or repository root)
6. Render will detect the `render.yaml` file
7. Configure environment variables:
   - `N8N_WEBHOOK_URL`: Your n8n webhook URL (from Step 2)
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `QDRANT_URL`: Your Qdrant cluster URL (from Step 1)
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://yourdomain.com`)
8. Click "Apply" to deploy

**Manual Deployment:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: homeease-chatbot-api
   - **Region**: Choose closest to your users
   - **Branch**: main (or your default branch)
   - **Root Directory**: `chatbot`
   - **Runtime**: Node
   - **Build Command**: `cd api && npm install`
   - **Start Command**: `cd api && npm start`
5. Add environment variables (same as above)
6. Click "Create Web Service"

### Step 4: Configure Environment Variables

Add these environment variables in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Service port (auto-set by Render) | `10000` |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | `https://your-n8n.app.n8n.cloud/webhook/chat` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `QDRANT_URL` | Qdrant cluster URL | `https://xyz.cloud.qdrant.io:6333` |
| `QDRANT_API_KEY` | Qdrant API key (if using cloud) | `your-api-key` |
| `CORS_ORIGIN` | Allowed frontend origins | `https://yourdomain.com,https://www.yourdomain.com` |

### Step 5: Update Frontend Configuration

Update your React frontend to use the Render API URL:

```javascript
// client/.env.production
REACT_APP_CHATBOT_API_URL=https://homeease-chatbot-api.onrender.com
```

Or update the Chatbot component directly:

```javascript
// client/src/components/Chatbot.jsx
const API_BASE_URL = process.env.REACT_APP_CHATBOT_API_URL || 
                     'https://homeease-chatbot-api.onrender.com';
```

## ✅ Verify Deployment

### Test API Health
```bash
curl https://homeease-chatbot-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "HomeEase Chatbot API",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Chat Endpoint
```bash
curl -X POST https://homeease-chatbot-api.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I book a service?", "userId": "test-user"}'
```

### Test n8n Workflow
1. Go to your n8n instance
2. Open the workflow
3. Click "Execute Workflow"
4. Check execution logs for errors

### Test Qdrant Vector Search
```bash
curl "https://your-qdrant-url:6333/collections/homeease_knowledge" \
  -H "api-key: your-api-key"
```

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected branch:
1. Make changes to your code
2. Commit and push to GitHub
3. Render automatically detects changes and redeploys
4. Monitor deployment in Render dashboard

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor resource usage
- Check deployment history
- View metrics and analytics

### Health Checks
Render automatically monitors the `/api/health` endpoint. If it fails, you'll receive notifications.

### Logs
Access logs from Render dashboard or using Render CLI:
```bash
render logs -s homeease-chatbot-api
```

## 🔐 Security Best Practices

- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS (automatic on Render)
- ✅ Configure CORS properly
- ✅ Rate limiting is already implemented
- ✅ Use API keys for Qdrant and n8n
- ✅ Regularly rotate API keys
- ✅ Monitor logs for suspicious activity

## 💰 Cost Considerations

### Free Tier Limits
- **Render**: 750 hours/month (enough for one service 24/7)
- **n8n Cloud**: 5,000 workflow executions/month
- **Qdrant Cloud**: 1GB storage, 1M read units/month

### Paid Plans
If you exceed free tier:
- **Render**: $7/month per service
- **n8n Cloud**: Starts at $20/month
- **Qdrant Cloud**: Starts at $25/month

### Cost Optimization
- Use Render free tier with auto-sleep (service sleeps after 15 min inactivity)
- Batch vector DB updates to reduce API calls
- Cache frequent queries
- Monitor and optimize workflow executions

## 🛠️ Troubleshooting

### API Service Won't Start
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start command
- Check Node.js version compatibility

### n8n Webhook Not Responding
- Verify webhook URL in environment variables
- Check n8n workflow is activated
- Test webhook directly in n8n interface
- Check n8n execution logs

### Vector Search Returns No Results
- Verify Qdrant collection exists
- Re-run data ingestion script
- Check Qdrant API key and URL
- Test search directly in Qdrant dashboard

### CORS Errors
- Add frontend domain to `CORS_ORIGIN` env variable
- Include both `http://` and `https://` variants
- Include `www` and non-`www` versions
- Check browser console for exact error

### High Response Times
- Check n8n execution time in logs
- Optimize vector search (reduce top_k limit)
- Consider upgrading to paid Render plan (no cold starts)
- Add caching layer for frequent queries

## 🔄 Updates and Maintenance

### Updating the Chatbot
1. Make changes to your code
2. Test locally first
3. Push to GitHub
4. Render automatically deploys
5. Monitor deployment logs

### Updating n8n Workflow
1. Make changes in n8n interface
2. Export updated workflow
3. Commit to repository
4. Import in production n8n instance

### Updating Vector Database
1. Update data files in `data-ingestion/`
2. Run ingestion script with production credentials:
   ```bash
   QDRANT_URL="production-url" npm run ingest
   ```

### Database Migrations
Since we're using Qdrant (NoSQL vector DB), schema changes are handled by:
1. Creating new collection with updated schema
2. Re-running ingestion script
3. Updating collection name in n8n workflow
4. Deleting old collection

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🎯 Next Steps

After successful deployment:
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (optional)
- [ ] Set up backup strategy for vector DB
- [ ] Implement analytics tracking
- [ ] Add more knowledge base content
- [ ] Optimize prompts and responses
- [ ] Set up staging environment
- [ ] Document API for team members

---

**Need Help?** Check the logs first, then refer to the troubleshooting section above.
