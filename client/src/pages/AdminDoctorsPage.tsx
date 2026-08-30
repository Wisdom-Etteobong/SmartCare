import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Building,
  Award,
  Calendar,
  Lock,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  KeyRound,
  RefreshCw,
  PlusCircle,
  X,
  Save,
  AlertCircle,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { IDoctor, DayOfWeek } from '../../../package/src/types/doctor';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatNaira } from '../utils/currency';

const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Oncology',
  'Gastroenterology',
];

export const AdminDoctorsPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // New Doctor Modal
  const [isNewDoctorModalOpen, setIsNewDoctorModalOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    email: '',
    password: 'Doctor2026!',
    specialty: 'Cardiologist',
    department: 'Cardiology',
    qualifications: 'MD, FACC',
    yearsOfExperience: 10,
    consultationFee: 25000,
    phone: '+1 (555) 234-5678',
    roomNumber: 'Suite 302',
    biography: 'Experienced medical practitioner committed to clinical excellence and patient-centered healthcare.',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  });

  // Edit Doctor Modal
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null);
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, usersRes] = await Promise.all([
        api.get('/doctors?includeInactive=true'),
        api.get('/auth/admin/users?role=doctor').catch(() => ({ data: { data: { users: [] } } })),
      ]);

      setDoctors(docRes.data?.data?.doctors || []);
      setUsers(usersRes.data?.data?.users || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch doctor roster');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorForm.name || !newDoctorForm.email || !newDoctorForm.password) {
      error('Please fill in doctor name, login email, and initial password');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const defaultAvailability = [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Friday', startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30 },
      ];

      await api.post('/doctors', {
        doctor: {
          name: newDoctorForm.name.startsWith('Dr.') ? newDoctorForm.name : `Dr. ${newDoctorForm.name}`,
          email: newDoctorForm.email,
          specialty: newDoctorForm.specialty,
          department: newDoctorForm.department,
          qualifications: newDoctorForm.qualifications.split(',').map(q => q.trim()),
          yearsOfExperience: Number(newDoctorForm.yearsOfExperience),
          consultationFee: Number(newDoctorForm.consultationFee),
          phone: newDoctorForm.phone,
          roomNumber: newDoctorForm.roomNumber,
          biography: newDoctorForm.biography,
          profileImage: newDoctorForm.profileImage,
          availability: defaultAvailability,
          languages: ['English', 'Spanish'],
          isActive: true,
        },
        credentials: {
          email: newDoctorForm.email,
          password: newDoctorForm.password,
        },
      });

      success(`Doctor profile and login credentials for ${newDoctorForm.name} provisioned!`);
      setIsNewDoctorModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      error(err.message || 'Failed to create doctor account');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    setIsEditingSaving(true);
    try {
      await api.patch(`/doctors/${editingDoctor._id}`, {
        name: editingDoctor.name,
        specialty: editingDoctor.specialty,
        department: editingDoctor.department,
        yearsOfExperience: Number(editingDoctor.yearsOfExperience),
        consultationFee: Number(editingDoctor.consultationFee),
        phone: editingDoctor.phone,
        roomNumber: editingDoctor.roomNumber,
        biography: editingDoctor.biography,
        isActive: editingDoctor.isActive,
      });

      success('Doctor profile updated successfully');
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err: any) {
      error(err.message || 'Failed to update doctor profile');
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleToggleActive = async (doctor: IDoctor) => {
    try {
      const nextState = !doctor.isActive;
      await api.patch(`/doctors/${doctor._id}`, { isActive: nextState });
      setDoctors(prev =>
        prev.map(d => (d._id === doctor._id ? { ...d, isActive: nextState } : d))
      );
      success(`${doctor.name} is now ${nextState ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      error(err.message || 'Failed to toggle doctor status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    setIsResetting(true);
    try {
      await api.post('/auth/admin/reset-password', {
        userId: resetModalUser.id,
        newPassword: newPassword.trim(),
      });
      success(`Password for ${resetModalUser.name} has been updated`);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDepartment === 'All' || doc.department.toLowerCase() === selectedDepartment.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      doc.name.toLowerCase().includes(query) ||
      doc.specialty.toLowerCase().includes(query) ||
      doc.department.toLowerCase().includes(query) ||
      (doc.email && doc.email.toLowerCase().includes(query));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Practitioner & Doctor Account Governance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium">
              Manage authorized medical staff, control clinical portal access, provision new practitioner credentials, and supervise hospital departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDoctors()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-all border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              id="btn-provision-doctor"
              onClick={() => setIsNewDoctorModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Provision New Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Restricted Access Control Policy</p>
          <p>
            Public user registration is strictly locked to ordinary patient accounts. Doctors and clinical staff accounts cannot be registered publicly; they are exclusively provisioned and managed by system administrators to maintain regulatory compliance and credential verification.
          </p>
        </div>
      </div>

      {/* Main Roster Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Registered Medical Practitioners ({doctors.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Authorized clinical accounts with Doctor Portal access permissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, specialty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Grid / List */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner message="Loading doctor roster..." />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No doctors match your query</h3>
            <p className="text-xs text-slate-400">Try adjusting your department or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDoctors.map(doctor => {
              const matchedUser = users.find(u => u.doctorId === doctor._id || u.email === doctor.email);
              const isActive = doctor.isActive !== false;

              return (
                <div
                  key={doctor._id}
                  className="p-5 sm:p-6 transition-colors hover:bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={doctor.profileImage}
                      alt={doctor.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                    />

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-black text-slate-900">{doctor.name}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isActive ? 'Active Staff' : 'Suspended / Inactive'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-100">
                          {doctor.department}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-teal-700">{doctor.specialty}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        {doctor.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <strong>Login:</strong> {doctor.email}
                          </span>
                        )}
                        {doctor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {doctor.phone}
                          </span>
                        )}
                        <span>
                          <strong>Experience:</strong> {doctor.yearsOfExperience} yrs
                        </span>
                        <span>
                          <strong>Fee:</strong> {formatNaira(doctor.consultationFee)}
                        </span>
                        {doctor.roomNumber && (
                          <span>
                            <strong>Location:</strong> {doctor.roomNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => setEditingDoctor(doctor)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    {matchedUser && (
                      <button
                        onClick={() =>
                          setResetModalUser({
                            id: matchedUser._id,
                            name: doctor.name,
                            email: matchedUser.email,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200/80 transition-colors cursor-pointer"
                        title="Reset doctor portal password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset Auth</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(doctor)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provision New Doctor Modal */}
      {isNewDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Provision New Medical Practitioner
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Creates an authorized doctor profile and portal credentials.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewDoctorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Doctor Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alexander Wright"
                    value={newDoctorForm.name}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Portal Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dr.wright@smartcare.io"
                    value={newDoctorForm.email}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Initial Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorForm.password}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDoctorForm.department}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Clinical Specialty
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interventional Cardiologist"
                    value={newDoctorForm.specialty}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newDoctorForm.yearsOfExperience}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Consultation Fee (₦)
                  </label>
                  <input
                    type="number"
                    min={10000}
                    step={1000}
                    value={newDoctorForm.consultationFee}
                    onChange={e => setNewDoctorForm(prev => ({ ...prev, consultationFee: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Professional Biography
                </label>
                <textarea
                  rows={3}
                  value={newDoctorForm.biography}
                  onChange={e => setNewDoctorForm(prev => ({ ...prev, biography: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewDoctorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmittingNew ? 'Provisioning Account...' : 'Provision Doctor Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-base font-black text-slate-900">
                Edit Profile: {editingDoctor.name}
              </h3>
              <button
                onClick={() => setEditingDoctor(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name}
                  onChange={e => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.specialty}
                    onChange={e => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={editingDoctor.department}
                    onChange={e => setEditingDoctor({ ...editingDoctor, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Consultation Fee (₦)
                  </label>
                  <input
                    type="number"
                    min={10000}
                    step={1000}
                    value={editingDoctor.consultationFee}
                    onChange={e => setEditingDoctor({ ...editingDoctor, consultationFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Room / Clinic Suite
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.roomNumber || ''}
                    onChange={e => setEditingDoctor({ ...editingDoctor, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={editingDoctor.biography}
                  onChange={e => setEditingDoctor({ ...editingDoctor, biography: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-medium text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditingSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Reset Credentials</h3>
                  <p className="text-xs text-slate-500">{resetModalUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Doctor Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-800 outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isResetting ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorsPage;
