import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// In-memory store for classifications (use a database in production)
const classifications = new Map<string, {
  type: 'dasher' | 'merchant' | 'customer';
  timestamp: string;
  conversationId?: string;
}>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const { type, conversation_id, transcript, metadata } = body;

    // Validate type
    if (!type || !['dasher', 'merchant', 'customer'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid classification type' },
        { status: 400 }
      );
    }

    // Store classification in memory
    const tempId = Date.now().toString();
    classifications.set(tempId, {
      type,
      timestamp: new Date().toISOString(),
      conversationId: conversation_id,
    });

    console.log(`Classification received: ${type} at ${new Date().toISOString()}`);

    // Fetch full conversation from ElevenLabs if we have conversation_id
    if (conversation_id) {
      try {
        console.log('Fetching conversation from ElevenLabs:', conversation_id);

        const elevenlabsResponse = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}`,
          {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
          }
        );

        if (elevenlabsResponse.ok) {
          const conversationData = await elevenlabsResponse.json();
          console.log('Conversation fetched:', conversationData);

          // Store in Supabase
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              customer_name: metadata?.customer_name || 'Anonymous',
              agent_name: 'DoorDash CX Agent',
              status: 'completed',
              started_at: conversationData.start_time || new Date().toISOString(),
              ended_at: conversationData.end_time || new Date().toISOString()
            })
            .select()
            .single();

          if (convError) {
            console.error('Error saving conversation:', convError);
          } else if (conversationData.transcript && conversationData.transcript.length > 0) {
            // Save messages
            const messagesToInsert = conversationData.transcript.map((msg: any) => ({
              conversation_id: conversation.id,
              role: msg.role,
              content: msg.message || msg.content || '',
              timestamp: msg.timestamp || new Date().toISOString()
            }));

            const { error: msgError } = await supabase
              .from('messages')
              .insert(messagesToInsert);

            if (msgError) {
              console.error('Error saving messages:', msgError);
            } else {
              console.log('✓ Conversation and messages saved to Supabase');
            }
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Classification set to ${type}`,
      id: tempId
    });
  } catch (error) {
    console.error('Classification webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent classifications
export async function GET() {
  const recentClassifications = Array.from(classifications.entries()).map(([id, data]) => ({
    id,
    ...data,
  }));

  return NextResponse.json({
    classifications: recentClassifications.slice(-10), // Return last 10
  });
}
