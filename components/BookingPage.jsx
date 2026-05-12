"use client";
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Papa from 'papaparse';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2 } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

// URL CSV จาก Google Sheet ของคุณ
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6grModf5pKXT9su90vRzpRNtVL-oN71zPWZLlzY9V_BAtvh6IKw8e_oq9NPm787CjKf6f9Wr-hPOP/pub?gid=144768523&single=true&output=csv';

export default function WorkspaceBookingPage() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [bookedData, setBookedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());

  // 1. ดึงข้อมูลจาก Google Sheet
  useEffect(() => {
    setLoading(true);
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        // กรองข้อมูลที่ว่างออก
        const validData = results.data.filter(row => row['Start Date']);
        setBookedData(validData);
        setLoading(false);
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Select Your Workspace Plan</h2>
        
        {/* --- ส่วนที่ 1: การ์ดจอง (Pricing Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* แพลนที่ 1: Hot Desk Monthly */}
          <div className={`bg-slate-900 border ${selectedPlan.includes('Monthly') ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-slate-800'} rounded-2xl transition-all duration-300 group flex flex-col relative overflow-hidden`}>
            <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</div>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-80 transition-all" style={{ backgroundImage: "url('/images/hot-desk-monthly.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow relative z-10">
              <h3 className="text-2xl font-bold text-white">RM 388</h3>
              <p className="text-xs text-slate-500 mb-4 uppercase">Weekday Monthly</p>
              <h4 className="text-lg font-semibold text-slate-300 mb-6">Hot Desk – Monthly</h4>
              <button onClick={() => setSelectedPlan('Hot Desk - Monthly (RM 388)')} className={`mt-auto py-3 rounded-xl font-bold transition-all ${selectedPlan.includes('Monthly (RM 388)') ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>
                {selectedPlan.includes('Monthly (RM 388)') ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>

          {/* แพลนที่ 2: Team Bundle */}
          <div className={`bg-slate-900 border ${selectedPlan.includes('Team') ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-800'} rounded-2xl transition-all duration-300 group flex flex-col relative overflow-hidden`}>
            <div className="absolute top-4 right-4 z-20 bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Best Value</div>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-80 transition-all" style={{ backgroundImage: "url('/images/team-bundle.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow relative z-10">
              <h3 className="text-2xl font-bold text-white">RM 1,800</h3>
              <p className="text-xs text-slate-500 mb-4 uppercase">Monthly Team</p>
              <h4 className="text-lg font-semibold text-slate-300 mb-6">Team Bundle (5 pax)</h4>
              <button onClick={() => setSelectedPlan('Team Bundle (RM 1,800)')} className={`mt-auto py-3 rounded-xl font-bold transition-all ${selectedPlan.includes('Team Bundle') ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-white'}`}>
                {selectedPlan.includes('Team Bundle') ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>

          {/* แพลนที่ 3: Cubicle */}
          <div className={`bg-slate-900 border ${selectedPlan.includes('Cubicle') ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-slate-800'} rounded-2xl transition-all duration-300 group flex flex-col relative overflow-hidden`}>
            <div className="h-40 bg-cover bg-center opacity-40 group-hover:opacity-80 transition-all" style={{ backgroundImage: "url('/images/cubicle-day-pass.jpg')" }}></div>
            <div className="p-6 flex flex-col flex-grow relative z-10">
              <h3 className="text-2xl font-bold text-white">RM 80</h3>
              <p className="text-xs text-slate-500 mb-4 uppercase">Per Day</p>
              <h4 className="text-lg font-semibold text-slate-300 mb-6">Cubicle – Day Pass</h4>
              <button onClick={() => setSelectedPlan('Cubicle - Day Pass (RM 80)')} className={`mt-auto py-3 rounded-xl font-bold transition-all ${selectedPlan.includes('Cubicle - Day Pass') ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-purple-600 hover:text-white'}`}>
                {selectedPlan.includes('Cubicle - Day Pass') ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          </div>

        </div>

        {/* --- ส่วนที่ 2: ตารางวันที่และปฏิทิน (Availability Section) --- */}
        {selectedPlan && (
          <div className="mt-16 pt-12 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Workspace <span className="text-cyan-400">Schedule</span></h3>
              <p className="text-slate-400 text-sm">Showing schedule for: <strong className="text-white">{selectedPlan}</strong></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* ฝั่งซ้าย: ปฏิทิน */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarIcon className="text-cyan-400 w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Availability Calendar</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-inner">
                  <Calendar 
                    onChange={setDate} 
                    value={date} 
                    // ปิดไม่ให้กดเฉพาะวันที่ผ่านมาแล้ว
                    tileDisabled={({date, view}) => view === 'month' && date < new Date().setHours(0,0,0,0)}
                    // ไฮไลต์สีแดงเฉพาะวันที่มีคน Confirm แพลนนี้แล้ว
                    tileClassName={({ date, view }) => {
                      if (view === 'month') {
                        const dateStr = date.toDateString();
                        const isConfirmed = bookedData.some(row => 
                          new Date(row['Start Date']).toDateString() === dateStr && 
                          row['Status'] === 'Approved' && 
                          row['Select Plan'] === selectedPlan
                        );
                        return isConfirmed ? 'bg-red-100 text-red-600 font-bold rounded-lg' : null;
                      }
                      return null;
                    }}
                    className="w-full border-none rounded-lg text-slate-900 font-sans"
                  />
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div> <span className="text-slate-400">Available</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> <span className="text-red-400">Booked (Confirmed)</span></div>
                </div>
              </div>

              {/* ฝั่งขวา: ตารางรายการจองทั้งหมด */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="text-cyan-400 w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Master Booking List</h3>
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
                      {loading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-cyan-400 animate-pulse">Loading data...</td></tr>
                      ) : bookedData.length > 0 ? (
                        bookedData.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-4 text-slate-400 whitespace-nowrap">
                              {new Date(row['Start Date']).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </td>
                            <td className="p-4 text-white font-medium">{row['Select Plan']}</td>
                            <td className="p-4 text-slate-400">{row['Expected Time'] || row['Time Slot'] || '-'}</td>
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
                          <td colSpan="4" className="p-8 text-center text-slate-500 italic">No current bookings.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl">
                  <p className="text-blue-400 text-sm font-medium">
                    Selected Date: <span className="text-white text-lg ml-2">{date.toLocaleDateString()}</span>
                  </p>
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20">
                    Proceed to Booking Form
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}