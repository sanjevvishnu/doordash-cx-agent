# Local Testing Guide for DoorDash CX Agent

## Option 1: Using ngrok (Recommended)

### Setup ngrok
```bash
# Install ngrok
brew install ngrok

# Or download from https://ngrok.com/download

# Authenticate (sign up at ngrok.com for free)
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Test Locally
```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Expose localhost to internet
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

### Update Agent Tool
1. Go to ElevenLabs dashboard
2. Edit the `setClassification` tool
3. Change URL from:
   - `https://doordash-cx-agent.vercel.app/api/classification`
   - TO: `https://abc123.ngrok.io/api/classification`

4. Test your agent - webhooks will now hit your local machine!

### Monitor Webhook Calls
Watch your terminal running `npm run dev` - you'll see:
```
Classification received: merchant at 2025-11-10T...
```

---

## Option 2: Test with Vercel Deployment

### Check Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://doordash-cx-agent.vercel.app
```

### Verify Webhook is Called
1. Talk to agent on https://cx-agent-five.vercel.app
2. Check Vercel logs for:
   ```
   POST /api/classification 200
   ```

---

## Option 3: Manual Webhook Testing

### Test API Endpoint Directly
```bash
# Test your local endpoint
curl -X POST http://localhost:3000/api/classification \
  -H "Content-Type: application/json" \
  -d '{"type": "merchant"}'

# Expected response:
# {"success":true,"message":"Classification set to merchant","id":"..."}
```

### Test Vercel endpoint
```bash
curl -X POST https://doordash-cx-agent.vercel.app/api/classification \
  -H "Content-Type: application/json" \
  -d '{"type": "dasher"}'
```

---

## Debugging Classification Issues

### Check Agent Configuration
```bash
npx tsx scripts/verify-agent.ts
```

### View Agent Workflow
```bash
npx tsx -e "
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const r = await fetch('https://api.elevenlabs.io/v1/convai/agents/agent_7701k9qkzfhwfsntakrxdn982sp2', {
  headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
});
const a = await r.json();
console.log(JSON.stringify(a.workflow, null, 2));
"
```

### Monitor Conversations
```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Click "Refresh" to see latest conversations
# Click "View Details" to see transcript + classification
```

---

## Enhanced Workflow Steps

Your agent now follows this flow:

1. **Greeting** - Asks: "Are you a Dasher, Merchant, or Customer?"
2. **Initial Triage** - Assesses if issue is clear
   - If CLEAR → Go to Classification
   - If UNCLEAR → Go to Clarification
3. **Clarification** (if needed) - Asks one targeted question
4. **Classification** - Calls `setClassification` tool
5. **Confirmation** - Says "Identified as [type] issue. Transferring..."
6. **End** - Call terminates

---

## Common Issues

### Tool Not Being Called
- Check agent has tool attached: `additional_tool_ids: ["tool_9701k9qmc3bpf52857r588d19dya"]`
- Verify tool URL is correct
- Check ElevenLabs dashboard → Agent → Tools

### Classification Not Showing
- Refresh conversations table
- Check server logs for webhook POST
- Verify API key is set in environment

### Agent Not Following Workflow
- LLM conditions might not trigger
- Update prompts to be more explicit
- Check workflow edges in agent config

---

## Pro Tips

1. **Use ngrok for fastest iteration** - See webhook calls in real-time
2. **Check Vercel logs** for production debugging
3. **Test with curl** to verify API works independently
4. **Monitor conversations table** to see full transcript + metadata
