# Deploy Complete Docker Stack on Render

This guide shows how to deploy the entire HomeEase Chatbot stack (n8n, Qdrant, and API) on Render as separate interconnected services.

## 🏗️ Architecture on Render

```
┌─────────────────────────────────────────────────────┐
│                   RENDER PLATFORM                    │
│                                                      │
│  ┌─────────────┐      ┌──────────────┐             │
│  │   React     │─────▶│  Chatbot API │             │
│  │  Frontend   │◀─────│  (Web Svc)   │             │
│  └─────────────┘      └──────────────┘             │
│        ▲                      │                      │
│        │                      ▼                      │
│        │              ┌──────────────┐              │
│        │              │     n8n      │              │
│        │              │  (Web Svc)   │              │
│        │              └──────────────┘              │
│        │                      │                      │
│        │                      ▼                      │
│        │              ┌──────────────┐              │
│        └──────────────│   Qdrant     │              │
│                       │ (Private Svc)│              │
│                       └──────────────┘              │
└─────────────────────────────────────────────────────┘
```

## 🎯 Services Deployed

1. **homeease-qdrant** - Private Service (Vector Database)
   - Plan: Starter ($7/month) - Requires persistent disk
   - Disk: 1GB for vector storage
   
2. **homeease-n8n** - Web Service (Workflow Engine)
   - Plan: Starter ($7/month) - Requires persistent disk
   - Disk: 1GB for workflow data
   - Public URL for webhook access
   
3. **homeease-chatbot-api** - Web Service (REST API)
   - Plan: Free tier available
   - No persistent storage needed

**Total Cost:** ~$14/month (can upgrade API to $7/month for better performance)

## 📋 Prerequisites

