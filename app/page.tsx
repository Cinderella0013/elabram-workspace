'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Papa from 'papaparse';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2 } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

// URL CSV จาก Google Sheet (Publish to Web)
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6grModf5pKXT9su90vRzpRNtVL-oN71zPWZLlzY9V_BAtvh6IKw8e_oq9NPm787CjKf6f9Wr-hPOP/pub?gid=144768523&single=true&output=csv';

export default function LandingPage() {
  // State ของฟอร์มเดิม
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [plan, setPlan] = useState('Hot Desk - Day Pass (RM 30)');
  const [isLoading, setIsLoading] = useState(false);

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // State สำหรับปฏิทินและ Google Sheet
  const [bookedData, setBookedData] = useState<any[]>([]);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ดึงข้อมูล Captcha
  useEffect(() => {
    generateCaptcha();
  }, []);

  // ดึงข้อมูลการจองจาก Google Sheet
  useEffect(() => {
    setIsSheetLoading(true);
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter((row: any) => row['Start Date']);
        setBookedData(validData);
        setIsSheetLoading(false);
      },
    });
  }, []);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
    setIsCaptchaValid(false);
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaptchaAnswer(value);
    setIsCaptchaValid(parseInt(value) === num1 + num2);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaValid) {
      alert('กรุณาตอบคำถามความปลอดภัยให้ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, plan, startDate, timeSlot }),
      });

      if (response.ok) {
        alert('ส่งคำขอจองสำเร็จ! เราได้ส่งอีเมลยืนยันไปให้คุณแล้ว');
        setName(''); setEmail(''); setPhone(''); setCompany(''); setStartDate(''); setTimeSlot('');
        setPlan('Hot Desk - Day Pass (RM 30)');
        generateCaptcha();
      } else {
        alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  // เมื่อกดเลือกวันที่บนปฏิทิน ให้อัปเดตช่อง Start Date ในฟอร์มด้วย
  const handleDateSelection = (newDate: any) => {
    setCalendarDate(newDate);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    setStartDate(`${year}-${month}-${day}`); // อัปเดต State ฟอร์ม
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white scroll-smooth">
      
      {/* 🌟 Navigation Bar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60 transition-all">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Elabram <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Workspace</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Pricing</a>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#location" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Location</a>
            </div>
            
            <div>
              <a href="#booking" className="px-5 py-2.5 md:px-6 md:py-2.5 bg-white/5 border border-slate-700 rounded-lg text-white font-medium text-sm hover:bg-white/10 hover:border-slate-600 transition-all shadow-sm">
                Book Space
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700/50 backdrop-blur-md px-4 py-1.5 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Premium Corporate Solution</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Elevate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Meeting Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
            Seamless, high-tech, and luxurious spaces designed to empower modern professionals and corporate innovators.
          </p>
          <a href="#pricing" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            Explore Plans
          </a>
        </div>
      </section>

      {/* 2. Pricing & Plans */}
      <section id="pricing" className="py-24 px-4 max-w-[90rem] mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Flexible <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Workspace Plans</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Scalable solutions tailored for individuals and agile teams.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Card 1 */}
          <div className={`bg-slate-900 border ${plan === 'Hot Desk - Day Pass (RM 30)' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-slate-800'} rounded-2xl hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden`}>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style={{ backgroundImage: "url('/images/hot-desk-monthly.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow bg-slate-900 z-10 relative">
              <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-cyan-400 transition-colors">RM 30</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider min-h-[32px]">Per Day</p>
              <h4 className="text-base font-semibold text-slate-300 group-hover:text-white mb-8 transition-colors">Hot Desk – Day Pass</h4>
              <a href="#availability-section" onClick={(e) => setPlan('Hot Desk - Day Pass (RM 30)')} className={`mt-auto block text-center w-full py-3 rounded-xl font-medium text-sm transition-all ${plan === 'Hot Desk - Day Pass (RM 30)' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                {plan === 'Hot Desk - Day Pass (RM 30)' ? 'Selected' : 'Select Plan'}
              </a>
            </div>
          </div>

          {/* Card 2 (Popular) */}
          <div className={`bg-slate-900 border ${plan === 'Hot Desk - Monthly (RM 388)' ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : 'border-slate-800'} rounded-2xl hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden`}>
            <div className="absolute top-4 right-4 z-20 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent transition-all">Popular</div>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style={{ backgroundImage: "url('/images/hot-desk-monthly.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow bg-slate-900 z-10 relative">
              <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-blue-400 transition-colors">RM 388</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider min-h-[32px]">Weekday (Excl. Holidays)</p>
              <h4 className="text-base font-semibold text-slate-300 group-hover:text-white mb-8 transition-colors">Hot Desk – Monthly</h4>
              <a href="#availability-section" onClick={(e) => setPlan('Hot Desk - Monthly (RM 388)')} className={`mt-auto block text-center w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan === 'Hot Desk - Monthly (RM 388)' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white'}`}>
                {plan === 'Hot Desk - Monthly (RM 388)' ? 'Selected' : 'Select Plan'}
              </a>
            </div>
          </div>

          {/* Card 3 (Best Value) */}
          <div className={`bg-slate-900 border ${plan === 'Team Bundle (RM 1,800)' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-slate-800'} rounded-2xl hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden`}>
            <div className="absolute top-4 right-4 z-20 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-cyan-500 group-hover:text-white group-hover:border-transparent transition-all">Best Value</div>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style={{ backgroundImage: "url('/images/team-bundle.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow bg-slate-900 z-10 relative">
              <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-cyan-400 transition-colors">RM 1,800</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider min-h-[32px]">Monthly</p>
              <h4 className="text-base font-semibold text-slate-300 group-hover:text-white mb-8 transition-colors">Team Bundle (up to 5 pax)</h4>
              <a href="#availability-section" onClick={(e) => setPlan('Team Bundle (RM 1,800)')} className={`mt-auto block text-center w-full py-3 rounded-xl font-medium text-sm transition-all ${plan === 'Team Bundle (RM 1,800)' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                {plan === 'Team Bundle (RM 1,800)' ? 'Selected' : 'Select Plan'}
              </a>
            </div>
          </div>

          {/* Card 4 - Cubicle Day Pass */}
          <div className={`bg-slate-900 border ${plan === 'Cubicle - Day Pass (RM 80)' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-slate-800'} rounded-2xl hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden`}>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style={{ backgroundImage: "url('/images/cubicle-day-pass.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow bg-slate-900 z-10 relative">
              <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-cyan-400 transition-colors">RM 80</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider min-h-[32px]">Per Day</p>
              <h4 className="text-base font-semibold text-slate-300 group-hover:text-white mb-8 transition-colors">Cubicle – Day Pass</h4>
              <a href="#availability-section" onClick={(e) => setPlan('Cubicle - Day Pass (RM 80)')} className={`mt-auto block text-center w-full py-3 rounded-xl font-medium text-sm transition-all ${plan === 'Cubicle - Day Pass (RM 80)' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                {plan === 'Cubicle - Day Pass (RM 80)' ? 'Selected' : 'Select Plan'}
              </a>
            </div>
          </div>

          {/* Card 5 - Cubicle Monthly */}
          <div className={`bg-slate-900 border ${plan === 'Cubicle - Monthly (RM 588)' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'border-slate-800'} rounded-2xl hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden`}>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" style={{ backgroundImage: "url('/images/cubicle-day-pass.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow bg-slate-900 z-10 relative">
              <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:text-cyan-400 transition-colors">RM 588</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider min-h-[32px]">Weekday (Excl. Holidays)</p>
              <h4 className="text-base font-semibold text-slate-300 group-hover:text-white mb-8 transition-colors">Cubicle – Monthly</h4>
              <a href="#availability-section" onClick={(e) => setPlan('Cubicle - Monthly (RM 588)')} className={`mt-auto block text-center w-full py-3 rounded-xl font-medium text-sm transition-all ${plan === 'Cubicle - Monthly (RM 588)' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                {plan === 'Cubicle - Monthly (RM 588)' ? 'Selected' : 'Select Plan'}
              </a>
            </div>
          </div>

        </div>

        {/* --- ส่วนที่แก้ไขใหม่: ตารางวันที่และปฏิทิน (Availability Section) --- */}
        <div id="availability-section" className="mt-16 pt-16 border-t border-slate-800 scroll-mt-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Workspace <span className="text-cyan-400">Schedule</span></h3>
            <p className="text-slate-400 text-sm">ตรวจสอบคิวการใช้งานและสถานะการจองทั้งหมด</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* ฝั่งซ้าย: ปฏิทินเลือกวัน */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="text-cyan-400 w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Select Booking Date</h3>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <Calendar 
                  onChange={handleDateSelection} 
                  value={calendarDate} 
                  tileDisabled={({date, view}) => view === 'month' && date.getTime() < new Date().setHours(0,0,0,0)}
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      const dateStr = date.toDateString();
                      // เช็คว่าวันนั้นมีการจองที่สถานะ Confirmed ของแพลนที่กำลังเลือกอยู่หรือไม่
                      const isConfirmed = bookedData.some(row => 
                        new Date(row['Start Date']).toDateString() === dateStr && 
                        row['Status'] === 'Approved' && 
                        row['Select Plan'] === plan
                      );
                      return isConfirmed ? 'bg-red-100 text-red-600 font-bold rounded-lg' : null;
                    }
                    return null;
                  }}
                  className="w-full border-none rounded-lg text-slate-900 font-sans"
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div> <span className="text-slate-400">ว่าง (Available)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> <span className="text-red-400">มีการจองแล้ว (Booked)</span></div>
              </div>
            </div>

            {/* ฝั่งขวา: ตารางแสดงรายการจองทั้งหมด (Master Table) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList className="text-cyan-400 w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Booking Status List</h3>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 flex-grow">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Workspace / Plan</th>
                      <th className="p-4 font-semibold">Time</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {isSheetLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center text-cyan-400 animate-pulse">กำลังโหลดข้อมูลจากระบบ...</td></tr>
                    ) : bookedData.length > 0 ? (
                      // แสดงรายการจองล่าสุด 15 รายการ
                      bookedData.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 text-slate-400 whitespace-nowrap">
                            {new Date(row['Start Date']).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="p-4">
                            <div className="text-white font-medium">{row['Select Plan']}</div>
                          </td>
                          <td className="p-4 text-slate-400">
                            {row['Expected Time'] || row['Time Slot'] || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              {row['Status'] === 'Approved' ? (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                                  <CheckCircle2 size={10} /> CONFIRMED
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> WAIT
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">ไม่มีรายการจองในขณะนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <p className="mt-4 text-[11px] text-slate-500 text-center">
                * หากสถานะเป็น <strong>Wait</strong> คุณยังสามารถส่งคำขอจองทับในช่วงเวลาเดียวกันได้เพื่อรอการตรวจสอบคิว
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Included Features & Add-ons */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-slate-900/40 border border-slate-800/60 p-8 md:p-12 rounded-3xl backdrop-blur-sm">
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Included with <span className="text-cyan-400">All Plans</span></h2>
            <p className="text-slate-400 text-sm mb-8">Standard tech amenities to keep your team connected.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">📶</div>
                <div><div className="text-sm font-medium text-slate-200">High-Speed Wi-Fi</div><div className="text-xs text-slate-500">≥100 Mbps Fibre</div></div>
              </div>
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">🖨️</div>
                <div><div className="text-sm font-medium text-slate-200">Shared Printing</div><div className="text-xs text-slate-500">Pay per page</div></div>
              </div>
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">☕</div>
                <div><div className="text-sm font-medium text-slate-200">Brewed Coffee</div><div className="text-xs text-slate-500">Unlimited</div></div>
              </div>
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">💧</div>
                <div><div className="text-sm font-medium text-slate-200">Filtered Water</div><div className="text-xs text-slate-500">Hot & Cold</div></div>
              </div>
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">🍱</div>
                <div><div className="text-sm font-medium text-slate-200">Pantry Access</div><div className="text-xs text-slate-500">Microwave/Fridge</div></div>
              </div>
              <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center space-x-4">
                <div className="text-2xl text-blue-400">🪑</div>
                <div><div className="text-sm font-medium text-slate-200">Ergonomic Setup</div><div className="text-xs text-slate-500">Premium Chairs</div></div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Optional <span className="text-cyan-400">Extras</span></h2>
            <p className="text-slate-400 text-sm mb-8">On-demand services for corporate needs.</p>
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Service</th>
                    <th className="px-6 py-4 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">Printing (Black & White)<br/><span className="text-[10px] text-slate-500 uppercase mt-1 block">Above 10 pages/day</span></td>
                    <td className="px-6 py-4 font-semibold text-white">RM 0.50 / page</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">Printing (Colour)</td>
                    <td className="px-6 py-4 font-semibold text-white">RM 1.00 / page</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">IT Support<br/><span className="text-[10px] text-slate-500 uppercase mt-1 block">Network / Hardware</span></td>
                    <td className="px-6 py-4 font-semibold text-cyan-400">On Request</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">HR Administration</td>
                    <td className="px-6 py-4 font-semibold text-cyan-400">On Request</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Contact Form */}
      <section id="booking" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"></div>

          <div className="p-10 lg:p-16 lg:w-3/5">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Book Your <span className="text-cyan-400">Workspace</span></h2>
            <p className="text-slate-400 mb-8 text-sm">Fill in the details below. Our system will generate your corporate inquiry instantly.</p>
            
            <form onSubmit={handleBookingSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company (Optional)</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="Company Name" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="+60 12 345 6789" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Plan *</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                  <option>Hot Desk - Day Pass (RM 30)</option>
                  <option>Hot Desk - Monthly (RM 388)</option>
                  <option>Team Bundle (RM 1,800)</option>
                  <option>Cubicle - Day Pass (RM 80)</option>
                  <option>Cubicle - Monthly (RM 588)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date *</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expected Time *</label>
                  <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                    <option value="" disabled hidden>Select Time</option>
                    <option>09:00 AM - 12:00 PM (Morning)</option>
                    <option>01:00 PM - 06:00 PM (Afternoon)</option>
                    <option>Full Day (09:00 AM - 06:00 PM)</option>
                  </select>
                </div>
              </div>
              
              <div className="p-5 bg-slate-950/50 border border-slate-800/80 rounded-xl mt-6 backdrop-blur-sm">
                <label className="block text-xs font-medium text-slate-400 mb-3">Security Verification: Please solve <strong className="text-white">{num1} + {num2} = ?</strong></label>
                <input type="number" value={captchaAnswer} onChange={handleCaptchaChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" placeholder="Your Answer" />
              </div>

              <button type="submit" disabled={!isCaptchaValid || !captchaAnswer || isLoading} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                {isLoading ? 'Processing Request...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
          

          <div id="location" className="bg-slate-950 lg:w-2/5 p-10 lg:p-16 border-l border-slate-800 flex flex-col justify-between scroll-mt-20">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Our Location</h3>
              <div className="space-y-6 text-slate-300 text-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-cyan-400 shrink-0">📍</div>
                  <div>
                    <strong className="text-white block mb-1">Elabram Systems Sdn. Bhd.</strong>
                    Level 9 Unit 1 & 3, IOI City Tower 2,<br/>Lebuh IRC, IOI Resort City, 62502 Putrajaya
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">💬</div>
                  <a href="https://wa.me/60103889858" target="_blank" className="hover:text-green-400 transition-colors">+601 0388 9858</a>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-cyan-400 shrink-0">📧</div>
                  <a href="mailto:wissarut.t@elabram.com" className="hover:text-cyan-400 transition-colors">wissarut.t@elabram.com</a>
                </div>
              </div>
            </div>
            
            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-800 mt-10 shadow-inner">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.629165377583!2d101.7118!3d2.9644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdcb7b0f0b4b2b%3A0x8e8a6042ef31b64a!2sIOI%20City%20Tower%202!5e0!3m2!1sen!2sth!4v1690000000000!5m2!1sen!2sth" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="filter grayscale contrast-125 opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"></iframe>
            </div>
          </div>
          
        </div>
      </section>

      {/* 🌟 Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div>
            <h3 className="text-xl font-extrabold text-white mb-4">Elabram <span className="text-cyan-400">Workspace</span></h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering modern enterprises with scalable tech-enabled spaces, high-speed connectivity, and premium environments.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors flex items-center space-x-2"><span>→</span> <span>Pricing & Plans</span></a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors flex items-center space-x-2"><span>→</span> <span>Included Features</span></a></li>
              <li><a href="#location" className="hover:text-cyan-400 transition-colors flex items-center space-x-2"><span>→</span> <span>Our Location</span></a></li>
              <li><a href="#booking" className="hover:text-cyan-400 transition-colors flex items-center space-x-2"><span>→</span> <span>Book a Space</span></a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Contact Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <span className="text-cyan-400">📍</span>
                <span>IOI City Tower 2, Lebuh IRC, <br/>Putrajaya 62502</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-cyan-400">📞</span>
                <a href="https://wa.me/60103889858" className="hover:text-cyan-400 transition-colors">+601 0388 9858</a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-cyan-400">✉️</span>
                <a href="mailto:wissarut.t@elabram.com" className="hover:text-cyan-400 transition-colors">wissarut.t@elabram.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 text-xs text-slate-500 font-medium tracking-wide">
          <p>© {new Date().getFullYear()} Elabram Systems Sdn. Bhd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}