import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, plan, startDate, timeSlot } = await request.json();
    const bookingId = Date.now().toString(); 
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

    // 1. บันทึกข้อมูลลง GOOGLE SHEETS (เพิ่มคอลัมน์ A ถึง J)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1iZCa4D8JYl_vNXr9aMIVbmAdfJoIcHiUBCsCKm7XhqY';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J', 
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

    // 2. ส่งอีเมลแจ้งเตือน
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const approveUrl = `${baseUrl}/api/action?id=${bookingId}&action=approve&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}`;
    const rejectUrl = `${baseUrl}/api/action?id=${bookingId}&action=reject&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}`;

    // A. เมลหาแอดมิน (คุณวิศรุต) พร้อมข้อมูลที่ครบถ้วนขึ้น
    await transporter.sendMail({
      from: `"Elabram Booking System" <${process.env.EMAIL_USER}>`,
      to: 'wissarut.t@elabram.com',
      subject: `[รอตรวจสอบ] การจองพื้นที่ทำงานจาก ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #cda052;">มีการจองใหม่รอการอนุมัติ</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ชื่อผู้จอง:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>บริษัท:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${company || '-'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>อีเมล:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>เบอร์โทรศัพท์:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>แพ็กเกจ:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${plan}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>วันที่เริ่มต้น:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${startDate}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ช่วงเวลา:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${timeSlot}</td></tr>
          </table>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อดำเนินการ:</p>
          <div style="margin-top: 20px; margin-bottom: 20px;">
            <a href="${approveUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">✅ อนุมัติการจอง</a>
            <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">❌ ปฏิเสธ</a>
          </div>
        </div>
      `,
    });

    // B. เมลตอบกลับอัตโนมัติหาลูกค้า
    await transporter.sendMail({
      from: `"Elabram Workspace" <wissarut.t@elabram.com>`,
      to: email,
      subject: `เราได้รับคำขอจองพื้นที่ของคุณแล้ว - Elabram Workspace`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #cda052;">สวัสดีคุณ ${name},</h2>
          <p>เราได้รับคำขอจองพื้นที่ทำงาน <strong>${plan}</strong> ของคุณสำหรับวันที่ <strong>${startDate}</strong> เรียบร้อยแล้ว</p>
          <p>ขณะนี้คำขอของคุณอยู่ในสถานะ "รอการตรวจสอบ" เมื่อได้รับการอนุมัติแล้ว เราจะส่งอีเมลยืนยันให้คุณอีกครั้ง</p>
          <br />
          <p>ขอบคุณที่เลือกใช้บริการ Elabram Workspace</p>
          <p><strong>Elabram Systems Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการประมวลผล' }, { status: 500 });
  }
}