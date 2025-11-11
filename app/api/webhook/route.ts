import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ElevenLabs sends conversation data in webhook
    const {
      conversation_id,
      agent_id,
      status,
      transcript,
      metadata
    } = body;

    // Extract customer/agent info from metadata if available
    const customerName = metadata?.customer_name || 'Anonymous';
    const agentName = metadata?.agent_name || 'AI Agent';

    // Insert conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        customer_name: customerName,
        agent_name: agentName,
        status: status === 'done' ? 'completed' : 'active',
        started_at: new Date().toISOString(),
        ended_at: status === 'done' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (convError) throw convError;

    // Insert messages from transcript
    if (transcript && transcript.length > 0) {
      const messagesToInsert = transcript.map((msg: any) => ({
        conversation_id: conversation.id,
        role: msg.role,
        content: msg.message || msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      const { error: msgError } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (msgError) throw msgError;
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
