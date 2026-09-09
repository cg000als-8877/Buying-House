import { NextResponse } from 'next/server';

/**
 * Production Health Check Endpoint.
 * Returns minimal operational health status without leaking internal infrastructure details or secrets.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'xyz-buying-house-platform',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
