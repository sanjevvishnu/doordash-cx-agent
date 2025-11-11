// Script to setup workspace webhook for conversation events
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_KEY = process.env.ELEVENLABS_API_KEY;
const WEBHOOK_URL = 'https://doordash-cx-agent.vercel.app/api/webhook';

async function setupWebhook() {
  try {
    console.log('Setting up conversation webhook...\n');

    // First, get current webhooks
    const getResponse = await fetch(
      'https://api.elevenlabs.io/v1/convai/webhooks',
      {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY!,
        },
      }
    );

    if (getResponse.ok) {
      const webhooks = await getResponse.json();
      console.log('Current webhooks:', JSON.stringify(webhooks, null, 2));
    }

    // Create new webhook for conversation.ended event
    console.log('\nCreating webhook for conversation.ended...');

    const createResponse = await fetch(
      'https://api.elevenlabs.io/v1/convai/webhooks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          events: ['conversation.ended'],
          name: 'Conversation Storage Webhook'
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Failed to create webhook:', error);
      console.log('\n⚠️  You may need to set this up manually in ElevenLabs dashboard:');
      console.log('1. Go to https://elevenlabs.io/app/conversational-ai');
      console.log('2. Settings → Webhooks');
      console.log('3. Add webhook:');
      console.log('   URL:', WEBHOOK_URL);
      console.log('   Event: conversation.ended');
      return;
    }

    const result = await createResponse.json();
    console.log('\n✓ Webhook created successfully!');
    console.log('Webhook ID:', result.webhook_id);
    console.log('URL:', WEBHOOK_URL);
    console.log('Events: conversation.ended');
    console.log('\nConversations will now be automatically saved to Supabase when they end.');

  } catch (error) {
    console.error('Error:', error);
    console.log('\n⚠️  Manual setup required:');
    console.log('Go to ElevenLabs Dashboard → Settings → Webhooks');
    console.log('Add webhook URL:', WEBHOOK_URL);
    console.log('Select event: conversation.ended');
  }
}

setupWebhook();
