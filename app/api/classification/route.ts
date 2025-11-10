import { NextResponse } from 'next/server';

// In-memory store for classifications (use a database in production)
const classifications = new Map<string, {
  type: 'dasher' | 'merchant' | 'customer';
  timestamp: string;
  conversationId?: string;
}>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    // Validate type
    if (!type || !['dasher', 'merchant', 'customer'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid classification type' },
        { status: 400 }
      );
    }

    // Generate a temporary ID (will be replaced with actual conversation ID later)
    const tempId = Date.now().toString();

    // Store classification
    classifications.set(tempId, {
      type,
      timestamp: new Date().toISOString(),
    });

    console.log(`Classification received: ${type} at ${new Date().toISOString()}`);

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
