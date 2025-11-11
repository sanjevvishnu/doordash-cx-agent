import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = 'agent_7701k9qkzfhwfsntakrxdn982sp2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('id');

  try {
    if (conversationId) {
      // Fetch from ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();

      // Also save to Supabase for persistence
      try {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            customer_name: data.metadata?.customer_name || 'Anonymous',
            agent_name: 'DoorDash CX Agent',
            status: data.status === 'done' ? 'completed' : 'active',
            started_at: data.start_time || new Date().toISOString(),
            ended_at: data.end_time || new Date().toISOString()
          })
          .select()
          .single();

        if (!convError && data.transcript && data.transcript.length > 0) {
          const messagesToInsert = data.transcript.map((msg: any) => ({
            conversation_id: conversation.id,
            role: msg.role,
            content: msg.message || msg.content || '',
            timestamp: new Date().toISOString()
          }));

          await supabase.from('messages').insert(messagesToInsert);
        }
      } catch (dbError) {
        console.error('Error saving to Supabase:', dbError);
      }

      return NextResponse.json(data);
    } else {
      // List conversations from ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}&page_size=50`,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
