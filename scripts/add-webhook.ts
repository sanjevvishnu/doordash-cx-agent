// Script to add conversation-end webhook to agent
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const WEBHOOK_URL = 'https://doordash-cx-agent.vercel.app/api/webhook';

async function addWebhook() {
  try {
    console.log('Adding conversation-end webhook to agent...\n');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify({
          platform_settings: {
            workspace_overrides: {
              webhooks: {
                events: ['transcript', 'conversation_ended'],
                send_audio: false
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update agent: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log('✓ Webhook configuration updated!\n');
    console.log('Events enabled:', result.platform_settings?.workspace_overrides?.webhooks?.events);
    console.log('\nNote: You need to configure the webhook URL in the ElevenLabs dashboard:');
    console.log('1. Go to Settings → Webhooks');
    console.log('2. Add webhook URL:', WEBHOOK_URL);
    console.log('3. Select events: conversation_ended');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addWebhook();
