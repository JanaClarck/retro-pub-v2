import { NextResponse } from 'next/server';

// This route will be replaced by client-side authentication
export async function GET() {
  return new NextResponse(
    JSON.stringify({ 
      error: 'Authentication is handled client-side in static exports' 
    }), 
    { 
      status: 308,
      headers: {
        'Location': '/admin/login',
        'Cache-Control': 'no-store, must-revalidate',
      }
    }
  );
} 