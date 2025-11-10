// Script to update ElevenLabs agent configuration
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7501k9q891d5e6psasy04g4ccs8e';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const WEBHOOK_URL = 'https://doordash-cx-agent.vercel.app/api/classification';

async function getAgent() {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      headers: {
        'xi-api-key': API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get agent: ${response.status}`);
  }

  return response.json();
}

async function updateAgent() {
  try {
    console.log('Fetching current agent configuration...');
    const currentAgent = await getAgent();

    console.log('Current agent:', JSON.stringify(currentAgent, null, 2));

    // Update webhook URL in conversation config tools
    const updatedConfig = {
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent,
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            prompt: `You are a DoorDash support triage agent. Your job is to quickly identify if the caller's issue relates to:

1. DASHER - Delivery drivers (payment issues, account problems, app issues, delivery concerns)
2. MERCHANT - Restaurants/stores (menu updates, tablet problems, payout questions, store settings)
3. CUSTOMER - People ordering food (refunds, missing items, order tracking, delivery issues)

Greet the caller warmly and ask 1-2 clarifying questions to understand their role and issue.
Once you're confident about the classification, call the setClassification tool with the type parameter.
After calling the tool, say: "Thank you! I've identified your issue as {type}. You'll be transferred to the appropriate team shortly. Goodbye!"
Keep conversations under 30 seconds. Be empathetic and professional.`
          },
          tools: currentAgent.conversation_config?.agent?.tools?.map((tool: any) => {
            if (tool.name === 'setClassification' && tool.type === 'webhook') {
              return {
                ...tool,
                api_schema: {
                  ...tool.api_schema,
                  url: WEBHOOK_URL
                }
              };
            }
            return tool;
          })
        }
      }
    };

    console.log('\nUpdating agent with new webhook URL:', WEBHOOK_URL);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify(updatedConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update agent: ${response.status} - ${error}`);
    }

    const updated = await response.json();
    console.log('\n✓ Agent updated successfully!');
    console.log('Updated webhook URL:', WEBHOOK_URL);

  } catch (error) {
    console.error('Error updating agent:', error);
    process.exit(1);
  }
}

updateAgent();
