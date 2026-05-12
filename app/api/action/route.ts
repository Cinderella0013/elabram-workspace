import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); 
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const plan = searchParams.get('plan');

    if (!id || !action || !email) {
      return new NextResponse('Invalid Parameters', { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1iZCa4D8JYl_vNXr9aMIVbmAdfJoIcHiUBCsCKm7XhqY'; // ID ของ Sheet V2

    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Workspace Bookings V2!A:J', 
    });
    const rows = getRes.data.values;
    
    if (rows) {
      const rowIndex = rows.findIndex(row => row[8] === id); 
      
      if (rowIndex !== -1) {
        const rowNumber = rowIndex + 1; 
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Workspace Bookings V2!J${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[newStatus]] },
        });
      }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    if (action === 'approve') {
      await transporter.sendMail({
        from: `"Elabram Workspace" <wissarut.t@elabram.com>`,
        to: email,
        subject: `✅ Booking Approved - Elabram Workspace`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #22c55e;">Your Booking is Approved!</h2>
            <p>Dear ${name},</p>
            <p>We are pleased to inform you that your booking request for <strong>${plan}</strong> has been fully approved.</p>
            <p>If you have any further questions, please do not hesitate to contact us via WhatsApp or reply to this email.</p>
            <br/>
            <p>Best Regards,<br/><strong>Elabram Systems Team</strong></p>
          </div>
        `,
      });
    } else if (action === 'reject') {
      await transporter.sendMail({
        from: `"Elabram Workspace" <wissarut.t@elabram.com>`,
        to: email,
        subject: `❌ Booking Update - Elabram Workspace`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #ef4444;">Booking Status Update</h2>
            <p>Dear ${name},</p>
            <p>We regret to inform you that we are unable to approve your booking request for <strong>${plan}</strong> at this time. This may be due to the space being fully booked on your requested date.</p>
            <p>We apologize for any inconvenience caused. Please feel free to contact us to check for alternative dates or plans.</p>
            <br/>
            <p>Sincerely,<br/><strong>Elabram Systems Team</strong></p>
          </div>
        `,
      });
    }

    const responseHtml = `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #0f172a; color: white;">
          <h1 style="color: ${action === 'approve' ? '#22c55e' : '#ef4444'};">
            ${action === 'approve' ? 'Booking Approved Successfully!' : 'Booking Rejected Successfully!'}
          </h1>
          <p style="color: #94a3b8;">The system has updated Google Sheets and notified <strong>${name}</strong>.</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `;
    return new NextResponse(responseHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}