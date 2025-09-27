import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, PolarArea } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { MdScience, MdAssignment, MdMoney } from 'react-icons/md';
Chart.register(ArcElement, Tooltip, Legend, RadialLinearScale);

const lineGraphBlue = (
  <svg width="48" height="24" fill="none" viewBox="0 0 48 24"><polyline points="0,20 10,18 20,19 30,15 40,16 48,10" stroke="#2563eb" strokeWidth="2" fill="none"/></svg>
);
const lineGraphRed = (
  <svg width="48" height="24" fill="none" viewBox="0 0 48 24"><polyline points="0,20 10,18 20,19 30,15 40,16 48,10" stroke="#f43f5e" strokeWidth="2" fill="none"/></svg>
);
const lineGraphGreen = (
  <svg width="48" height="24" fill="none" viewBox="0 0 48 24"><polyline points="0,20 10,18 20,19 30,15 40,16 48,10" stroke="#10b981" strokeWidth="2" fill="none"/></svg>
);

const downloadIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 3v10m0 0l-3-3m3 3l3-3" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="15" width="12" height="2" rx="1" fill="#64748b"/></svg>
);
const menuIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="#64748b"/><circle cx="10" cy="10" r="1.5" fill="#64748b"/><circle cx="16" cy="10" r="1.5" fill="#64748b"/></svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalCalibrated, setTotalCalibrated] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [maleClients, setMaleClients] = useState(0);
  const [femaleClients, setFemaleClients] = useState(0);
  const [allEquipmentDebug, setAllEquipmentDebug] = useState([]);
  const [clients, setClients] = useState([]);
  const [locationLevel, setLocationLevel] = useState('province'); // 'province', 'city', 'barangay'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestEvents, setRequestEvents] = useState([]); // { date: 'YYYY-MM-DD', type: 'scheduled|in_progress|completed|expected' }
  const [requestsByDate, setRequestsByDate] = useState({}); // { 'YYYY-MM-DD': [{ref, due, status}] }
  const [hoveredDayKey, setHoveredDayKey] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch transactions for payments
        const res = await fetch('http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/transaction/read.php');
        const data = await res.json();
        if (data && data.records) {
          let calibratedCount = 0;
          let requestsCount = data.records.length;
          let totalPayments = 0;
          data.records.forEach(t => {
            // Count calibrated equipment (if needed, you can adjust this logic)
            if (Array.isArray(t.equipment)) {
              t.equipment.forEach(eq => {
                if (eq.status && typeof eq.status === 'string' && eq.status.toLowerCase() === 'completed') {
                  calibratedCount++;
                }
              });
            }
            // Sum all payments for this transaction
            if (Array.isArray(t.payments)) {
              t.payments.forEach(p => {
                totalPayments += parseFloat(p.amount) || 0;
              });
            }
            // Remove old transaction-level discount logic
          });
          setTotalCalibrated(calibratedCount);
          setTotalRequests(requestsCount);
          setTotalSales(totalPayments);
        }
      } catch (e) {
        setTotalCalibrated(0);
        setTotalRequests(0);
        setTotalSales(0);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/clients/get_clients.php');
        const data = await res.json();
        if (data && data.records) {
          setClients(data.records);
          // Count male and female clients
          let male = 0;
          let female = 0;
          data.records.forEach(c => {
            if (c.gender && typeof c.gender === 'string') {
              if (c.gender.toLowerCase() === 'male') male++;
              else if (c.gender.toLowerCase() === 'female') female++;
            }
          });
          setMaleClients(male);
          setFemaleClients(female);
        }
      } catch (e) {
        setClients([]);
        setMaleClients(0);
        setFemaleClients(0);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('http://localhost/ICMS_DOST-%20PSTO/ICMS_backend/api/request/read.php');
        const data = await res.json();
        if (data && data.records) {
          const events = [];
          const map = {};
          data.records.forEach(r => {
            if (r.status) {
              const statusLower = String(r.status).toLowerCase();
              // Choose a representative date for the event based on status
              let eventDate = null;
              if (statusLower === 'completed') {
                eventDate = r.date_finished || r.date_expected_completion || r.date_scheduled;
              } else if (statusLower === 'in_progress') {
                eventDate = r.date_scheduled || new Date().toISOString().split('T')[0];
              } else if (statusLower === 'pending') {
                eventDate = r.date_scheduled || new Date().toISOString().split('T')[0];
              } else if (statusLower === 'cancelled') {
                eventDate = r.date_scheduled || r.date_finished || r.date_expected_completion;
              }
              if (eventDate) {
                events.push({ date: eventDate, type: statusLower });
                const key = String(eventDate).split('T')[0];
                if (!map[key]) map[key] = [];
                map[key].push({
                  ref: r.reference_number,
                  due: r.date_expected_completion || 'N/A',
                  status: statusLower,
                });
              }
            }
          });
          setRequestEvents(events);
          setRequestsByDate(map);
        } else {
          setRequestEvents([]);
          setRequestsByDate({});
        }
      } catch {
        setRequestEvents([]);
      }
    };
    fetchRequests();
  }, []);

  const monthMeta = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];
    // Leading days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push(new Date(year, month - 1, prevMonthDays - i));
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    // Trailing days from next month to complete weeks
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= trailing; d++) cells.push(new Date(year, month + 1, d));
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return { year, month, weeks };
  }, [currentMonth]);

  const eventColorByType = {
    pending: 'bg-red-500',
    in_progress: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-gray-400',
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    requestEvents.forEach(ev => {
      const key = String(ev.date).split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(ev.type);
    });
    return map;
  }, [requestEvents]);

  // Donut chart data: show distribution by selected location level
  let donutLabels = [];
  let donutData = [];
  if (locationLevel === 'province') {
    // Show distribution by province
    const provinceCounts = {};
    clients.forEach(c => {
      if (c.province) provinceCounts[c.province] = (provinceCounts[c.province] || 0) + 1;
    });
    donutLabels = Object.keys(provinceCounts);
    donutData = Object.values(provinceCounts);
  } else if (locationLevel === 'city') {
    // Show distribution by city
    const cityCounts = {};
    clients.forEach(c => {
      if (c.city) cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
    });
    donutLabels = Object.keys(cityCounts);
    donutData = Object.values(cityCounts);
  }
  // Total for current level (always integer)
  const totalAtLevel = Math.round(donutData.reduce((a, b) => a + b, 0));

  // Colors for donut chart
  const donutColors = [
    'rgba(37,99,235,0.4)',   // blue
    'rgba(244,63,94,0.4)',   // red
    'rgba(16,185,129,0.4)',  // green
    'rgba(245,158,66,0.4)',  // orange
    'rgba(167,139,250,0.4)', // purple
    'rgba(251,191,36,0.4)',  // yellow
    'rgba(99,102,241,0.4)',  // indigo
    'rgba(234,179,8,0.4)',   // gold
    'rgba(20,184,166,0.4)',  // teal
    'rgba(244,114,182,0.4)', // pink
    'rgba(248,113,113,0.4)', // light red
    'rgba(96,165,250,0.4)',  // light blue
    'rgba(52,211,153,0.4)',  // light green
    'rgba(250,204,21,0.4)',  // light yellow
    'rgba(129,140,248,0.4)', // light indigo
    'rgba(244,114,182,0.4)', // pink
    'rgba(248,113,113,0.4)', // light red
    'rgba(96,165,250,0.4)',  // light blue
    'rgba(52,211,153,0.4)',  // light green
    'rgba(250,204,21,0.4)',  // light yellow
    'rgba(129,140,248,0.4)', // light indigo
  ];

  return (
    <div className="parent min-h-screen p-6">
      <div className="div1">
        {/* Total Calibrated Items */}
        <div className="bg-[#e3eafe] rounded-xl p-3 min-h-[100px] max-h-[100px] shadow flex flex-col h-full relative overflow-hidden justify-center">
          <div className="absolute top-3 right-3 opacity-60">
            <MdScience size={38} className="text-blue-600" />
          </div>
          <span className="text-gray-600 font-medium text-sm">Total Calibrated Items</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : totalCalibrated}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">Since last week</span>
            {/* You can add a percentage change here if you want */}
          </div>
        </div>
      </div>
      <div className="div2">
        {/* Total Requests */}
        <div className="bg-[#fde8e9] rounded-xl p-3 min-h-[100px] max-h-[100px] shadow flex flex-col h-full relative overflow-hidden justify-center">
          <div className="absolute top-3 right-3 opacity-60">
            <MdAssignment size={38} className="text-red-500" />
          </div>
          <span className="text-gray-600 font-medium text-sm">Total Requests</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : totalRequests}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">Since last week</span>
          </div>
        </div>
      </div>
      <div className="div3">
        {/* Total Sales */}
        <div className="bg-[#e3f8f2] rounded-xl p-3 min-h-[100px] max-h-[100px] shadow flex flex-col h-full relative overflow-hidden justify-center">
          <div className="absolute top-3 right-3 opacity-60">
            <MdMoney size={38} className="text-green-500" />
          </div>
          <span className="text-gray-600 font-medium text-sm">Total Fees Collected</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : `₱${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">Since last week</span>
          </div>
        </div>
      </div>
      <div className="div4">
        {/* Orders List Chart (now donut chart for gender distribution) */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col h-full justify-start max-h-[330px] items-center">
          <div className="flex items-center justify-between mb-1 w-full">
            <h2 className="text-xl font-bold text-[#2d2d2d]">Total Clients</h2>
            <div className="flex items-center">{downloadIcon}</div>
          </div>
          {/* Donut Chart for Gender Distribution */}
          <div className="w-48 h-48 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Male', 'Female'],
                datasets: [
                  {
                    data: [maleClients, femaleClients],
                    backgroundColor: ['#2563eb', '#f43f5e'],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                cutout: '70%',
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="flex flex-row gap-8 items-center mt-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{background:'#2563eb'}}></span>
              <span className="text-gray-700 font-medium">Male:</span>
              <span className="text-blue-600 font-bold text-lg">{maleClients}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{background:'#f43f5e'}}></span>
              <span className="text-gray-700 font-medium">Female:</span>
              <span className="text-pink-500 font-bold text-lg">{femaleClients}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="div5">
        {/* Total Clients by Location Card */}
        <div className="bg-[#e3eafe] rounded-xl shadow p-6 flex flex-col h-full -mt-8 min-h-[400px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Total Clients by Location</h2>
          </div>
          {/* Location level selection buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`px-4 py-1 rounded-full border text-sm font-semibold transition ${locationLevel === 'province' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'}`}
              onClick={() => setLocationLevel('province')}
            >
              Province
            </button>
            <button
              className={`px-4 py-1 rounded-full border text-sm font-semibold transition ${locationLevel === 'city' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'}`}
              onClick={() => setLocationLevel('city')}
            >
              City
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-56 h-56 flex items-center justify-center">
              <PolarArea
                data={{
                  labels: donutLabels,
                  datasets: [
                    {
                      data: donutData,
                      backgroundColor: donutColors,
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 16, font: { size: 13 } } },
                    tooltip: { enabled: true },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: { display: false },
                      grid: { color: 'rgba(0,0,0,0.08)' },
                      pointLabels: { color: '#64748b', font: { size: 13 } },
                      ticks: { color: '#64748b', font: { size: 13 }, backdropColor: 'transparent' }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 text-lg font-bold text-gray-700">Total: {totalAtLevel}</div>
          </div>
        </div>
      </div>
      <div className="div6">
        {/* Calendar Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col mt-32 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-bold text-indigo-900">Calendar</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="px-2 py-1 rounded border text-sm hover:bg-gray-100"
              >
                {'<'}
              </button>
              <div className="text-sm text-gray-700 font-semibold min-w-[160px] text-center">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="px-2 py-1 rounded border text-sm hover:bg-gray-100"
              >
                {'>'}
              </button>
            </div>
          </div>
          <div className="w-full rounded-xl p-2 pb-8 overflow-visible">
            <div className="border rounded-xl overflow-visible mb-4">
              <div className="grid grid-cols-7 text-xs text-gray-500 bg-gray-50">
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                  <div key={d} className="px-3 py-2 border-b">{d}</div>
                ))}
              </div>
              <div className="grid overflow-visible">
                {monthMeta.weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 overflow-visible">
                    {week.map((day, di) => {
                      const key = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
                      const isCurrentMonth = day.getMonth() === monthMeta.month;
                      const types = eventsByDate[key] || [];
                      return (
                        <div
                          key={key}
                          className={`h-20 border p-2 relative overflow-visible ${isCurrentMonth ? '' : 'bg-gray-100'}`}
                          onMouseEnter={() => setHoveredDayKey(key)}
                          onMouseLeave={() => setHoveredDayKey(null)}
                        >
                          <div className={`text-[10px] ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>{String(day.getDate()).padStart(2,'0')}</div>
                          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                            {types.slice(0,6).map((t, idx) => (
                              <span key={idx} className={`inline-block w-2.5 h-2.5 rounded ${eventColorByType[t] || 'bg-gray-300'}`}></span>
                            ))}
                          </div>
                          {types.length > 6 && (
                            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">+{types.length - 6}</div>
                          )}
                          {hoveredDayKey === key && (requestsByDate[key] && requestsByDate[key].length > 0) && (() => {
                            const items = requestsByDate[key];
                            const visible = items.slice(0, 5);
                            const hasMore = items.length > 5;
                            return (
                              <div className="absolute z-50 top-6 left-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl p-3 text-xs w-72">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold text-gray-800">Requests ({items.length})</div>
                                  <div className="text-[10px] text-gray-400">{key}</div>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-48 overflow-auto">
                                  {visible.map((rq, i) => (
                                    <div key={`${rq.ref}-${i}`} className="py-1 flex items-center justify-between">
                                      <span className="text-gray-900 font-medium truncate mr-2">{rq.ref}</span>
                                      <span className="text-gray-500 whitespace-nowrap">Due: {rq.due || 'N/A'}</span>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate('/reservations'); }}
                                  className="mt-2 w-full px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[#2a9dab] text-white hover:bg-[#238a91]"
                                >
                                  View more
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500"></span><span>Pending</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500"></span><span>In Progress</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500"></span><span>Completed</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-400"></span><span>Cancelled</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 