import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { IDoctor } from '../../../package/src/types/doctor';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DoctorFilters } from '../components/doctors/DoctorFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import { fallbackDoctors } from '../data/fallbackDoctors';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>(() => fallbackDoctors);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const fetchDoctors = useCallback(async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (selectedDay !== 'All') params.day = selectedDay;

      const res = await api.get('/doctors', { params });
      if (res.data?.data?.doctors) {
        setDoctors(res.data.data.doctors);
      }
    } catch (err) {
      console.warn('Using client-side doctor filtering fallback:', err);
      // Client filtering fallback
      let filtered = [...fallbackDoctors];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          d =>
            d.name.toLowerCase().includes(q) ||
            d.specialty.toLowerCase().includes(q) ||
            d.department.toLowerCase().includes(q)
        );
      }
      if (selectedSpecialty !== 'All') {
        filtered = filtered.filter(d => d.specialty === selectedSpecialty);
      }
      if (selectedDay !== 'All') {
        filtered = filtered.filter(d => d.availability.some(a => a.day === selectedDay));
      }
      setDoctors(filtered);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSpecialty, selectedDay]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const handleReset = () => {
    setSearch('');
    setSelectedSpecialty('All');
    setSelectedDay('All');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Hospital Doctors & Specialists
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore board-certified medical specialists, review their weekly availability schedules, and reserve your consultation.
        </p>
      </div>

      {/* Filter Component */}
      <DoctorFilters
        search={search}
        onSearchChange={setSearch}
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        onReset={handleReset}
      />

      {/* Doctor Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching available doctors..." />
      ) : doctors.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Doctors Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              We couldn't find any medical specialists matching your current filter criteria.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing <strong className="text-slate-800">{doctors.length}</strong> available doctor{doctors.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
