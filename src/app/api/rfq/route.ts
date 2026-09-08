import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- NEW RFQ & SAMPLE INQUIRY RECEIVED ---');
    console.log(body);

    // In production, you can trigger email notifications via Resend / SendGrid
    // or persist directly to PostgreSQL / MongoDB / Supabase database.
    return NextResponse.json({
      success: true,
      message: 'Quotation request received successfully. Our merchandising lead will contact you within 24 hours.',
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process RFQ inquiry' },
      { status: 500 }
    );
  }
}
