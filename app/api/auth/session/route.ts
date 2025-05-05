import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionCookie } from '@/lib/server/auth';

// Session duration: 5 days
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000;

/**
 * ⚠️ SERVER-ONLY ROUTE
 * This route uses Firebase Admin SDK and must run in Node.js environment
 */
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing ID token' },
        { status: 400 }
      );
    }

    // Create session cookie using server-only utility
    const sessionCookie = await createSessionCookie(idToken, SESSION_DURATION);

    // Set cookie options
    const options = {
      name: '__session',
      value: sessionCookie,
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Set the cookie
    cookies().set(options);

    return NextResponse.json(
      { status: 'success' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear the session cookie
    cookies().delete('__session');

    return NextResponse.json(
      { status: 'success' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS support
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 