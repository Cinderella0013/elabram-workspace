import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Papa from 'papaparse';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2 } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6grModf5pKXT9su90vRzpRNtVL-oN71zPWZLlzY9V_BAtvh6IKw8e_oq9NPm787CjKf6f9Wr-hPOP/pub?gid=144768523&single=true&output=csv';

export default function BookingCalendar({ selectedPlan }) {
  const [date, setDate] = useState(new Date());
  const [bookedData, setBookedData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlan) return;

    const fetchBookings = async () => {
      setLoading(true);
      Papa.parse(GOOGLE_SHEET_CSV_URL, {
        download: true,
        header: true,
        complete: (results) => {
          // เก็บข้อมูลทั้งหมดที่มี Start Date
          const validData = results.data.filter(row => row['Start Date']);
          setBookedData(validData);
          setLoading(false);
        },
        error: (error) => {
          console.error("Error fetching Google Sheet Data:", error);
          setLoading(false);
        }
      });
    };

    fetchBookings();
  }, [selectedPlan]);

  return (
    <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        {selectedPlan ? `Schedule for: ${selectedPlan}` : 'Please select a plan to view schedule'}
      </h3>
      
      {!selectedPlan ? (
        <div className="h-40 flex items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
          <p>Click "Select Plan" on any card to view availability</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ฝั่งซ้าย: ปฏิทิน */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="text-cyan-400 w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Select Date</h3>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <Calendar 
                onChange={setDate} 
                value={date} 
                // ปิดวันที่ผ่านมาแล้ว
                tileDisabled={({date, view}) => view === 'month' && date < new Date().setHours(0,0,0,0)}
                // ไฮไลต์สีแดงเมื่อสถานะเป็น Confirmed สำหรับ Plan นี้
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const isConfirmed = bookedData.some(row => 
                      new Date(row['Start Date']).toDateString() === date.toDateString() && 
                      row['Status'] === 'Approved' && 
                      row['Select Plan'] === selectedPlan
                    );
                    return isConfirmed ? 'bg-red-100 text-red-600 font-bold rounded-lg' : null;
                  }
                  return null;
                }}
                className="w-full border-none font-sans text-slate-900"
              />
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs">
              <span className="text-slate-400 flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div> Available</span>
              <span className="text-red-400 flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> Booked</span>
            </div>
          </div>

          {/* ฝั่งขวา: ตารางแสดงคิวทั้งหมด */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="text-cyan-400 w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Master Booking List</h3>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 flex-grow">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Plan</th>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-cyan-400 animate-pulse">Loading data...</td></tr>
                  ) : bookedData.length > 0 ? (
                    bookedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(row['Start Date']).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        <td className="p-4 text-white">{row['Select Plan']}</td>
                        <td className="p-4 text-slate-400">{row['Expected Time'] || row['Time Slot'] || '-'}</td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {row['Status'] === 'Approved' ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full"><CheckCircle2 size={10} /> CONFIRMED</span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> WAIT</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No bookings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}