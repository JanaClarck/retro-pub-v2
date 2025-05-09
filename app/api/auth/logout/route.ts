import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the session cookie
    cookies().delete('__session');

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
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 