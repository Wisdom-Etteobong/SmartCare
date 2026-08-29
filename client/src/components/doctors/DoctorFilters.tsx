import React from 'react';
import { Search, Filter, X, Calendar, Stethoscope } from 'lucide-react';
import { SPECIALTIES, DAYS_OF_WEEK } from '../../../../package/src/constants/appointment';

interface DoctorFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (val: string) => void;
  selectedDay: string;
  onDayChange: (val: string) => void;
  onReset: () => void;
}

export const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  search,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  selectedDay,
  onDayChange,
  onReset,
}) => {
  const hasActiveFilters = search || selectedSpecialty !== 'All' || selectedDay !== 'All';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs space-y-4">
      {/* Search and Main Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="doctor-search-input"
            type="text"
            placeholder="Search by doctor name, specialty, or department..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm transition-all outline-hidden text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Specialty Filter */}
        <div className="md:col-span-3 relative">
          <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="specialty-filter-select"
            value={selectedSpecialty}
            onChange={e => onSpecialtyChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm transition-all outline-hidden text-slate-800 appearance-none font-medium"
          >
            <option value="All">All Specialties</option>
            {SPECIALTIES.map(spec => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Day Availability Filter */}
        <div className="md:col-span-3 relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="day-filter-select"
            value={selectedDay}
            onChange={e => onDayChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm transition-all outline-hidden text-slate-800 appearance-none font-medium"
          >
            <option value="All">Any Working Day</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Specialty Pills for instant clicking */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 text-[11px]">
          Quick filter:
        </span>
        <button
          onClick={() => onSpecialtyChange('All')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 ${
            selectedSpecialty === 'All'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {SPECIALTIES.slice(0, 6).map(spec => (
          <button
            key={spec}
            onClick={() => onSpecialtyChange(spec)}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 ${
              selectedSpecialty === spec
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {spec}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
