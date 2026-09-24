import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Simple contact endpoint for IT & Helpdesk popup.
 * Receives a JSON payload with `message` and `subject`.
 * For demonstration it sends an email to the admin via SMTP.
 * Replace the transport configuration with real credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const { message, subject } = await req.json();
    // Basic validation
    if (!message || !subject) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Configure transport – placeholder values, replace with real SMTP details.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    await transporter.sendMail({
      from: `no-reply@${process.env.NEXT_PUBLIC_VERCEL_URL || 'yourdomain.com'}`,
      to: adminEmail,
      subject: `[Bantuan IT] ${subject}`,
      text: message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
