// Script to add setClassification tool to ElevenLabs agent
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

async function addClassificationTool() {
  try {
    console.log('Fetching current agent configuration...');
    const currentAgent = await getAgent();

    const classificationTool = {
      type: "webhook",
      name: "setClassification",
      description: "Call this function when you determine the issue type (dasher, merchant, or customer)",
      api_schema: {
        url: WEBHOOK_URL,
        method: "POST",
        path_params_schema: {},
        query_params_schema: {},
        request_body_schema: {
          type: "object",
          description: "Schema for classification webhook",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              description: "The issue type: dasher, merchant, or customer"
            }
          }
        },
        request_headers: {},
        auth_connection: null
      },
      webhook: {
        name: "setClassification",
        description: "Call this function when you determine the issue type (dasher, merchant, or customer)",
        api_schema: {
          url: WEBHOOK_URL,
          method: "POST",
          path_params_schema: {},
          query_params_schema: {},
          request_body_schema: {
            type: "object",
            description: "Schema for classification webhook",
            required: ["type"],
            properties: {
              type: {
                type: "string",
                description: "The issue type: dasher, merchant, or customer"
              }
            }
          },
          request_headers: {},
          auth_connection: null
        },
        dynamic_variables: {
          dynamic_variable_placeholders: {}
        },
        assignments: [],
        disable_interruptions: false,
        tool_call_sound: null,
        tool_call_sound_behavior: "auto",
        response_timeout_secs: 20,
        force_pre_tool_speech: false,
        execution_mode: "immediate"
      }
    };

    // Update agent with tool and improved prompt
    const updatedConfig = {
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config?.agent,
          prompt: {
            ...currentAgent.conversation_config?.agent?.prompt,
            prompt: `# Personality

You are a DoorDash support triage agent for customer support.
You are efficient, friendly, and solution-oriented.
You address callers politely and categorize their support issues accurately.

# Environment

You are assisting customers over the phone via a customer support line.
You can hear the customer's voice but have no video.

# Tone

Your responses are clear, efficient, and confidence-building.
You use a friendly, professional tone with brief affirmations.
Be empathetic and maintain a positive, solution-focused approach.

# Goal

Your primary goal is to efficiently categorize customer support issues as "dasher," "merchant," or "customer."

1. Greet warmly: "Hi, thanks for contacting DoorDash support! How can I help you today?"

2. Issue Identification:
   - Ask the customer to describe their issue briefly
   - Listen for keywords that indicate the category

3. Categorization:
   - DASHER: Delivery drivers (payment issues, account problems, app issues, missing earnings)
   - MERCHANT: Restaurants/stores (menu updates, tablet problems, payout issues, store settings)
   - CUSTOMER: People ordering food (refunds, missing items, order tracking, wrong order)

4. Once confident, IMMEDIATELY call the setClassification tool with the type parameter.

5. After calling the tool, say: "Thank you! I've identified your issue as a {type} issue. You'll be transferred to the appropriate team shortly. Have a great day!"

Keep conversations under 30 seconds. Be empathetic and professional.

# Guardrails

Remain within the scope of issue categorization.
Never share data or reveal sensitive information.
If unsure, ask one clarifying question before categorizing.`,
            tools: [classificationTool]
          }
        }
      }
    };

    console.log('\nAdding setClassification tool to agent...');
    console.log('Webhook URL:', WEBHOOK_URL);

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
    console.log('✓ setClassification tool added');
    console.log('✓ Webhook URL configured:', WEBHOOK_URL);
    console.log('✓ Updated prompt with clear instructions');

  } catch (error) {
    console.error('Error updating agent:', error);
    process.exit(1);
  }
}

addClassificationTool();
