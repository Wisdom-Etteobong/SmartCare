import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Award,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowLeft,
  CalendarPlus,
  Lock,
  ArrowRight,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { IDoctor } from '../../../package/src/types/doctor';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { fallbackDoctors } from '../data/fallbackDoctors';

export const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<IDoctor | null>(() => fallbackDoctors.find(d => d._id === id) || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const isRoleAdmin = user?.role === 'admin';
  const isRoleDoctor = user?.role === 'doctor';

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data?.data?.doctor) {
          setDoctor(res.data.data.doctor);
        }
      } catch (err) {
        console.warn('Using local doctor profile fallback:', err);
        const match = fallbackDoctors.find(d => d._id === id);
        if (match) {
          setDoctor(match);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const handleBookClick = () => {
    if (isRoleAdmin) {
      navigate('/admin/doctors');
      return;
    }
    if (isRoleDoctor) {
      navigate('/doctor/schedule');
      return;
    }
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    navigate(`/schedule?doctorId=${doctor?._id}`);
  };

  const handleProceedToLogin = () => {
    setAuthPromptOpen(false);
    navigate('/login', {
      state: {
        from: { pathname: '/schedule', search: `?doctorId=${doctor?._id}` },
        message: `Please log in to complete your appointment booking with ${doctor?.name}.`,
      },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading doctor profile details..." />;
  }

  if (!doctor) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-500">
          The specialist you are looking for may have been updated or does not exist.
        </p>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctors Directory</span>
        </Link>
      </div>

      {/* Main Doctor Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Doctor Portrait */}
          <div className="md:col-span-4 flex flex-col items-center sm:items-start space-y-4">
            <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                Verified
              </span>
            </div>

            <div className="w-full text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Consultation Fee
              </span>
              <p className="text-2xl font-black text-slate-900">
                ${doctor.consultationFee || 50}
                <span className="text-xs font-normal text-slate-400"> / session</span>
              </p>
            </div>

            <button
              id="book-doctor-details-btn"
              onClick={handleBookClick}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base transition-all hover:scale-[1.02] cursor-pointer ${
                isRoleAdmin
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
              }`}
            >
              <CalendarPlus className="w-5 h-5" />
              <span>{isRoleAdmin ? 'Manage in Admin Console' : isRoleDoctor ? 'View My Schedule' : 'Book Appointment'}</span>
            </button>
          </div>

          {/* Doctor Info */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                {doctor.specialty}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {doctor.name}
              </h1>
              <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{doctor.department}</span>
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Experience</span>
                <span className="text-base font-extrabold text-slate-900">{doctor.yearsOfExperience} Years</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Patient Rating</span>
                <span className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500 inline" />
                  {doctor.rating || 4.9} ({doctor.reviewCount || 40})
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Queue Bypass</span>
                <span className="text-base font-extrabold text-teal-600">Active</span>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                About the Doctor
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {doctor.biography}
              </p>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Education & Board Certifications</span>
              </h3>
              <ul className="space-y-1.5">
                {doctor.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consultation Instructions */}
            {doctor.consultationInformation && (
              <div className="p-4 bg-teal-50/60 border border-teal-200/70 rounded-2xl space-y-1 text-xs text-teal-900">
                <span className="font-bold flex items-center gap-1.5 text-teal-800">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Patient Instructions for Consultation
                </span>
                <p className="text-teal-800/90 leading-relaxed">
                  {doctor.consultationInformation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Availability Schedule Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Weekly Outpatient Consultation Schedule</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients can choose exact 30-minute time slots during these operating hours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {doctor.availability.map((sched, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">{sched.day}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>
                  <strong className="text-slate-700">Hours:</strong> {sched.startTime} – {sched.endTime}
                </p>
                {sched.breakStartTime && sched.breakEndTime && (
                  <p className="text-slate-400">
                    Break: {sched.breakStartTime} – {sched.breakEndTime}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Authentication Prompt Modal */}
      <Modal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Authentication Required"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Sign in to book with {doctor.name}
            </h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              To reserve your verified time slot and avoid hospital waiting lines, please sign in or register your SmartCare patient account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleProceedToLogin}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-sm shadow-teal-600/20 transition-all"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAuthPromptOpen(false);
                navigate('/register', {
                  state: { from: { pathname: '/schedule', search: `?doctorId=${doctor._id}` } },
                });
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
