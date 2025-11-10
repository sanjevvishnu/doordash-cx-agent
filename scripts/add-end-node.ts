// Script to add end call node to ElevenLabs agent workflow
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7501k9q891d5e6psasy04g4ccs8e';
const API_KEY = process.env.ELEVENLABS_API_KEY;

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

async function addEndNode() {
  try {
    console.log('Fetching current agent configuration...');
    const currentAgent = await getAgent();

    console.log('Current workflow:', JSON.stringify(currentAgent.workflow, null, 2));

    // Create end call node
    const endNodeId = 'node_end_call_' + Date.now();
    const edgeToEndId = 'edge_to_end_' + Date.now();

    // Update workflow with end node
    const updatedWorkflow = {
      edges: {
        ...currentAgent.workflow.edges,
        [edgeToEndId]: {
          source: "node_01k9q8bmjye01tp30chng7exfh", // Current subagent node
          target: endNodeId,
          forward_condition: {
            label: null,
            type: "unconditional"
          },
          backward_condition: null
        }
      },
      nodes: {
        ...currentAgent.workflow.nodes,
        [endNodeId]: {
          type: "end",
          position: {
            x: 5,
            y: -350
          },
          edge_order: []
        }
      }
    };

    // Update the existing subagent node to point to end node
    updatedWorkflow.nodes.node_01k9q8bmjye01tp30chng7exfh = {
      ...currentAgent.workflow.nodes.node_01k9q8bmjye01tp30chng7exfh,
      edge_order: [edgeToEndId]
    };

    console.log('\nAdding end call node to workflow...');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify({
          workflow: updatedWorkflow
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update agent: ${response.status} - ${error}`);
    }

    const updated = await response.json();
    console.log('\n✓ Workflow updated successfully!');
    console.log('✓ End call node added');
    console.log('\nUpdated workflow:', JSON.stringify(updated.workflow, null, 2));

  } catch (error) {
    console.error('Error updating workflow:', error);
    process.exit(1);
  }
}

addEndNode();
