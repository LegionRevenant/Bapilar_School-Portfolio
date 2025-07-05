import { useState, useEffect } from 'react';
import { format, parseISO, isSameDay, startOfWeek } from 'date-fns';
import WaterChart from '../components/WaterChart';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';

function LogsView() {
  const [syncData, setSyncData] = useState({
    lastLog: '—',
    serverSync: 'Disconnected',
  });
  const [logs, setLogs] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [dailyUsage, setDailyUsage] = useState(new Array(7).fill(0));
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ activityType: 'Usage', amount: '' });
  const [filters, setFilters] = useState({ activityType: 'All', date: '', endDate: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();

      const logsData = data.map(log => ({
        id: log.id,
        activityType: log.activityType,
        amount: log.amount,
        date: new Date(log.date),
      }));

      setLogs(logsData);

      // Weekly usage
      const usageArr = new Array(7).fill(0);
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      monday.setHours(0, 0, 0, 0);

      logsData.forEach(log => {
        if (log.activityType === 'Usage') {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((logDate - monday) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            usageArr[diffDays] += log.amount;
          }
        }
      });

      setDailyUsage(usageArr);

      const latestLog = logsData[0];
      const lastLogTime = latestLog?.date
        ? format(latestLog.date, 'MMM dd, yyyy HH:mm')
        : '—';

      setSyncData({
        lastLog: lastLogTime,
        serverSync: 'Connected',
      });
    } catch (err) {
      setSyncData({ lastLog: '—', serverSync: 'Disconnected' });
      alert('Error fetching logs from backend: ' + err.message);
    }

    setLoading(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: formData.activityType,
          amount: Number(formData.amount),
        }),
      });

      if (!res.ok) throw new Error('Failed to add log');

      alert('Log added successfully!');
      setFormData({ activityType: 'Usage', amount: '' });
      fetchLogs();
    } catch (err) {
      alert('Failed to add log: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedLogId) {
      alert('Please select a log to delete.');
      return;
    }

    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const res = await fetch(`/api/logs/${selectedLogId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');
      alert('Log deleted');
      setSelectedLogId(null);
      fetchLogs();
    } catch (err) {
      alert('Failed to delete log: ' + err.message);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesActivity =
      filters.activityType === 'All' || log.activityType === filters.activityType;

    const logDate = log.date;
    const startDate = filters.date ? parseISO(filters.date) : null;
    const endDate = filters.endDate ? parseISO(filters.endDate) : startDate;

    const matchesDate =
      !startDate || (logDate >= startDate && logDate <= endDate);

    return matchesActivity && matchesDate;
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <MobileNav />
        <div className="p-4 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>

          {/* Filters */}
          <div className="mb-4 flex gap-4 items-center">
            <select
              name="activityType"
              value={filters.activityType}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            >
              <option value="All">All</option>
              <option value="Usage">Usage</option>
              <option value="Refill">Refill</option>
            </select>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            />
          </div>

          {/* Logs Table */}
          <div className="overflow-y-auto max-h-64 border rounded shadow">
            <table className="w-full text-left">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2"></th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-2">
                      <input
                        type="radio"
                        name="selectedLog"
                        checked={selectedLogId === log.id}
                        onChange={() => setSelectedLogId(log.id)}
                      />
                    </td>
                    <td className="p-2">{format(log.date, 'MMM dd, yyyy HH:mm')}</td>
                    <td className="p-2">{log.activityType}</td>
                    <td className="p-2 text-right">
                      <span className={log.activityType === 'Usage' ? 'text-red-600' : 'text-green-600'}>
                        {log.activityType === 'Usage' ? '-' : '+'}{log.amount}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">No logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Log Form */}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-4 items-center">
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="Usage">Usage</option>
              <option value="Refill">Refill</option>
            </select>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount (L)"
              className="border p-2 rounded w-40"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Log
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Selected
            </button>
          </form>

          {/* Weekly Usage Chart */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Weekly Usage</h2>
            <WaterChart dailyUsages={dailyUsage} />
          </div>

          {/* Sync Info */}
          <div className="mt-6 text-sm text-blue-1000">
            <p>Last Log: {syncData.lastLog}</p>
            <p>Server Status: {syncData.serverSync}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogsView;
