import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  Stethoscope,
  Pill,
  CalendarCheck,
  Users,
  Activity,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Save,
  Check,
  X,
  PlusCircle,
  Building,
  ArrowRightLeft,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IAppointment, AppointmentStatus } from '../../../package/src/types/appointment';
import { IDoctor } from '../../../package/src/types/doctor';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<IDoctor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected appointment for Clinical Notes Modal
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
  const [clinicalForm, setClinicalForm] = useState({
    status: 'Confirmed' as AppointmentStatus,
    diagnosis: '',
    prescription: '',
    doctorNotes: '',
    followUpDate: '',
    cancellationReason: '',
  });

  // Transfer Modal State
  const [transferModalApt, setTransferModalApt] = useState<IAppointment | null>(null);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const doctorProfile = user?.doctorProfile;
  const doctorName = doctorProfile?.name || user?.name || 'Doctor';
  const specialty = doctorProfile?.specialty || 'General Physician';
  const department = doctorProfile?.department || (user as any)?.department || 'Medical Care';
  const currentDoctorId = doctorProfile?._id || (user as any)?._id || (user as any)?.id || '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apptsRes, statsRes, docsRes] = await Promise.all([
        api.get('/appointments/doctor', {
          params: {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            date: dateFilter || undefined,
            search: searchQuery || undefined,
          },
        }),
        api.get('/appointments/doctor/stats'),
        api.get('/doctors'),
      ]);

      setAppointments(apptsRes.data?.data?.appointments || []);
      setStats(statsRes.data?.data?.stats || null);
      if (docsRes.data?.data?.doctors) {
        setAvailableDoctors(docsRes.data.data.doctors);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load doctor appointments');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Clinical Records Modal
  const openClinicalModal = (apt: IAppointment) => {
    setSelectedAppointment(apt);
    setClinicalForm({
      status: apt.status,
      diagnosis: apt.diagnosis || '',
      prescription: apt.prescription || '',
      doctorNotes: apt.doctorNotes || '',
      followUpDate: apt.followUpDate || '',
      cancellationReason: apt.cancellationReason || '',
    });
  };

  const closeClinicalModal = () => {
    setSelectedAppointment(null);
  };

  // Open Patient Transfer Modal
  const openTransferModal = (apt: IAppointment) => {
    setTransferModalApt(apt);
    setTransferReason('');
    setTransferNotes('');
    // Default to first colleague in same department
    const sameDeptDoc = availableDoctors.find(
      d => d._id !== currentDoctorId && d.department === department
    );
    const anyOtherDoc = availableDoctors.find(d => d._id !== currentDoctorId);
    setTargetDoctorId(sameDeptDoc?._id || anyOtherDoc?._id || '');
  };

  const closeTransferModal = () => {
    setTransferModalApt(null);
    setTransferReason('');
    setTransferNotes('');
  };

  // Execute Patient Transfer
  const handleTransferPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalApt || !targetDoctorId) {
      error('Please select a target doctor for the transfer');
      return;
    }
    if (!transferReason.trim()) {
      error('Please enter a clinical reason for the patient transfer');
      return;
    }

    setIsTransferring(true);
    try {
      const res = await api.post(`/appointments/${transferModalApt._id}/transfer`, {
        targetDoctorId,
        reason: transferReason.trim(),
        notes: transferNotes.trim(),
      });

      success(res.data?.message || 'Patient transferred successfully to colleague!');
      closeTransferModal();
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to transfer patient');
    } finally {
      setIsTransferring(false);
    }
  };

  // Save Clinical Notes & Status
  const handleSaveClinicalNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const res = await api.patch(`/appointments/doctor/${selectedAppointment._id}`, clinicalForm);
      const updated = res.data?.data?.appointment;

      // Update local state
      setAppointments(prev =>
        prev.map(a => (a._id === selectedAppointment._id ? { ...a, ...updated } : a))
      );

      success('Clinical documentation & status updated successfully!');
      closeClinicalModal();
      // Refresh stats
      const statsRes = await api.get('/appointments/doctor/stats');
      setStats(statsRes.data?.data?.stats || null);
    } catch (err: any) {
      error(err.message || 'Failed to update clinical records');
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await api.patch(`/appointments/doctor/${appointmentId}`, { status: newStatus });

      setAppointments(prev =>
        prev.map(a => (a._id === appointmentId ? { ...a, status: newStatus } : a))
      );
      success(`Appointment marked as ${newStatus}`);

      // Refresh stats
      const statsRes = await api.get('/appointments/doctor/stats');
      setStats(statsRes.data?.data?.stats || null);
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CalendarCheck className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Filter colleagues in same department for quick selection in transfer modal
  const colleaguesInDepartment = availableDoctors.filter(
    d => d._id !== currentDoctorId && d.department === department
  );
  const otherColleagues = availableDoctors.filter(
    d => d._id !== currentDoctorId && d.department !== department
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>SmartCare Practitioner Clinical Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, Dr. {doctorName.replace(/^Dr\.\s*/i, '')}
            </h1>
            <p className="text-sm text-teal-100/80 max-w-2xl font-medium">
              {specialty} &bull; {department} &bull; Manage assigned patients, record diagnoses & prescriptions, and transfer patients to medical colleagues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-all border border-white/10 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Feed
            </button>
            <Link
              to="/doctor/schedule"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 text-xs font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              <Clock className="w-4 h-4" />
              My Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Schedule</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.todayCount ?? 0}</span>
            <span className="text-xs font-semibold text-slate-500">Patients</span>
          </div>
          <p className="text-xs text-slate-500">
            {stats?.todayCompleted ?? 0} completed so far today
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{stats?.pendingCount ?? 0}</span>
            <span className="text-xs font-semibold text-slate-500">Awaiting action</span>
          </div>
          <p className="text-xs text-amber-700/80">Requires confirmation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats?.confirmedCount ?? 0}</span>
            <span className="text-xs font-semibold text-slate-500">Upcoming</span>
          </div>
          <p className="text-xs text-emerald-700/80">Ready for consultation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Consulted</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.completedCount ?? 0}</span>
            <span className="text-xs font-semibold text-slate-500">Completed</span>
          </div>
          <p className="text-xs text-slate-500">
            {stats?.totalPatients ?? 0} unique patients served
          </p>
        </div>
      </div>

      {/* Main Appointment Feed Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Filter / Search Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Assigned Patient Consultations
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage clinical documentation, mark consultations completed, or transfer patients to colleagues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                title="Clear date filter"
              >
                Clear date
              </button>
            )}

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment List / Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner message="Loading assigned consultations..." />
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no appointments matching your current filter criteria. New patient bookings or transferred patients will appear here.
            </p>
            {(statusFilter !== 'All' || dateFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setDateFilter('');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map(apt => {
              const patient = apt.patient as any;
              const isToday = apt.date === todayStr;
              const isTransferred = !!apt.transferredFrom;

              return (
                <div
                  key={apt._id}
                  className={`p-5 sm:p-6 transition-colors hover:bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isToday ? 'bg-teal-50/20' : ''
                  }`}
                >
                  {/* Left Patient & Appointment Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                        {patient?.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900">
                            {patient?.name || 'Patient'}
                          </span>
                          {getStatusBadge(apt.status)}
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-teal-100 text-teal-800 tracking-wider">
                              Today
                            </span>
                          )}
                          {isTransferred && (
                            <span
                              title={`Transferred by ${(apt.transferredFrom as any)?.name || 'Colleague'}`}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Transferred from {(apt.transferredFrom as any)?.name || 'Colleague'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                          {patient?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {patient.email}
                            </span>
                          )}
                          {patient?.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {patient.phoneNumber}
                            </span>
                          )}
                          {patient?.gender && (
                            <span>Gender: <strong className="text-slate-700">{patient.gender}</strong></span>
                          )}
                          {patient?.bloodGroup && (
                            <span className="text-rose-600 font-bold">Blood: {patient.bloodGroup}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reason & Clinical Notes Preview */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">Chief Complaint / Reason: </span>
                        <span className="text-slate-600">{apt.reason || 'Routine consultation'}</span>
                      </div>
                      {apt.transferReason && (
                        <div className="text-purple-900 bg-purple-50/90 p-2 rounded-xl border border-purple-100">
                          <strong className="font-bold text-purple-800">Transfer Reason: </strong>
                          <span>{apt.transferReason}</span>
                        </div>
                      )}
                      {apt.symptoms && apt.symptoms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-700">Reported Symptoms: </span>
                          {apt.symptoms.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {apt.diagnosis && (
                        <div className="text-teal-900 bg-teal-50/80 p-2 rounded-xl border border-teal-100">
                          <strong className="font-bold text-teal-800">Diagnosis: </strong>
                          <span>{apt.diagnosis}</span>
                        </div>
                      )}
                      {apt.prescription && (
                        <div className="text-slate-800 bg-blue-50/60 p-2 rounded-xl border border-blue-100 flex items-start gap-2">
                          <Pill className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-blue-900">Prescription: </strong>
                            <span>{apt.prescription}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Timing & Action Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                    <div className="text-left sm:text-right space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.time}</span>
                      </div>
                      <span className="inline-block text-[11px] font-semibold text-slate-400">
                        Queue Token: <strong className="text-slate-700">{apt.queueToken || `#${apt._id.slice(-4)}`}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Clinical Records & Prescription Button */}
                      <button
                        id={`btn-clinical-${apt._id}`}
                        onClick={() => openClinicalModal(apt)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200/80 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Notes & Rx</span>
                      </button>

                      {/* Transfer Patient to Colleague Button */}
                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                        <button
                          id={`btn-transfer-${apt._id}`}
                          onClick={() => openTransferModal(apt)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200/80 transition-colors cursor-pointer"
                          title="Transfer patient to another specialist in the hospital"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Transfer</span>
                        </button>
                      )}

                      {/* Quick Status Buttons */}
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleQuickStatusChange(apt._id, 'Confirmed')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="Confirm appointment"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => handleQuickStatusChange(apt._id, 'Completed')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="Mark Consultation Complete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}

                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleQuickStatusChange(apt._id, 'Cancelled')}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Cancel appointment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient Transfer Modal */}
      {transferModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Transfer Patient to Colleague
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Patient: <strong className="text-slate-800">{(transferModalApt.patient as any)?.name || 'Patient'}</strong> &bull; {transferModalApt.date} at {transferModalApt.time}
                  </p>
                </div>
              </div>

              <button
                onClick={closeTransferModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferPatient} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-900 space-y-1">
                <p className="font-bold">Inter-departmental & Specialist Reassignment</p>
                <p className="text-purple-700 leading-relaxed">
                  Transferring this appointment will reassign the patient queue to the selected colleague. Both the receiving doctor and the patient will receive real-time notifications.
                </p>
              </div>

              {/* Target Doctor Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Receiving Medical Specialist <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={targetDoctorId}
                  onChange={e => setTargetDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 text-sm font-semibold text-slate-800 outline-hidden"
                >
                  <option value="" disabled>Select a doctor...</option>
                  {colleaguesInDepartment.length > 0 && (
                    <optgroup label={`Same Department (${department})`}>
                      {colleaguesInDepartment.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.name} — {d.specialty}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherColleagues.length > 0 && (
                    <optgroup label="Other Hospital Departments">
                      {otherColleagues.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.name} — {d.specialty} ({d.department})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Transfer Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinical Reason for Transfer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requires specialized surgical cardiology evaluation, Second opinion"
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 text-sm font-semibold text-slate-800 outline-hidden"
                />
              </div>

              {/* Clinical Handoff Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Handoff Observations & Notes for Colleague (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief notes on patient history, findings during initial triage, or specific concerns for the receiving doctor..."
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring || !targetDoctorId || !transferReason.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isTransferring ? 'Transferring Patient...' : 'Transfer Patient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Notes & Prescription Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Clinical Encounter Documentation
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Patient: <strong className="text-slate-800">{(selectedAppointment.patient as any)?.name || 'Patient'}</strong> &bull; {selectedAppointment.date} at {selectedAppointment.time}
                  </p>
                </div>
              </div>

              <button
                onClick={closeClinicalModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveClinicalNotes} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Patient Quick Vitals / Info Summary */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block font-semibold">Gender</span>
                  <span className="font-bold">{(selectedAppointment.patient as any)?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Blood Group</span>
                  <span className="font-bold text-rose-600">{(selectedAppointment.patient as any)?.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Allergies</span>
                  <span className="font-bold">
                    {(selectedAppointment.patient as any)?.allergies?.join(', ') || 'None declared'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Queue Pass</span>
                  <span className="font-bold text-teal-800">{selectedAppointment.queueToken || `#${selectedAppointment._id.slice(-4)}`}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Encounter Status
                </label>
                <select
                  value={clinicalForm.status}
                  onChange={e =>
                    setClinicalForm(prev => ({
                      ...prev,
                      status: e.target.value as AppointmentStatus,
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                >
                  <option value="Confirmed">Confirmed (Scheduled)</option>
                  <option value="Completed">Completed (Consultation Concluded)</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Pharyngitis with mild dehydration"
                  value={clinicalForm.diagnosis}
                  onChange={e =>
                    setClinicalForm(prev => ({ ...prev, diagnosis: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                />
              </div>

              {/* Prescription / Medications */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prescription & Medication Orders
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Amoxicillin 500mg (1 tablet 3x daily for 7 days), Paracetamol 500mg (as needed for fever)"
                  value={clinicalForm.prescription}
                  onChange={e =>
                    setClinicalForm(prev => ({ ...prev, prescription: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              {/* Doctor Clinical Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Doctor Clinical Observations & Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Document physical examination findings, treatment plans, lab tests ordered, lifestyle advice, etc."
                  value={clinicalForm.doctorNotes}
                  onChange={e =>
                    setClinicalForm(prev => ({ ...prev, doctorNotes: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              {/* Follow-Up Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Recommended Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={clinicalForm.followUpDate}
                    onChange={e =>
                      setClinicalForm(prev => ({ ...prev, followUpDate: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>

                {clinicalForm.status === 'Cancelled' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                      Cancellation Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for cancellation"
                      value={clinicalForm.cancellationReason}
                      onChange={e =>
                        setClinicalForm(prev => ({
                          ...prev,
                          cancellationReason: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-medium text-rose-800 outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeClinicalModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Saving Records...' : 'Save & Update Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;
