// Script to verify and fix the new agent
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function verifyAndFixAgent() {
  try {
    console.log('Fetching agent details...');

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

    const agent = await response.json();

    console.log('\nAgent Name:', agent.name);
    console.log('Agent ID:', agent.agent_id);
    console.log('\nFirst Message:', agent.conversation_config?.agent?.first_message || 'NOT SET');
    console.log('Has Prompt:', !!agent.conversation_config?.agent?.prompt?.prompt);
    console.log('Has Workflow:', !!agent.workflow);

    // Check if workflow exists, if not add a simple one
    if (!agent.workflow || Object.keys(agent.workflow.nodes || {}).length === 0) {
      console.log('\n⚠ No workflow found. Adding simple workflow...');

      const simpleWorkflow = {
        edges: {
          "edge_start_to_end": {
            source: "start_node",
            target: "end_node",
            forward_condition: {
              label: null,
              type: "unconditional"
            },
            backward_condition: null
          }
        },
        nodes: {
          "start_node": {
            type: "start",
            position: { x: 0, y: 0 },
            edge_order: ["edge_start_to_end"]
          },
          "end_node": {
            type: "end",
            position: { x: 0, y: 200 },
            edge_order: []
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
          body: JSON.stringify({ workflow: simpleWorkflow }),
        }
      );

      if (updateResponse.ok) {
        console.log('✓ Workflow added successfully!');
      } else {
        console.log('✗ Failed to add workflow');
      }
    }

    console.log('\n✓ Agent is ready!');
    console.log('\nTest the widget at: http://localhost:3000');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAndFixAgent();
