# DoorDash CX Agent Dashboard

AI-powered voice agent for intelligent support routing built with ElevenLabs Conversational AI.

## Features

- 🎙️ **Voice-First Interface** - Embedded ElevenLabs voice agent widget
- 🔍 **Automatic Classification** - AI classifies issues as Dasher, Merchant, or Customer
- 📊 **Conversation Dashboard** - View all conversations with transcripts and metadata
- 🎯 **Real-time Routing** - Direct users to the appropriate support team

## Setup

1. **Clone the repository**
```bash
git clone https://github.com/sanjevvishnu/doordash-cx-agent.git
cd doordash-cx-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Add your ElevenLabs API key to `.env.local`:
```
ELEVENLABS_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ElevenLabs Agent Setup

### 1. Create Agent
Go to https://elevenlabs.io/app/conversational-ai and create a new agent.

### 2. Configure System Prompt
```
You are a DoorDash support triage agent. Your job is to quickly identify if the caller's issue relates to:

1. DASHER - Delivery drivers (payment issues, account problems, app issues)
2. MERCHANT - Restaurants/stores (menu updates, tablet problems, payouts)
3. CUSTOMER - People ordering food (refunds, missing items, order tracking)

Ask 1-2 clarifying questions to understand their role and issue.
Once confident, call the setClassification tool with the issue type.
Keep conversations under 30 seconds. Be empathetic and professional.
```

### 3. Add Classification Tool (Webhook)
- **Tool Name**: `setClassification`
- **URL**: `https://your-deployment-url.vercel.app/api/classification`
- **Method**: POST
- **Request Body Schema**:
  - `type` (string, required): The issue type (dasher, merchant, or customer)

### 4. Update Agent ID
Replace the agent ID in `app/page.tsx` line 118:
```tsx
<elevenlabs-convai agent-id="your_agent_id_here"></elevenlabs-convai>
```

## API Endpoints

### POST /api/classification
Receives classification webhook from ElevenLabs agent.

**Request Body:**
```json
{
  "type": "merchant"
}
```

### GET /api/conversations
Lists all conversations from ElevenLabs.

### GET /api/conversations?id={conversation_id}
Gets detailed information about a specific conversation including transcript.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **ElevenLabs** - Conversational AI platform

## Deployment

### Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel dashboard.

**Environment Variables:**
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key

## Demo

Built for DoorDash CX team to demonstrate AI-powered support triage capabilities.

## License

MIT
