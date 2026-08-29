import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { IAppointment } from '../../../package/src/types/appointment';
import { IDoctor } from '../../../package/src/types/doctor';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (doctorFilter !== 'all') params.doctorId = doctorFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (dateFilter) params.date = dateFilter;
      if (search.trim()) params.search = search.trim();

      const [aptsRes, docsRes] = await Promise.all([
        api.get('/appointments/admin/all', { params }),
        api.get('/doctors'),
      ]);

      if (aptsRes.data?.data?.appointments) {
        setAppointments(aptsRes.data.data.appointments);
      }
      if (docsRes.data?.data?.doctors) {
        setDoctors(docsRes.data.data.doctors);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, doctorFilter, departmentFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const departments = Array.from(new Set(doctors.map(d => d.department).filter(Boolean)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Master Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hospital Appointments Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ledger of all patient appointments booked across all hospital doctors and departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, doctor name, reason, or diagnosis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Doctor filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doctor</label>
            <select
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold outline-hidden"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold outline-hidden"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold outline-hidden text-xs"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading appointments ledger...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center text-slate-400 px-4">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No appointments match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try changing status, doctor, department, or date query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Assigned Doctor</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Reason / Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(apt => {
                  const patientObj: any = apt.patient;
                  const doctorObj: any = apt.doctor;
                  const isTransferred = !!apt.transferredFrom;

                  return (
                    <tr
                      key={apt._id}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {patientObj?.name ? patientObj.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{patientObj?.name || 'Patient'}</p>
                            <p className="text-[10px] text-slate-400">{patientObj?.email || patientObj?.phone || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-slate-800">{doctorObj?.name || 'Doctor'}</p>
                            <p className="text-[10px] text-slate-500">{doctorObj?.specialty || ''}</p>
                          </div>
                          {isTransferred && (
                            <span
                              title={`Transferred from ${(apt.transferredFrom as any)?.name || 'Colleague'}`}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 flex items-center gap-0.5"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              Transferred
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {doctorObj?.department || 'General'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{apt.date}</p>
                        <p className="text-[10px] text-slate-500">{apt.time}</p>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-semibold text-slate-800 truncate">{apt.reason}</p>
                        <p className="text-[10px] text-slate-400 truncate">{apt.type}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedAppointment(apt);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Inspection Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Appointment Audit Record
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Consultation #{selectedAppointment._id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Status & Timing Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Consultation Timing</p>
                  <p className="text-sm font-black text-slate-800">
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </p>
                </div>
                <div>{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              {/* Patient & Doctor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Details */}
                <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>Patient Profile</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {(selectedAppointment.patient as any)?.name || 'Patient'}
                  </p>
                  <p className="text-slate-500">{(selectedAppointment.patient as any)?.email}</p>
                  <p className="text-slate-500">{(selectedAppointment.patient as any)?.phone || 'No phone recorded'}</p>
                </div>

                {/* Doctor Details */}
                <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Assigned Doctor</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {(selectedAppointment.doctor as any)?.name || 'Doctor'}
                  </p>
                  <p className="text-slate-500">{(selectedAppointment.doctor as any)?.specialty}</p>
                  <p className="text-slate-500">{(selectedAppointment.doctor as any)?.department} Department</p>
                </div>
              </div>

              {/* Transfer Details if Transferred */}
              {selectedAppointment.transferredFrom && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <ArrowRightLeft className="w-4 h-4 text-purple-700" />
                    <span>Clinical Patient Transfer Audit</span>
                  </div>
                  <p className="text-purple-800 leading-relaxed">
                    Transferred from{' '}
                    <span className="font-bold">
                      {(selectedAppointment.transferredFrom as any)?.name || 'Colleague'}
                    </span>
                    . Reason: "{selectedAppointment.transferReason || 'Specialist reallocation'}"
                  </p>
                  {selectedAppointment.transferredAt && (
                    <p className="text-[10px] text-purple-600">
                      Transferred at: {new Date(selectedAppointment.transferredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Reason & Notes */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reason for Visit & Patient Notes
                </p>
                <p className="font-semibold text-slate-800">{selectedAppointment.reason}</p>
                {selectedAppointment.notes && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                    {selectedAppointment.notes}
                  </p>
                )}
              </div>

              {/* Clinical Notes / Diagnosis / Prescription if any */}
              {(selectedAppointment.diagnosis || selectedAppointment.prescription || selectedAppointment.doctorNotes) && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Clinical Doctor Notes & Diagnosis</span>
                  </div>
                  {selectedAppointment.diagnosis && (
                    <div>
                      <span className="font-bold text-slate-800">Diagnosis: </span>
                      <span className="text-slate-700">{selectedAppointment.diagnosis}</span>
                    </div>
                  )}
                  {selectedAppointment.prescription && (
                    <div>
                      <span className="font-bold text-slate-800">Prescription: </span>
                      <span className="text-slate-700">{selectedAppointment.prescription}</span>
                    </div>
                  )}
                  {selectedAppointment.doctorNotes && (
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Consultation Notes</p>
                      <p className="text-slate-700 whitespace-pre-line bg-white/80 p-2 rounded-lg border border-emerald-100 mt-0.5">
                        {selectedAppointment.doctorNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Reason if Cancelled */}
              {selectedAppointment.status === 'Cancelled' && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Cancellation Info</p>
                  <p className="font-semibold">{selectedAppointment.cancellationReason || 'Cancelled by patient or staff'}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
