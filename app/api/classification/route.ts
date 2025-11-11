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

    // Note: The actual conversation saving happens when the client-side
    // widget fires the conversation-ended event, which triggers
    // a fetch to /api/conversations?id={conversation_id}
    // That endpoint fetches from ElevenLabs and saves to Supabase

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
