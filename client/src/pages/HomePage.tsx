import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building,
  HeartPulse,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { IDoctor } from '../../../package/src/types/doctor';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { useAuth } from '../context/AuthContext';
import { fallbackDoctors } from '../data/fallbackDoctors';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [featuredDoctors, setFeaturedDoctors] = useState<IDoctor[]>(() => fallbackDoctors.slice(0, 3));
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/doctors');
      if (res.data?.data?.doctors && res.data.data.doctors.length > 0) {
        setFeaturedDoctors(res.data.data.doctors.slice(0, 3));
        setFetchError(null);
      }
    } catch (err: any) {
      console.warn('Network notice when loading featured doctors, using local directory:', err?.message);
      // Retain fallback doctors so user experience is smooth and uninterrupted
      if (featuredDoctors.length === 0) {
        setFeaturedDoctors(fallbackDoctors.slice(0, 3));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Zero Hospital Waiting Room Queues</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Schedule Hospital Visits <span className="text-teal-600">Without Waiting</span> in Long Queues
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                SmartCare connects you directly with top hospital specialists. Browse live doctor availability schedules, choose your preferred time slot, and walk in right on time.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/doctors"
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-5 h-5" />
                  <span>Find Available Doctors</span>
                </Link>

                <Link
                  to={isAuthenticated ? '/schedule' : '/register'}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-xs transition-all hover:border-slate-300"
                >
                  <span>{isAuthenticated ? 'Book an Appointment' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg text-slate-700">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-teal-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Doctors</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">0 min</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Queue Waiting</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Online Booking</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100/90 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hospital Live Portal</p>
                      <h3 className="text-base font-bold text-slate-900">SmartCare Queue Bypass</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ● Live
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>1. Browse Specialists</span>
                    <span className="text-teal-600 font-bold">Done ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>2. Select Time Slot</span>
                    <span className="text-teal-600 font-bold">Done ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>3. Confirm Consultation</span>
                    <span className="text-teal-600 font-bold">Instant</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-600 text-white space-y-2 shadow-md shadow-teal-600/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-teal-100 font-bold">Confirmed Appointment</span>
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">Queue Pass #SC-809</span>
                  </div>
                  <p className="font-bold text-base">Dr. Sarah Johnson (Cardiologist)</p>
                  <p className="text-xs text-teal-100">Monday at 10:00 AM • Room 302</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600 mb-2">
            Why Patients Choose SmartCare
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed to Solve Hospital Inefficiencies
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Skip Physical Waiting Queues</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never waste half a day waiting in crowded hospital halls. Schedule in advance and arrive only when your doctor is ready for you.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Real-Time Doctor Availability</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access real-time schedules across all departments—Cardiology, Paediatrics, Neurology, Dermatology, General Medicine, and more.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Zero Double-Booking Guarantee</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our automated conflict engine guarantees that each time slot belongs strictly to one patient. Reschedule or cancel with 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600 mb-1">
              Medical Staff
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Hospital Specialists
            </h3>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-4 py-2 rounded-xl transition-colors w-fit"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-slate-600">Failed to load featured doctors.</p>
            <button
              type="button"
              onClick={fetchFeatured}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Retry Loading Doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-2">
            Simple Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How SmartCare Works in 3 Easy Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h4 className="text-lg font-bold text-white">Find Your Doctor</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Filter by specialty, qualifications, or department to find the exact healthcare professional you need.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h4 className="text-lg font-bold text-white">Pick Date & Time</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              View live available working hours and select a 30-minute consultation slot that fits your schedule.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h4 className="text-lg font-bold text-white">Walk In & Be Seen</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive your confirmed reservation code and walk right into your consultation without waiting in line.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
