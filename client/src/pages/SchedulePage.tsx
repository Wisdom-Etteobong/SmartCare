import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { IDoctor, DoctorAvailabilityResponse } from '../../../package/src/types/doctor';
import { IAppointment, AppointmentType } from '../../../package/src/types/appointment';
import { APPOINTMENT_TYPES } from '../../../package/src/constants/appointment';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { fallbackDoctors } from '../data/fallbackDoctors';

export const SchedulePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  // Form states
  const [doctors, setDoctors] = useState<IDoctor[]>(() => fallbackDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctorId);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('In-Person Consultation');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Async states
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [availability, setAvailability] = useState<DoctorAvailabilityResponse | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Success state
  const [confirmedAppointment, setConfirmedAppointment] = useState<IAppointment | null>(null);

  // Step 1 -> 2 -> 3 -> 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data?.data?.doctors && res.data.data.doctors.length > 0) {
          setDoctors(res.data.data.doctors);
        }
      } catch (err) {
        console.warn('Using local doctors directory fallback in SchedulePage:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Set default date to tomorrow or today
  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  // If doctorId in query param, auto advance to step 2
  useEffect(() => {
    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
      setCurrentStep(2);
    }
  }, [preselectedDoctorId]);

  // Fetch slots whenever selectedDoctorId or selectedDate changes
  const fetchAvailability = useCallback(async () => {
    if (!selectedDoctorId || !selectedDate) return;
    setLoadingAvailability(true);
    setSelectedTime('');
    try {
      const res = await api.get(`/doctors/${selectedDoctorId}/availability?date=${selectedDate}`);
      setAvailability(res.data.data);
    } catch (err: any) {
      error(err.message || 'Failed to check doctor availability for this date');
      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  }, [selectedDoctorId, selectedDate, error]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchAvailability();
    }
  }, [selectedDoctorId, selectedDate, fetchAvailability]);

  const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim()) {
      error('Please complete all required fields before confirming.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/appointments', {
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: reason.trim(),
        notes: notes.trim(),
      });

      const newApt = res.data.data.appointment;
      setConfirmedAppointment(newApt);
      success('Appointment successfully scheduled!');
    } catch (err: any) {
      error(err.message || 'Failed to schedule appointment. Please choose another time slot.');
      // Refresh slots in case of collision
      fetchAvailability();
    } finally {
      setSubmitting(false);
    }
  };

  // If confirmed, render Section 39 Appointment Confirmation screen
  if (confirmedAppointment) {
    const doc = typeof confirmedAppointment.doctor === 'object' ? (confirmedAppointment.doctor as any) : selectedDoctor;
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-md p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Queue Bypass Pass Issued
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Appointment Successfully Scheduled
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Your hospital consultation slot has been reserved. Please arrive 15 minutes before your scheduled time.
            </p>
          </div>

          {/* Appointment Ticket Details */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Reference Code</span>
              <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                SC-{confirmedAppointment._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Specialist</span>
                <p className="font-bold text-slate-900">{doc?.name || 'Assigned Doctor'}</p>
                <p className="text-xs text-teal-600 font-semibold">{doc?.specialty}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Department</span>
                <p className="font-bold text-slate-900">{doc?.department || 'Outpatient'}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Scheduled Date</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  {confirmedAppointment.date}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Scheduled Time</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {confirmedAppointment.time}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-400 font-medium block">Reason for Consultation</span>
              <p className="font-medium text-slate-800 mt-0.5">{confirmedAppointment.reason}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/appointments/${confirmedAppointment._id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all"
            >
              <span>View Full Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Schedule Hospital Appointment
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select a specialist, choose an available date, and lock in your queue bypass consultation.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setCurrentStep(1)}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            currentStep === 1
              ? 'bg-teal-600 text-white shadow-xs'
              : selectedDoctorId
              ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
              : 'text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">1</span>
          <span className="truncate">Select Doctor</span>
        </button>

        <button
          onClick={() => selectedDoctorId && setCurrentStep(2)}
          disabled={!selectedDoctorId}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            currentStep === 2
              ? 'bg-teal-600 text-white shadow-xs'
              : selectedDate && selectedTime
              ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
              : 'text-slate-400 opacity-60'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">2</span>
          <span className="truncate">Date & Time</span>
        </button>

        <button
          onClick={() => selectedDoctorId && selectedDate && selectedTime && setCurrentStep(3)}
          disabled={!selectedDoctorId || !selectedDate || !selectedTime}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            currentStep === 3
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-400 opacity-60'
          }`}
        >
          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">3</span>
          <span className="truncate">Reason & Review</span>
        </button>
      </div>

      {/* STEP 1: Select Doctor */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 1: Choose Your Doctor / Specialist</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the specialist you wish to consult with.
            </p>
          </div>

          {loadingDoctors ? (
            <LoadingSpinner message="Loading hospital doctors..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map(doc => {
                const isSelected = selectedDoctorId === doc._id;
                return (
                  <div
                    key={doc._id}
                    onClick={() => {
                      setSelectedDoctorId(doc._id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={doc.profileImage}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
                        {doc.specialty}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{doc.department}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="font-semibold text-slate-700">${doc.consultationFee || 50} / visit</span>
                        <span className="text-teal-700 font-bold text-[11px]">
                          {doc.availability.length} active days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              id="step1-next-btn"
              type="button"
              disabled={!selectedDoctorId}
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-40"
            >
              <span>Continue to Date & Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Date & Available Time */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Selected Doctor summary bar */}
          {selectedDoctor && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.profileImage}
                  alt={selectedDoctor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">{selectedDoctor.specialty}</p>
                  <h4 className="text-sm font-bold text-slate-900">{selectedDoctor.name}</h4>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Change Doctor
              </button>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Appointment Date
            </label>
            <input
              id="schedule-date-picker"
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-slate-800 outline-hidden"
            />
          </div>

          {/* Dynamic Available Time Slots */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Available Time Slot
            </label>

            {loadingAvailability ? (
              <LoadingSpinner size="sm" message="Fetching live doctor schedule and checking booked slots..." />
            ) : !availability?.isWorkingDay ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Doctor is not available on {availability?.dayOfWeek || 'selected day'}</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {selectedDoctor?.name} does not have outpatient hours scheduled for this day of the week. Please select a different date.
                  </p>
                </div>
              </div>
            ) : availability.slots.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-sm">
                No slots configured for this date.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {availability.slots.map(slot => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        id={`slot-${slot.time.replace(/[:\s]/g, '-')}`}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-102 font-extrabold'
                            : slot.isAvailable
                            ? 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/60'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-teal-600" />
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-200 line-through" />
                    Booked / Unavailable
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="step2-next-btn"
              type="button"
              disabled={!selectedTime || !availability?.isWorkingDay}
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-40"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Reason, Consultation Type & Final Review */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 3: Reason for Visit & Final Confirmation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide consultation details to help your specialist prepare.
            </p>
          </div>

          {/* Consultation Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Consultation Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {APPOINTMENT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAppointmentType(type)}
                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                    appointmentType === type
                      ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500/30'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{type}</span>
                  {appointmentType === type && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for visit input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Consultation <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="appointment-reason-textarea"
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Chest tightness during morning exercise, routine blood pressure checkup, prescription renewal..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Notes / Requests (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Wheelchair assistance required, bring previous ECG reports"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-800 outline-hidden"
            />
          </div>

          {/* Review Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Appointment Summary Review
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Doctor</span>
                <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Specialty</span>
                <span className="font-bold text-slate-900">{selectedDoctor?.specialty}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Date</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Time</span>
                <span className="font-bold text-teal-600">{selectedTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Estimated Hospital Fee:</span>
              <span className="text-sm text-slate-900 font-black">${selectedDoctor?.consultationFee || 50}</span>
            </div>
          </div>

          {/* Final Submission Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="submit-appointment-btn"
              type="button"
              disabled={submitting || !reason.trim()}
              onClick={handleConfirmBooking}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] disabled:opacity-40"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>{submitting ? 'Confirming Reservation...' : 'Confirm & Schedule Appointment'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
