import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8 sm:py-12 px-4 sm:px-6 pb-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold">
          <HeartPulse className="w-4 h-4 text-teal-600" />
          <span>Transforming Healthcare Logistics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Eliminating Waiting Room Queues Across Modern Hospitals
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          SmartCare was built with a simple mission: ensure patients receive high-quality medical attention from top specialists on time, with zero unnecessary waiting.
        </p>
      </div>

      {/* Problem vs Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-rose-700">
            The Traditional Problem
          </span>
          <h3 className="text-xl font-bold text-slate-900">Overcrowded Hospital Queues</h3>
          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Patients wait 2 to 4 hours in crowded waiting halls before seeing a physician.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Double-booked paper schedules cause doctor burnout and scheduling errors.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span>Difficulty knowing when specific medical department specialists are actually available.</span>
            </li>
          </ul>
        </div>

        <div className="bg-teal-50/70 border border-teal-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700">
            The SmartCare Solution
          </span>
          <h3 className="text-xl font-bold text-slate-900">Streamlined Digital Booking</h3>
          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <span>Direct access to verified doctor availability in real-time.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <span>30-minute reserved time slots that guarantee express hospital check-in.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <span>Instant 1-click rescheduling and slot recovery for other patients in need.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Hospital Credentials & Trust */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ready to experience seamless hospital visits?
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Explore our medical specialists directory today and lock in your queue bypass consultation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/doctors"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-102"
          >
            <span>Browse Medical Specialists</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
          >
            Create Patient Account
          </Link>
        </div>
      </div>
    </div>
  );
};
