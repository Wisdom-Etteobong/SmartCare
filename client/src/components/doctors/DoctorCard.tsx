import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Award,
  Clock,
  Calendar,
  Building2,
  ChevronRight,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { IDoctor } from '../../../../package/src/types/doctor';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface DoctorCardProps {
  doctor: IDoctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const isRoleAdmin = user?.role === 'admin';
  const isRoleDoctor = user?.role === 'doctor';

  const handleBookClick = () => {
    if (isRoleAdmin) {
      navigate('/admin/doctors');
      return;
    }
    if (isRoleDoctor) {
      navigate(`/doctors/${doctor._id}`);
      return;
    }
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    navigate(`/schedule?doctorId=${doctor._id}`);
  };

  const handleProceedToLogin = () => {
    setAuthPromptOpen(false);
    navigate('/login', {
      state: {
        from: { pathname: '/schedule', search: `?doctorId=${doctor._id}` },
        message: `Please log in to complete your appointment booking with ${doctor.name}.`,
      },
    });
  };

  const handleProceedToRegister = () => {
    setAuthPromptOpen(false);
    navigate('/register', {
      state: {
        from: { pathname: '/schedule', search: `?doctorId=${doctor._id}` },
      },
    });
  };

  const workingDays = doctor.availability.map(a => a.day.substring(0, 3)).join(', ');

  return (
    <>
      <div
        id={`doctor-card-${doctor._id}`}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group hover:border-teal-300/80"
      >
        {/* Card Header & Doctor Avatar */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                referrerPolicy="no-referrer"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-102 transition-transform duration-200"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active on SmartCare" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider mb-0.5">
                <span>{doctor.specialty}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-snug group-hover:text-teal-700 transition-colors">
                {doctor.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.department}</span>
              </p>

              {/* Rating & Experience */}
              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{doctor.rating || 4.9}</span>
                  <span className="text-slate-400 text-[10px]">({doctor.reviewCount || 40})</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>{doctor.yearsOfExperience} yrs exp</span>
                </span>
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-4 leading-relaxed">
            {doctor.biography}
          </p>
        </div>

        {/* Schedule & Fee meta */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mt-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-medium">
              Available: <strong className="text-slate-800 font-bold">{workingDays}</strong>
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm">
            ${doctor.consultationFee || 50}
            <span className="text-[10px] text-slate-400 font-normal"> / visit</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-100 grid grid-cols-2 gap-2">
          <Link
            to={`/doctors/${doctor._id}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs sm:text-sm font-bold transition-colors text-center"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            id={`book-btn-${doctor._id}`}
            onClick={handleBookClick}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] cursor-pointer ${
              isRoleAdmin
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs shadow-amber-600/20'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isRoleAdmin ? 'Manage Doctor' : isRoleDoctor ? 'View Details' : 'Book Visit'}</span>
          </button>
        </div>
      </div>

      {/* Guest Authentication Prompt Modal */}
      <Modal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Authentication Required to Schedule"
      >
        <div className="space-y-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto sm:mx-0">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Sign in to book with {doctor.name}
            </h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              To protect your medical records and guarantee your reserved queue slot, you must be signed in with a SmartCare patient account.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-left">
            <img
              src={doctor.profileImage}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-bold text-slate-800">{doctor.name}</p>
              <p className="text-xs text-teal-600 font-semibold">{doctor.specialty} • {doctor.department}</p>
            </div>
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
              onClick={handleProceedToRegister}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
            >
              Create New Account
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
