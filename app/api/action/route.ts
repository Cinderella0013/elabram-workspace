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
    const spreadsheetId = '1paoZlPJrpqB5OQDjJW_y0OlMz5TS3XHbYEXq_Z1ZN5I';

    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:J', // อัปเดต Range
    });
    const rows = getRes.data.values;
    
    if (rows) {
      // ID ตอนนี้อยู่คอลัมน์ I (Index ที่ 8)
      const rowIndex = rows.findIndex(row => row[8] === id); 
      
      if (rowIndex !== -1) {
        const rowNumber = rowIndex + 1; 
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        
        // Status ตอนนี้อยู่คอลัมน์ J
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Sheet1!J${rowNumber}`,
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
        subject: `✅ ยืนยันการจองพื้นที่สำเร็จ - Elabram Workspace`,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h2 style="color: #22c55e;">การจองได้รับการอนุมัติ!</h2><p>สวัสดีคุณ ${name},</p><p>คำขอจอง <strong>${plan}</strong> ของคุณได้รับการอนุมัติเรียบร้อยแล้ว</p><br/><p>ขอบคุณครับ<br/><strong>Elabram Systems Team</strong></p></div>`,
      });
    } else if (action === 'reject') {
      await transporter.sendMail({
        from: `"Elabram Workspace" <wissarut.t@elabram.com>`,
        to: email,
        subject: `❌ แจ้งผลการจองพื้นที่ - Elabram Workspace`,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h2 style="color: #ef4444;">ขออภัย ไม่สามารถอนุมัติได้</h2><p>สวัสดีคุณ ${name},</p><p>เนื่องจากพื้นที่สำหรับ <strong>${plan}</strong> ในช่วงเวลาดังกล่าวอาจเต็ม เราจึงไม่สามารถอนุมัติการจองได้</p><br/><p>ขอแสดงความนับถือ<br/><strong>Elabram Systems Team</strong></p></div>`,
      });
    }

    const responseHtml = `<html><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1 style="color: ${action === 'approve' ? '#22c55e' : '#ef4444'};">${action === 'approve' ? 'อนุมัติการจองสำเร็จ!' : 'ปฏิเสธการจองสำเร็จ!'}</h1><p>อัปเดตข้อมูลและส่งอีเมลแจ้งเตือนคุณ ${name} เรียบร้อยแล้ว</p><script>setTimeout(() => window.close(), 3000);</script></body></html>`;
    return new NextResponse(responseHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  } catch (error) {
    return new NextResponse('เกิดข้อผิดพลาดในการประมวลผล', { status: 500 });
  }
}