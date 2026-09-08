import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- NEW CONTACT MESSAGE RECEIVED ---');
    console.log(body);

    return NextResponse.json({
      success: true,
      message: 'Message received successfully.',
      data: body,
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process contact message' },
      { status: 500 }
    );
  }
}
