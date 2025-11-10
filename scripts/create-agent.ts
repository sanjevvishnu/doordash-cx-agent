// Script to create a new DoorDash CX agent from scratch
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_KEY = process.env.ELEVENLABS_API_KEY;
const WEBHOOK_URL = 'https://doordash-cx-agent.vercel.app/api/classification';

async function createAgent() {
  try {
    console.log('Creating new DoorDash CX agent...');

    const agentConfig = {
      name: "DoorDash CX Triage Agent",
      conversation_config: {
        agent: {
          first_message: "Hi, thanks for contacting DoorDash support! How can I help you today?",
          language: "en",
          prompt: {
            prompt: `# Personality

You are a DoorDash customer support triage agent.
You are efficient, friendly, and solution-oriented.
You help categorize customer issues accurately.

# Goal

Quickly categorize issues as:
- DASHER: Delivery driver issues (payments, account, app problems)
- MERCHANT: Restaurant/store issues (menu, tablet, payouts)
- CUSTOMER: Order issues (refunds, missing items, tracking)

# Instructions

1. Greet warmly
2. Ask what issue they're experiencing
3. Listen for keywords to identify the category
4. Once confident, categorize and end call politely

Examples:
- "My dasher app crashed" → DASHER
- "Need to update menu" → MERCHANT
- "Order never arrived" → CUSTOMER

Keep conversations under 30 seconds.`,
            llm: "gemini-2.5-flash",
            temperature: 0.7,
            max_tokens: 500
          }
        },
        tts: {
          voice_id: "IKne3meq5aSn9XLyUdCD",
          model_id: "eleven_turbo_v2"
        },
        turn: {
          turn_timeout: 10,
          mode: "turn"
        },
        conversation: {
          max_duration_seconds: 120
        }
      },
      platform_settings: {
        privacy: {
          record_voice: true,
          retention_days: 30
        }
      }
    };

    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/agents/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify(agentConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create agent: ${response.status} - ${error}`);
    }

    const agent = await response.json();
    console.log('\n✓ Agent created successfully!');
    console.log('\nAgent ID:', agent.agent_id);
    console.log('Agent Name:', agent.name);

    console.log('\n📋 Next steps:');
    console.log('1. Update app/page.tsx with the new agent ID');
    console.log('2. Add the setClassification webhook tool in the ElevenLabs dashboard');
    console.log('   - Tool Name: setClassification');
    console.log('   - URL:', WEBHOOK_URL);
    console.log('   - Method: POST');
    console.log('   - Body param: type (string, required)');

    return agent;

  } catch (error) {
    console.error('Error creating agent:', error);
    process.exit(1);
  }
}

createAgent();
