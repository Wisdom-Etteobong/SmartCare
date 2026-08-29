import React, { useState } from 'react';
import { Bell, Lock, Shield, Smartphone, Globe, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [remindersBefore, setRemindersBefore] = useState('24h');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    success('Notification and portal preferences saved.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal & Notification Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize how SmartCare delivers appointment reminders, confirmation alerts, and updates.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-teal-600" />
              <span>Appointment Notifications</span>
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Email Confirmation & Pass</h4>
                <p className="text-xs text-slate-500">Receive booking receipt and digital pass via email</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-teal-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <h4 className="text-sm font-bold text-slate-800">SMS Appointment Reminder</h4>
                <p className="text-xs text-slate-500">Get an SMS text message before your scheduled visit</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-teal-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-bold text-slate-800">Reminder Timing</h4>
              <p className="text-xs text-slate-500">When should we send your reminder alert?</p>
              <select
                value={remindersBefore}
                onChange={e => setRemindersBefore(e.target.value)}
                className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 outline-hidden"
              >
                <option value="2h">2 Hours Before Consultation</option>
                <option value="12h">12 Hours Before Consultation</option>
                <option value="24h">24 Hours (1 Day) Before Consultation</option>
                <option value="48h">48 Hours (2 Days) Before Consultation</option>
              </select>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>Security & Data Compliance</span>
            </h3>

            <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-2xl text-xs text-teal-900 space-y-1">
              <p className="font-bold text-teal-800">HIPAA & Healthcare Data Protection</p>
              <p className="text-teal-800/90 leading-relaxed">
                SmartCare encrypts all patient health identification numbers and consultation details. Your appointment schedules are only shared with your assigned hospital specialists.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
