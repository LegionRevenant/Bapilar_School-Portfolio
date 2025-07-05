import { useState, useEffect, useRef } from 'react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  format, isWithinInterval, parseISO
} from 'date-fns';

import WaterTank from '../components/WaterTank';
import StatsCard from '../components/StatsCard';
import MobileNav from '../components/MobileNav';
import SettingsOverlay from '../components/SettingsOverlay';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const [tankData, setTankData] = useState({ currentLevel: 0, temperature: 24 });
  const [showSettings, setShowSettings] = useState(false);
  const [usage, setUsage] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [lastAutoCheck, setLastAutoCheck] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [settings, setSettings] = useState({
    thresholdType: 'percentage',
    thresholdValue: 20,
    tankShape: 'rectangular',
    dimensions: { length: 16.5, width: 12, height: 15, diameter: 12 },
    notificationsEnabled: true,
    autologEnabled: false,
    autologInterval: 5,
    autologMinChange: 1
  });

  const lastLevelRef = useRef(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/tank-settings');
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          thresholdType: data.thresholdType || 'percentage',
          thresholdValue: data.thresholdValue || 20,
          tankShape: data.tankShape || 'rectangular',
          dimensions: {
            length: data.length || 0,
            width: data.width || 0,
            height: data.height || 0,
            diameter: data.diameter || 0
          },
          notificationsEnabled: data.notificationsEnabled ?? true,
          autologEnabled: data.autologEnabled ?? false,
          autologInterval: data.autologInterval || 5,
          autologMinChange: data.autologMinChange || 1
        }));
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const computeMaxCapacity = () => {
    const { height, width, length, diameter } = settings.dimensions;
    return settings.tankShape === 'rectangular'
      ? (height * width * length) / 1000
      : (Math.PI * Math.pow(diameter / 2, 2) * height) / 1000;
  };

  const maxCapacity = Math.round(computeMaxCapacity());

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch('/api/sensor-data');
        const data = await res.json();
        if (!data.length) return;
        const { temperature, distance_cm } = data[0];
        const filledHeight = Math.max(0, settings.dimensions.height - distance_cm);
        const volumeCm3 = settings.tankShape === 'rectangular'
          ? filledHeight * settings.dimensions.width * settings.dimensions.length
          : Math.PI * Math.pow(settings.dimensions.diameter / 2, 2) * filledHeight;
        const currentLiters = parseFloat((volumeCm3 / 1000).toFixed(2));
        setTankData({
          temperature: parseFloat(temperature).toFixed(1),
          currentLevel: currentLiters
        });
      } catch (err) {
        console.error('Sensor fetch error:', err);
      }
    };
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, [settings]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        let daily = 0, weekly = 0, monthly = 0;
        data.forEach(log => {
          if (log.activityType !== 'Usage') return;
          const logDate = parseISO(log.date);
          const usageAmount = Number(log.amount || 0);
          if (format(logDate, 'yyyy-MM-dd') === todayStr) daily += usageAmount;
          if (isWithinInterval(logDate, { start: weekStart, end: weekEnd })) weekly += usageAmount;
          if (isWithinInterval(logDate, { start: monthStart, end: monthEnd })) monthly += usageAmount;
        });
        setUsage({
          daily: parseFloat(daily.toFixed(2)),
          weekly: parseFloat(weekly.toFixed(2)),
          monthly: parseFloat(monthly.toFixed(2))
        });
      } catch (err) {
        console.error('Usage fetch error:', err);
      }
    };
    fetchUsage();
  }, []);

  // Alerts
  const levelPercent = (tankData.currentLevel / maxCapacity) * 100;
  const isBelowThreshold = settings.thresholdType === 'percentage'
    ? levelPercent < settings.thresholdValue
    : tankData.currentLevel < settings.thresholdValue;

  useEffect(() => {
    let audio;
    if (isBelowThreshold) {
      audio = new Audio('/src/audio/alert.wav');
      audio.loop = true;
      audio.play().catch(err => console.warn('Autoplay blocked:', err));
    }
    return () => { if (audio) audio.pause(); };
  }, [isBelowThreshold]);

 const startAutoLogging = async () => {
  clearInterval(intervalRef.current);
  clearInterval(countdownRef.current);

  let countdownSeconds = settings.autologInterval * 60;
  setCountdown(countdownSeconds);

  // ⏱ Get baseline water level
  try {
    const res = await fetch('/api/sensor-data');
    const data = await res.json();
    if (data.length) {
      const currentDistance = parseFloat(data[0]?.distance_cm || 0);
      const filledHeight = Math.max(0, settings.dimensions.height - currentDistance);
      const volume = settings.tankShape === 'rectangular'
        ? filledHeight * settings.dimensions.width * settings.dimensions.length
        : Math.PI * Math.pow(settings.dimensions.diameter / 2, 2) * filledHeight;

      lastLevelRef.current = parseFloat((volume / 1000).toFixed(2));
      setLastAutoCheck(new Date());
    }
  } catch (err) {
    console.error('Initial auto log fetch failed:', err);
  }

  // Countdown every second
  countdownRef.current = setInterval(async () => {
    countdownSeconds -= 1;
    setCountdown(countdownSeconds);

    if (countdownSeconds <= 0) {
      try {
        const res = await fetch('/api/sensor-data');
        const data = await res.json();
        if (!data.length) return;

        const currentDistance = parseFloat(data[0]?.distance_cm || 0);
        const filledHeight = Math.max(0, settings.dimensions.height - currentDistance);
        const volume = settings.tankShape === 'rectangular'
          ? filledHeight * settings.dimensions.width * settings.dimensions.length
          : Math.PI * Math.pow(settings.dimensions.diameter / 2, 2) * filledHeight;

        const currentLiters = parseFloat((volume / 1000).toFixed(2));
        const diff = Math.abs(currentLiters - lastLevelRef.current);

        if (diff >= settings.autologMinChange) {
          const activityType = currentLiters < lastLevelRef.current ? 'Usage' : 'Refill';
          const amount = diff;

          await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityType, amount })
          });

          alert(`Auto log: ${activityType} of ${amount.toFixed(2)}L`);
        }

        lastLevelRef.current = currentLiters;
        setLastAutoCheck(new Date());
        countdownSeconds = settings.autologInterval * 60;
        setCountdown(countdownSeconds);
      } catch (err) {
        console.error('Auto log fetch failed:', err);
      }
    }
  }, 1000); // Tick every second
};

  useEffect(() => {
    if (settings.autologEnabled) {
      startAutoLogging();
    } else {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [settings]);

  const formatCountdown = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const saveAutoLogSetting = async (updatedSettings) => {
    try {
      await fetch('/api/tank-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          ...updatedSettings,
          dimensions: settings.dimensions
        })
      });
      setSettings(prev => ({ ...prev, ...updatedSettings }));
    } catch (err) {
      console.error('Failed to save autolog settings:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <Sidebar />
      <div className="flex-auto mx-auto max-w-7xl p-4 md:p-6 overflow-auto">
        <MobileNav />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Water Level</h2>
          <button
            className="p-2 rounded-full hover:bg-blue-100"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>
        </div>

        {isBelowThreshold && (
          <div className="mb-4 p-4 rounded-lg text-white text-lg font-bold border-2 border-red-800 shadow-lg flex items-center gap-3 animate-flash-bg">
            Alert: Water level is below your configured threshold.
          </div>
        )}

        <WaterTank capacity={maxCapacity} currentLevel={tankData.currentLevel} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <StatsCard title="Max Capacity" value={maxCapacity} unit="L" />
          <StatsCard title="Current Level" value={tankData.currentLevel} unit="L" />
          <StatsCard title="Temperature" value={tankData.temperature} unit="°C" />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatsCard title="Daily" value={usage.daily} unit="L" />
            <StatsCard title="Weekly" value={usage.weekly} unit="L" />
            <StatsCard title="Monthly" value={usage.monthly} unit="L" />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Automatic Logging</h3>
          <div className="flex gap-4 items-center mb-2">
            <button
              onClick={() => saveAutoLogSetting({ autologEnabled: !settings.autologEnabled })}
              className={`px-4 py-1 rounded text-white ${settings.autologEnabled ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              {settings.autologEnabled ? 'Enabled' : 'Disabled'}
            </button>
            <label>
              Interval (min):
              <input
                type="number"
                min={1}
                value={settings.autologInterval}
                onChange={e => saveAutoLogSetting({ autologInterval: Number(e.target.value) })}
                className="border p-1 ml-2 w-16"
              />
            </label>
            <label>
              Min diff (L):
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={settings.autologMinChange}
                onChange={e => saveAutoLogSetting({ autologMinChange: Number(e.target.value) })}
                className="border p-1 ml-2 w-16"
              />
            </label>
          </div>
          {settings.autologEnabled && (
            <p className="text-sm text-gray-500">
              Checking in: {formatCountdown(countdown)}
            </p>
          )}
        </div>

        <SettingsOverlay
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          initialSettings={settings}
          onSave={async (newSettings) => {
            try {
              await fetch('/api/tank-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
              });
              setSettings(prev => ({ ...prev, ...newSettings }));
            } catch (err) {
              console.error('Failed to save settings:', err);
            }
          }}
        />
      </div>
    </div>
  );
}

export default Dashboard;
