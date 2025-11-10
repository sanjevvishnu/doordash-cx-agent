// Script to create a simple valid workflow
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7501k9q891d5e6psasy04g4ccs8e';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function fixWorkflow() {
  try {
    console.log('Creating simple workflow with start and end nodes...');

    // Create a minimal valid workflow
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
          position: {
            x: 0,
            y: 0
          },
          edge_order: ["edge_start_to_end"]
        },
        "end_node": {
          type: "end",
          position: {
            x: 0,
            y: 200
          },
          edge_order: []
        }
      }
    };

    console.log('Updating agent workflow...');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify({
          workflow: simpleWorkflow
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update agent: ${response.status} - ${error}`);
    }

    const updated = await response.json();
    console.log('\n✓ Workflow fixed successfully!');
    console.log('✓ Simple workflow created: Start → End');
    console.log('\nYou should now be able to access the agent in the ElevenLabs dashboard.');

  } catch (error) {
    console.error('Error fixing workflow:', error);
    process.exit(1);
  }
}

fixWorkflow();
