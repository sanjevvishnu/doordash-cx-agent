// Debug why classification isn't working
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function debugClassification() {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: { 'xi-api-key': API_KEY! },
      }
    );

    const agent = await response.json();

    console.log('=== DEBUGGING CLASSIFICATION ISSUE ===\n');

    // Check if tool exists
    const tools = agent.conversation_config?.agent?.prompt?.tools || [];
    console.log('1. TOOLS IN AGENT CONFIG:');
    console.log('   Number of tools:', tools.length);
    if (tools.length > 0) {
      tools.forEach((tool: any, i: number) => {
        console.log(`   Tool ${i + 1}:`, tool.name || tool.webhook?.name);
      });
    } else {
      console.log('   ⚠️  NO TOOLS CONFIGURED!');
    }
    console.log('');

    // Check classification node
    const classNode = agent.workflow?.nodes?.node_classification;
    console.log('2. CLASSIFICATION NODE:');
    console.log('   Has node:', !!classNode);
    console.log('   Tool IDs attached:', classNode?.additional_tool_ids || 'NONE');
    console.log('   Prompt mentions tool:', classNode?.additional_prompt?.includes('setClassification'));
    console.log('');

    // Check main agent prompt
    console.log('3. MAIN AGENT PROMPT:');
    const mainPrompt = agent.conversation_config?.agent?.prompt?.prompt || '';
    console.log('   Mentions setClassification:', mainPrompt.includes('setClassification'));
    console.log('   Prompt length:', mainPrompt.length, 'chars');
    console.log('');

    // Check workflow edges
    console.log('4. WORKFLOW EDGES TO CLASSIFICATION NODE:');
    Object.entries(agent.workflow?.edges || {}).forEach(([id, edge]: [string, any]) => {
      if (edge.target === 'node_classification') {
        console.log(`   ${id}:`);
        console.log('     From:', edge.source);
        console.log('     Condition:', edge.forward_condition?.type);
        console.log('     Label:', edge.forward_condition?.label || 'none');
      }
    });
    console.log('');

    // SOLUTION
    console.log('=== LIKELY ISSUES ===\n');

    if (tools.length === 0) {
      console.log('❌ ISSUE: No tools configured in main agent config');
      console.log('   Solution: Tool must be added to agent.prompt.tools, not just workflow node');
    }

    if (!classNode?.additional_tool_ids || classNode.additional_tool_ids.length === 0) {
      console.log('❌ ISSUE: No tool attached to classification node');
      console.log('   Solution: Add tool_id to node_classification.additional_tool_ids');
    }

    if (!mainPrompt.includes('setClassification') && !mainPrompt.includes('tool')) {
      console.log('⚠️  WARNING: Main prompt doesn\'t mention calling tools');
      console.log('   Recommendation: Add instruction to call setClassification tool');
    }

    console.log('\n=== RECOMMENDATION ===');
    console.log('The agent needs the tool configured at BOTH levels:');
    console.log('1. Main agent config (conversation_config.agent.prompt.tools)');
    console.log('2. Workflow node (workflow.nodes.node_classification.additional_tool_ids)');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugClassification();
