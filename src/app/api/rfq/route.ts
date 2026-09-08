import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- NEW RFQ & SAMPLE INQUIRY RECEIVED ---');
    console.log(body);

    // In production, configure transactional email (Resend / SendGrid) or Firestore persistence.
    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received by the system.',
      data: body,
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process RFQ inquiry' },
      { status: 500 }
    );
  }
}
