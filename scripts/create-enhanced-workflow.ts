// Script to create enhanced multi-step workflow for DoorDash CX agent
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function createEnhancedWorkflow() {
  try {
    console.log('Creating enhanced CX workflow...\n');

    // Enhanced workflow with multiple steps
    const enhancedWorkflow = {
      edges: {
        // Start -> Greeting
        "edge_start_greeting": {
          source: "start_node",
          target: "node_greeting",
          forward_condition: { label: null, type: "unconditional" },
          backward_condition: null
        },
        // Greeting -> Initial Triage
        "edge_greeting_triage": {
          source: "node_greeting",
          target: "node_initial_triage",
          forward_condition: { label: null, type: "unconditional" },
          backward_condition: null
        },
        // Initial Triage -> Clarification (if unclear)
        "edge_triage_clarification": {
          source: "node_initial_triage",
          target: "node_clarification",
          forward_condition: {
            label: "needs clarification",
            type: "llm",
            condition: "The user's issue type is unclear or ambiguous and needs more questions"
          },
          backward_condition: null
        },
        // Clarification -> Classification
        "edge_clarification_classification": {
          source: "node_clarification",
          target: "node_classification",
          forward_condition: { label: null, type: "unconditional" },
          backward_condition: null
        },
        // Initial Triage -> Classification (if clear)
        "edge_triage_classification_direct": {
          source: "node_initial_triage",
          target: "node_classification",
          forward_condition: {
            label: "issue is clear",
            type: "llm",
            condition: "The user clearly stated they are a dasher, merchant, or customer and their issue type is obvious"
          },
          backward_condition: null
        },
        // Classification -> Confirmation
        "edge_classification_confirmation": {
          source: "node_classification",
          target: "node_confirmation",
          forward_condition: {
            label: "classified",
            type: "llm",
            condition: "The setClassification tool has been called successfully"
          },
          backward_condition: null
        },
        // Confirmation -> End
        "edge_confirmation_end": {
          source: "node_confirmation",
          target: "end_node",
          forward_condition: { label: null, type: "unconditional" },
          backward_condition: null
        }
      },
      nodes: {
        "start_node": {
          type: "start",
          position: { x: 200, y: 0 },
          edge_order: ["edge_start_greeting"]
        },
        "node_greeting": {
          type: "override_agent",
          conversation_config: {
            turn: {},
            tts: { voice_id: null },
            agent: {
              prompt: { prompt: null, llm: null, built_in_tools: {} }
            }
          },
          additional_prompt: `You are greeting a DoorDash support caller.

INSTRUCTIONS:
- Warmly say: "Hi, thanks for contacting DoorDash support! I'm here to help route your issue to the right team."
- Ask: "Are you a Dasher, Merchant, or Customer, and what issue are you experiencing?"
- Keep it brief and friendly
- Listen carefully to their response`,
          additional_knowledge_base: [],
          additional_tool_ids: [],
          position: { x: 200, y: 100 },
          edge_order: ["edge_greeting_triage"],
          label: "Greeting & Initial Question"
        },
        "node_initial_triage": {
          type: "override_agent",
          conversation_config: {
            turn: {},
            tts: { voice_id: null },
            agent: {
              prompt: { prompt: null, llm: null, built_in_tools: {} }
            }
          },
          additional_prompt: `You are doing initial assessment.

ASSESS if you can clearly determine:
- Is this a DASHER (delivery driver) issue?
- Is this a MERCHANT (restaurant/store) issue?
- Is this a CUSTOMER (person ordering food) issue?

If CLEAR from their statement:
- Proceed to classification
- Examples: "I'm a dasher and...", "My restaurant tablet...", "My food order..."

If UNCLEAR:
- They haven't stated their role
- Issue could apply to multiple types
- Need more information`,
          additional_knowledge_base: [],
          additional_tool_ids: [],
          position: { x: 200, y: 200 },
          edge_order: ["edge_triage_clarification", "edge_triage_classification_direct"],
          label: "Initial Assessment"
        },
        "node_clarification": {
          type: "override_agent",
          conversation_config: {
            turn: {},
            tts: { voice_id: null },
            agent: {
              prompt: { prompt: null, llm: null, built_in_tools: {} }
            }
          },
          additional_prompt: `Ask ONE targeted clarifying question:

If role is unclear:
- "Just to confirm, are you calling as a Dasher making deliveries, a Merchant with a restaurant, or a Customer who placed an order?"

If issue is ambiguous:
- For delivery issues: "Is this about making a delivery as a Dasher, or receiving a delivery as a Customer?"
- For payment issues: "Is this about Dasher earnings, Merchant payouts, or a Customer refund?"

Keep it simple and direct.`,
          additional_knowledge_base: [],
          additional_tool_ids: [],
          position: { x: 50, y: 300 },
          edge_order: ["edge_clarification_classification"],
          label: "Ask Clarifying Question"
        },
        "node_classification": {
          type: "override_agent",
          conversation_config: {
            turn: {},
            tts: { voice_id: null },
            agent: {
              prompt: { prompt: null, llm: null, built_in_tools: {} }
            }
          },
          additional_prompt: `Now CLASSIFY the issue by calling the setClassification tool.

CLASSIFICATION RULES:
- DASHER: Delivery driver issues (app, payments, account, deliveries)
- MERCHANT: Restaurant/store issues (tablet, menu, payouts, orders)
- CUSTOMER: Food order issues (tracking, refunds, wrong order, missing items)

IMPORTANT:
1. Call setClassification tool with type: "dasher", "merchant", or "customer"
2. Do NOT say anything else until the tool is called
3. The tool must be called before proceeding`,
          additional_knowledge_base: [],
          additional_tool_ids: ["tool_9701k9qmc3bpf52857r588d19dya"],
          position: { x: 200, y: 400 },
          edge_order: ["edge_classification_confirmation"],
          label: "Call Classification Tool"
        },
        "node_confirmation": {
          type: "override_agent",
          conversation_config: {
            turn: {},
            tts: { voice_id: null },
            agent: {
              prompt: { prompt: null, llm: null, built_in_tools: {} }
            }
          },
          additional_prompt: `The classification has been recorded.

Say EXACTLY:
"Thank you! I've identified this as a [TYPE] issue. You'll be transferred to the [TEAM] team shortly. Have a great day!"

Where:
- DASHER → Dasher Support
- MERCHANT → Merchant Success
- CUSTOMER → Customer Support

Then STOP speaking to end the call.`,
          additional_knowledge_base: [],
          additional_tool_ids: [],
          position: { x: 200, y: 500 },
          edge_order: ["edge_confirmation_end"],
          label: "Confirm & Close"
        },
        "end_node": {
          type: "end",
          position: { x: 200, y: 600 },
          edge_order: []
        }
      }
    };

    console.log('Workflow structure:');
    console.log('Start → Greeting → Initial Triage');
    console.log('         ↓                ↓');
    console.log('    (unclear)        (clear)');
    console.log('         ↓                ↓');
    console.log('   Clarification → Classification → Confirmation → End');
    console.log('\nUpdating agent...\n');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY!,
        },
        body: JSON.stringify({ workflow: enhancedWorkflow }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update: ${response.status} - ${error}`);
    }

    console.log('✓ Enhanced workflow created successfully!\n');
    console.log('Benefits:');
    console.log('- Structured greeting phase');
    console.log('- Smart branching (clear vs unclear)');
    console.log('- Dedicated clarification step when needed');
    console.log('- Explicit tool calling node');
    console.log('- Professional confirmation message');
    console.log('\nThe agent will now guide conversations more effectively!');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createEnhancedWorkflow();
