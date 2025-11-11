// Fix: Add tool to main agent configuration
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;
const WEBHOOK_URL = 'https://doordash-cx-agent.vercel.app/api/classification';

async function fixToolConfig() {
  try {
    console.log('Fixing tool configuration...\n');

    // Get current agent
    const getResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: { 'xi-api-key': API_KEY! },
      }
    );
    const agent = await getResponse.json();

    // Add tool to main agent config
    const updatedConfig = {
      conversation_config: {
        ...agent.conversation_config,
        agent: {
          ...agent.conversation_config.agent,
          prompt: {
            ...agent.conversation_config.agent.prompt,
            tools: [
              {
                type: "webhook",
                name: "setClassification",
                description: "Call this to record the issue classification",
                api_schema: {
                  url: WEBHOOK_URL,
                  method: "POST",
                  path_params_schema: {},
                  query_params_schema: {},
                  request_body_schema: {
                    type: "object",
                    description: "Classification data",
                    required: ["type"],
                    properties: {
                      type: {
                        type: "string",
                        description: "Issue type: dasher, merchant, or customer"
                      }
                    }
                  },
                  request_headers: {},
                  auth_connection: null
                },
                webhook: {
                  name: "setClassification",
                  description: "Call this to record the issue classification",
                  api_schema: {
                    url: WEBHOOK_URL,
                    method: "POST",
                    path_params_schema: {},
                    query_params_schema: {},
                    request_body_schema: {
                      type: "object",
                      description: "Classification data",
                      required: ["type"],
                      properties: {
                        type: {
                          type: "string",
                          description: "Issue type: dasher, merchant, or customer"
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
              }
            ]
          }
        }
      }
    };

    const updateResponse = await fetch(
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

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update: ${updateResponse.status} - ${error}`);
    }

    console.log('✓ Tool added to main agent config!');
    console.log('✓ Webhook URL:', WEBHOOK_URL);
    console.log('\nThe agent can now call setClassification tool during conversations!');
    console.log('\nTest it:');
    console.log('1. Talk to the agent on Vercel');
    console.log('2. Describe an issue (e.g., "My food order is late")');
    console.log('3. The tool should be called automatically');
    console.log('4. Check server logs or conversations table for classification');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixToolConfig();
