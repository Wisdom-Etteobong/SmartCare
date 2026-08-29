import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { HeartPulse, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Hospital Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Smart<span className="text-teal-400">Care</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                SmartCare eliminates crowded waiting rooms and long queues by connecting patients with board-certified hospital doctors through seamless real-time scheduling.
              </p>
              <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-950/60 border border-teal-800/50 p-2.5 rounded-xl w-fit">
                <ShieldCheck className="w-4 h-4" />
                HIPAA & Data Protection Compliant
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                Quick Navigation
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="hover:text-teal-400 transition-colors">
                    Home & Overview
                  </Link>
                </li>
                <li>
                  <Link to="/doctors" className="hover:text-teal-400 transition-colors">
                    Find Available Doctors
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-teal-400 transition-colors">
                    About SmartCare
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-teal-400 transition-colors">
                    Patient Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-teal-400 transition-colors">
                    Register New Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Specialties */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                Medical Specialties
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>Cardiology & Heart Care</li>
                <li>General Family Medicine</li>
                <li>Paediatrics & Child Health</li>
                <li>Dermatology & Skin Care</li>
                <li>Neurology & Brain Sciences</li>
                <li>Orthopaedics & Sports Injury</li>
              </ul>
            </div>

            {/* Column 4: Hospital Contact & Emergency */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                Hospital Helpdesk
              </h4>
              <div className="flex items-start gap-3 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>450 Medical Center Boulevard, Health Sciences District</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+1 (800) 555-CARE (2273)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@smartcare.hospital.org</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>OPD: Mon - Sat (8:00 AM - 6:00 PM)</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} SmartCare Hospital Appointment Management System. All rights reserved.</p>
            <p className="flex items-center gap-4">
              <span>Emergency Helpline: 911</span>
              <span>•</span>
              <span>Patient Privacy Policy</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
