import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

// Simple profanity filter - you might want to use a more sophisticated solution
const BANNED_WORDS = ['badword1', 'badword2']; // Add your banned words here

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and session ID are required' },
        { status: 400 }
      );
    }

    if (message.length > 280) {
      return NextResponse.json(
        { error: 'Message must be 280 characters or less' },
        { status: 400 }
      );
    }

    if (containsProfanity(message)) {
      return NextResponse.json(
        { error: 'Message contains inappropriate content' },
        { status: 400 }
      );
    }

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check if this session has already been used
    const usedSession = await redis.get(`used_session:${sessionId}`);
    if (usedSession) {
      return NextResponse.json(
        { error: 'This payment session has already been used' },
        { status: 400 }
      );
    }

    // Update the message and mark the session as used
    await Promise.all([
      redis.set('current_message', message),
      redis.set(`used_session:${sessionId}`, true, { ex: 60 * 60 * 24 * 30 }) // Expire after 30 days
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Error updating message' },
      { status: 500 }
    );
  }
} 