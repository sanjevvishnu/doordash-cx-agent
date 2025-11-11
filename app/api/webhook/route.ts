import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Conversation webhook received:', JSON.stringify(body, null, 2));

    // ElevenLabs conversation.ended webhook structure
    const {
      conversation_id,
      agent_id,
      status,
      transcript,
      metadata,
      analysis
    } = body;

    if (!conversation_id) {
      console.error('No conversation_id in webhook');
      return NextResponse.json({ success: false, error: 'No conversation_id' });
    }

    // Extract customer/agent info from metadata if available
    const customerName = metadata?.customer_name || 'Anonymous';
    const agentName = 'DoorDash CX Agent';

    // Insert conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        customer_name: customerName,
        agent_name: agentName,
        status: 'completed',
        started_at: metadata?.start_time || new Date().toISOString(),
        ended_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.error('Error saving conversation:', convError);
      throw convError;
    }

    console.log('✓ Conversation saved to Supabase:', conversation.id);

    // Insert messages from transcript
    if (transcript && transcript.length > 0) {
      const messagesToInsert = transcript.map((msg: any) => ({
        conversation_id: conversation.id,
        role: msg.role || 'user',
        content: msg.message || msg.content || msg.text || '',
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      const { error: msgError } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (msgError) {
        console.error('Error saving messages:', msgError);
        throw msgError;
      }

      console.log(`✓ Saved ${messagesToInsert.length} messages`);
    }

    return NextResponse.json({ success: true, conversation_id: conversation.id });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
