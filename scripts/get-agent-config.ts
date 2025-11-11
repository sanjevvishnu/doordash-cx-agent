// Script to fetch current agent configuration
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function getAgentConfig() {
  try {
    console.log('Fetching agent configuration...\n');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch agent: ${response.status} - ${error}`);
    }

    const agent = await response.json();

    console.log('=== AGENT CONFIGURATION ===\n');
    console.log(JSON.stringify(agent, null, 2));

    console.log('\n=== WEBHOOK CONFIGURATION ===');
    if (agent.platform_settings?.webhook) {
      console.log('Webhook URL:', agent.platform_settings.webhook.url);
      console.log('Events:', agent.platform_settings.webhook.events);
    } else {
      console.log('No webhook configured');
    }

    console.log('\n=== TOOLS ===');
    if (agent.tools && agent.tools.length > 0) {
      agent.tools.forEach((tool: any) => {
        console.log(`\nTool: ${tool.name}`);
        console.log(`Type: ${tool.type}`);
        if (tool.type === 'webhook') {
          console.log(`URL: ${tool.config?.url}`);
        }
      });
    } else {
      console.log('No tools configured');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getAgentConfig();