- GitHub account with your code pushed
- Render account ([render.com](https://render.com))
- Google Gemini API key
- Credit card (required for paid services, even with free trial)

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure all files are committed:**
   ```bash
   cd chatbot
   git add .
   git commit -m "Add full stack Render deployment"
   git push origin main
   ```

2. **Verify deployment setup:**
   ```bash
   node verify-deployment.js
   ```

### Step 2: Deploy with Blueprint

1. **Go to Render Dashboard:**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"

2. **Connect Repository:**
   - Connect your GitHub account
   - Select your repository
   - Render will automatically detect `render.yaml`

3. **Review Services:**
   You should see 3 services:
   - ✅ homeease-qdrant (Private Service)
   - ✅ homeease-n8n (Web Service)
   - ✅ homeease-chatbot-api (Web Service)

4. **Set Environment Variables:**
   
   **For homeease-n8n:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   
   **For homeease-chatbot-api:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `CORS_ORIGIN` - Your frontend URL (e.g., `https://yourdomain.com`)

   > Note: Other variables are auto-configured in render.yaml

5. **Deploy:**
   - Click "Apply"
   - Wait 5-10 minutes for all services to deploy

### Step 3: Configure n8n

1. **Access n8n:**
   - Go to `https://homeease-n8n.onrender.com`
   - Create your admin account on first access
   - Set up 2FA if prompted

2. **Import Workflow:**
   - Click "Workflows" → "Import from File"
   - Select `workflows/homeease-rag-working.json`
   - The workflow will be imported

3. **Configure Credentials:**
   
   **Google Gemini API:**
   - Go to "Credentials" → "Add Credential"
   - Select "HTTP Request" or "Google AI"
   - Add your Gemini API key
   
   **Qdrant Vector Store:**
   - Add Qdrant credential
   - URL: `https://homeease-qdrant.onrender.com:6333`
   - No API key needed (internal communication)

4. **Update Workflow Nodes:**
   - Open the imported workflow
   - Check the webhook node URL
   - Update any Qdrant connection URLs to `https://homeease-qdrant.onrender.com:6333`
   - Save the workflow

5. **Activate Workflow:**
   - Toggle the workflow to "Active"
   - Test the webhook by clicking "Execute Workflow"

### Step 4: Populate Qdrant Database

Run the data ingestion script to populate your vector database:

```bash
cd data-ingestion
npm install

# Set environment variables
export QDRANT_URL="https://homeease-qdrant.onrender.com:6333"
export GEMINI_API_KEY="your-gemini-api-key"

# Run ingestion
npm run ingest
```

### Step 5: Test the Deployment

1. **Test API Health:**
   ```bash
   curl https://homeease-chatbot-api.onrender.com/api/health
   ```

2. **Test Qdrant:**
   ```bash
   curl https://homeease-qdrant.onrender.com:6333/health
   ```

3. **Test n8n:**
   - Visit `https://homeease-n8n.onrender.com`
   - Should show n8n login page

4. **Test Chat Flow:**
   ```bash
   curl -X POST https://homeease-chatbot-api.onrender.com/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "How do I book a service?", "userId": "test-user"}'
   ```

### Step 6: Update Frontend

Update your React app to use the Render API:

```javascript
// client/.env.production
REACT_APP_CHATBOT_API_URL=https://homeease-chatbot-api.onrender.com
```

## 🔧 Service Communication

Services communicate via internal Render URLs:

- **n8n → Qdrant:** `https://homeease-qdrant.onrender.com:6333`
- **API → n8n:** `https://homeease-n8n.onrender.com/webhook/chat`
- **Frontend → API:** `https://homeease-chatbot-api.onrender.com`

Render automatically handles DNS and SSL for all services.

## 📊 Monitoring

### View Logs

1. **Go to Render Dashboard**
2. Select a service
3. Click "Logs" tab
4. View real-time logs

### View Metrics

- CPU usage
- Memory usage
- Request counts
- Response times

### Set Up Alerts

1. Go to service settings
2. Configure notification preferences
3. Add email or Slack webhooks

## 🔐 Security

### n8n Security

- Set strong admin password on first login
- Enable 2FA
- Regularly update credentials
- Don't share webhook URLs publicly

### Qdrant Security

- Private service (not publicly accessible)
- Only accessible by other Render services
- Data encrypted at rest

### API Security

- Rate limiting enabled (30 req/min)
- CORS configured
- HTTPS enforced
- Helmet.js security headers

## 💰 Cost Breakdown

### Current Configuration

| Service | Plan | Cost/Month |
|---------|------|------------|
| homeease-qdrant | Starter + 1GB disk | $7 |
| homeease-n8n | Starter + 1GB disk | $7 |
| homeease-chatbot-api | Free | $0 |
| **Total** | | **$14/month** |

### Cost Optimization Options

1. **Keep Current Setup:** $14/month
   - Good for moderate traffic
   - API may have cold starts (15-30s)

2. **Upgrade API:** $21/month total
   - Upgrade API to Starter ($7/month)
   - No cold starts
   - Better performance

3. **Scale for Production:** ~$50/month
   - Larger disks (5GB each)
   - Standard plans for high traffic
   - Multiple regions

### Free Trial

Render offers:
- $5 free credit for new accounts
- 750 free hours for free tier services
- Perfect for testing before going live

## 🛠️ Maintenance

### Update Services

**Update n8n:**
- Render auto-updates to latest n8n image
- Or manually trigger redeploy

**Update API:**
- Push code to GitHub
- Render auto-deploys

**Update Qdrant:**
- Render auto-updates to latest Qdrant image
- Data persists across updates

### Backup Strategy

1. **n8n Workflows:**
   - Export workflows regularly
   - Store in version control
   - Automated export via n8n API

2. **Qdrant Data:**
   - Export collection snapshots
   - Store snapshots externally
   - Use Qdrant's snapshot API

3. **API Code:**
   - Already in version control (GitHub)

### Scaling

**Vertical Scaling:**
- Upgrade to Standard plans ($25/month each)
- More CPU and memory
- Larger disks

**Horizontal Scaling:**
- Deploy multiple API instances
- Add load balancer
- Use Render's auto-scaling

## 🐛 Troubleshooting

### Qdrant Not Accessible

**Check:**
- Service status in Render dashboard
- Disk is properly mounted
- Port 6333 is configured

**Fix:**
- Restart the service
- Check logs for errors
- Verify disk mount path

### n8n Workflow Not Executing

**Check:**
- Workflow is activated
- Credentials are configured
- Webhook URL is correct
- Qdrant is accessible

**Fix:**
- Re-activate workflow
- Check execution logs in n8n
- Test webhook manually
- Verify environment variables

### API Connection Timeouts

**Check:**
- n8n service is running
- Webhook URL is correct
- GEMINI_API_KEY is set

**Fix:**
- Increase timeout in server.js
- Check n8n logs
- Verify n8n webhook is active

### Cold Starts (Free Tier API)

**Symptom:**
- First request takes 30+ seconds
- Subsequent requests are fast

**Solutions:**
1. Upgrade to paid plan ($7/month)
2. Keep service warm with cron job:
   ```bash
   # Hit health endpoint every 10 minutes
   */10 * * * * curl https://homeease-chatbot-api.onrender.com/api/health
   ```
3. Use external service like UptimeRobot

### Out of Disk Space

**Check:**
- Disk usage in Render dashboard
- Qdrant storage size
- n8n workflow data

**Fix:**
- Increase disk size in service settings
- Clean up old Qdrant snapshots
- Optimize vector storage

## 🔄 CI/CD Pipeline

Your setup now has automatic deployment:

```
GitHub Push → Render Detects Change → Auto Build → Auto Deploy → Live
```

**Best Practices:**
1. Use separate branches for dev/staging/production
2. Test locally before pushing
3. Monitor deployment logs
4. Set up Slack/email notifications

## 📈 Performance Optimization

### For High Traffic

1. **Upgrade All Services to Standard:**
   - Better CPU and memory
   - Faster response times
   - No cold starts

2. **Add Redis Cache:**
   - Cache frequent queries
   - Reduce n8n executions
   - Faster responses

3. **Optimize Vectors:**
   - Reduce embedding dimensions
   - Optimize search queries
   - Use HNSW index in Qdrant

4. **Load Testing:**
   ```bash
   # Install k6
   brew install k6
   
   # Run load test
   k6 run load-test.js
   ```

## 🎯 Production Checklist

Before going live:

- [ ] All services deployed and running
- [ ] n8n workflow activated and tested
- [ ] Qdrant populated with knowledge base
- [ ] API health check passing
- [ ] Frontend connected and tested
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL/HTTPS working
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Cost tracking enabled
- [ ] Documentation updated

## 📞 Support

- **Render Support:** [render.com/docs](https://render.com/docs)
- **n8n Community:** [community.n8n.io](https://community.n8n.io)
- **Qdrant Docs:** [qdrant.tech/documentation](https://qdrant.tech/documentation)

## 🎉 Success!

Your complete chatbot stack is now running on Render with:
- ✅ Persistent vector database (Qdrant)
- ✅ Workflow automation (n8n)
- ✅ REST API (Express)
- ✅ Automatic deployments
- ✅ Built-in monitoring
- ✅ SSL/HTTPS security

---

**Your chatbot is production-ready! 🚀**
