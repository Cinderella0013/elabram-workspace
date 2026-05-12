import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, plan, startDate, timeSlot } = await request.json();
    const bookingId = Date.now().toString(); 
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

    // 1. บันทึกข้อมูลลง GOOGLE SHEETS
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1iZCa4D8JYl_vNXr9aMIVbmAdfJoIcHiUBCsCKm7XhqY'; // ID ของ Sheet V2

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Workspace Bookings V2!A:J', 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            name, email, phone, company || '-', plan, startDate, timeSlot,
            new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
            bookingId, 'Pending'
          ],
        ],
      },
    });

    // 2. ตั้งค่า Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const approveUrl = `${baseUrl}/api/action?id=${bookingId}&action=approve&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}`;
    const rejectUrl = `${baseUrl}/api/action?id=${bookingId}&action=reject&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}`;

    // A. Email to Admin (English)
    await transporter.sendMail({
      from: `"Elabram Booking System" <${process.env.EMAIL_USER}>`,
      to: 'wissarut.t@elabram.com',
      subject: `[Pending Approval] New Workspace Booking from ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #06b6d4;">New Booking Pending Approval</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${company || '-'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Plan:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${plan}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Start Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${startDate}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time Slot:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${timeSlot}</td></tr>
          </table>
          <p>Please click a button below to take action:</p>
          <div style="margin-top: 20px; margin-bottom: 20px;">
            <a href="${approveUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">✅ Approve Booking</a>
            <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">❌ Reject</a>
          </div>
        </div>
      `,
    });

    // B. Auto-reply to Customer (English)
    await transporter.sendMail({
      from: `"Elabram Workspace" <wissarut.t@elabram.com>`,
      to: email,
      subject: `Booking Request Received - Elabram Workspace`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #06b6d4;">Dear ${name},</h2>
          <p>We have received your booking request for <strong>${plan}</strong> on <strong>${startDate}</strong>.</p>
          <p>Your request is currently in <strong>"Pending"</strong> status. Once reviewed and approved by our team, you will receive a final confirmation email.</p>
          <br />
          <p>Thank you for choosing Elabram Workspace.</p>
          <p><strong>Elabram Systems Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}