import React, { useState } from 'react';
import { 
  Bell, 
  RotateCcw, 
  CheckCircle2, 
  FastForward, 
  Pill, 
  User, 
  Clock, 
  FileText, 
  Search,
  Activity,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { ServiceConfig, Ticket, ClinicSettings, ServiceId } from '../types/queue';

interface DoctorCounterViewProps {
  services: ServiceConfig[];
  tickets: Ticket[];
  settings: ClinicSettings;
  onCallTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: Ticket['status'], notes?: string) => void;
  onReferToPharmacy: (ticket: Ticket, pharmacyNotes?: string) => void;
  onOpenRegisterModal?: (serviceId?: ServiceId) => void;
}

export const DoctorCounterView: React.FC<DoctorCounterViewProps> = ({
  services,
  tickets,
  settings,
  onCallTicket,
  onUpdateTicketStatus,
  onReferToPharmacy,
  onOpenRegisterModal,
}) => {
  // Currently active selected counter service (default to Poli Umum)
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>('umum');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Tickets for this service
  const serviceTickets = tickets.filter((t) => t.serviceId === currentService.id);

  // Active ticket currently being called or in consultation
  const activeTicket = serviceTickets.find(
    (t) => t.status === 'calling' || t.status === 'in_consultation'
  );

  // Waiting tickets (sorted by priority first, then createdAt)
  const waitingTickets = serviceTickets
    .filter((t) => t.status === 'waiting')
    .sort((a, b) => {
      if (a.priority === 'priority' && b.priority !== 'priority') return -1;
      if (b.priority === 'priority' && a.priority !== 'priority') return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .filter((t) => 
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Completed or skipped tickets today
  const historyTickets = serviceTickets
    .filter((t) => t.status === 'completed' || t.status === 'skipped')
    .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());

  // Call Next Waiting Patient
  const handleCallNext = () => {
    if (waitingTickets.length > 0) {
      const nextTicket = waitingTickets[0];
      onCallTicket(nextTicket);
      setDoctorNotes('');
    }
  };

  // Recall current patient
  const handleRecallCurrent = () => {
    if (activeTicket) {
      onCallTicket(activeTicket);
    }
  };

  // Start Consultation
  const handleStartConsultation = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'in_consultation', doctorNotes);
    }
  };

  // Finish Consultation
  const handleFinishConsultation = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'completed', doctorNotes);
      setDoctorNotes('');
    }
  };

  // Finish current patient and directly call next patient in line
  const handleFinishAndCallNext = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'completed', doctorNotes);
      setDoctorNotes('');
    }
    if (waitingTickets.length > 0) {
      onCallTicket(waitingTickets[0]);
    }
  };

  // Skip Patient
  const handleSkipPatient = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'skipped', 'Pasien tidak hadir setelah dipanggil');
      setDoctorNotes('');
    }
  };

  // Skip current patient and immediately call next
  const handleSkipAndCallNext = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'skipped', 'Pasien tidak hadir setelah dipanggil');
      setDoctorNotes('');
    }
    if (waitingTickets.length > 0) {
      onCallTicket(waitingTickets[0]);
    }
  };

  // Refer to Pharmacy
  const handleReferToPharmacyAction = () => {
    if (activeTicket) {
      onReferToPharmacy(activeTicket, doctorNotes);
      setDoctorNotes('');
    }
  };

  // Refer to Pharmacy and call next patient
  const handleReferAndCallNext = () => {
    if (activeTicket) {
      onReferToPharmacy(activeTicket, doctorNotes);
      setDoctorNotes('');
    }
    if (waitingTickets.length > 0) {
      onCallTicket(waitingTickets[0]);
    }
  };

  // Calculate wait duration in minutes
  const getMinutesAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Counter Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600">
                PANEL PETUGAS & DOKTER
              </span>
              <span className="text-xs text-slate-400">· Loket {currentService.counterNumber}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {currentService.name}
            </h1>
            <p className="text-xs text-slate-500">
              Dokter Penanggung Jawab: <strong className="text-slate-800">{currentService.doctorName}</strong> ({currentService.specialistTitle}) · {currentService.roomName}
            </p>
          </div>

          {/* Switch Loket Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Ganti Loket:
            </span>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value as ServiceId);
                setDoctorNotes('');
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  Loket {s.counterNumber}: {s.name} ({s.code}) - {s.doctorName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Patient Examination Box (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-700">
                  PASIEN AKTIF SAAT INI
                </span>
                {activeTicket?.status === 'in_consultation' ? (
                  <span className="text-xs text-emerald-700 font-medium">
                    · Sedang Diperiksa
                  </span>
                ) : activeTicket?.status === 'calling' ? (
                  <span className="text-xs text-amber-700 font-medium">
                    · Sedang Dipanggil ke Ruangan
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">· Belum Ada Pasien Dipanggil</span>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Loket {currentService.counterNumber}
              </span>
            </div>

            {activeTicket ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">
                      NOMOR ANTRIAN
                    </span>
                    <span className="text-5xl font-black font-mono-numbers text-emerald-600 block my-1">
                      {activeTicket.ticketNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTicket.patientName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{activeTicket.patientCategory}</span>
                      <span aria-hidden="true">·</span>
                      {activeTicket.priority === 'priority' && (
                        <>
                          <span className="text-amber-700 font-semibold">Prioritas Lansia/Khusus</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>Tiba {getMinutesAgo(activeTicket.createdAt)} menit lalu</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={handleRecallCurrent}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Panggil Ulang (Recall)</span>
                    </button>

                    {activeTicket.status === 'calling' && (
                      <button
                        onClick={handleStartConsultation}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Mulai Konsultasi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Doctor Notes & Quick Prescription */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Catatan Singkat Pemeriksaan / Resep Obat:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Tuliskan keluhan utama, diagnosa singkat (misal: ISPA, Hipertensi), atau resep obat yang akan dirujuk ke Farmasi..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                {/* Patient Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {waitingTickets.length > 0 ? (
                      <button
                        onClick={handleSkipAndCallNext}
                        className="px-3 py-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-rose-200"
                        title="Lewati pasien saat ini dan langsung panggil antrian berikutnya"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Lewati & Panggil #{waitingTickets[0].ticketNumber}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSkipPatient}
                        className="px-3 py-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Lewati Pasien</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleReferToPharmacyAction}
                      className="px-3.5 py-2.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Selesaikan konsultasi dan otomatis kirim tiket ke Loket Farmasi"
                    >
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>Rujuk ke Farmasi</span>
                    </button>

                    <button
                      onClick={handleFinishConsultation}
                      className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Selesai Saja</span>
                    </button>

                    {waitingTickets.length > 0 ? (
                      <button
                        onClick={handleFinishAndCallNext}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer ring-2 ring-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai & Panggil Berikutnya ({waitingTickets[0].ticketNumber})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishConsultation}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai Konsultasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Pasien yang Sedang Dilayani
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  {waitingTickets.length > 0
                    ? `Ada ${waitingTickets.length} pasien sedang mengantri di ${currentService.name}. Klik tombol panggil di bawah untuk memanggil pasien berikutnya.`
                    : 'Antrian saat ini kosong. Pasien baru yang mengambil tiket di Kiosk akan muncul otomatis di sini.'}
                </p>

                <button
                  onClick={handleCallNext}
                  disabled={waitingTickets.length === 0}
                  className={`px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all ${
                    waitingTickets.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Panggil Nomor Berikutnya ({waitingTickets[0]?.ticketNumber || 'Antrian Kosong'})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Waiting Queue & History (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[500px]">
            {/* Header with queue count & tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'queue'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Menunggu ({waitingTickets.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'history'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Selesai Hari Ini ({historyTickets.length})
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenRegisterModal && (
                  <button
                    onClick={() => onOpenRegisterModal(currentService.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Pasien</span>
                  </button>
                )}
                {waitingTickets.length > 0 && !activeTicket && (
                  <button
                    onClick={handleCallNext}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Panggil #1</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Box */}
            <div className="my-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor antrian atau nama pasien..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
              {activeTab === 'queue' ? (
                waitingTickets.length > 0 ? (
                  waitingTickets.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold font-mono-numbers text-base text-slate-900">
                              {t.ticketNumber}
                            </span>
                            {t.priority === 'priority' && (
                              <span className="text-[10px] text-amber-700 font-bold">
                                Prioritas
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-700 font-medium truncate max-w-[170px]">
                            {t.patientName}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Tunggu {getMinutesAgo(t.createdAt)} mnt</span>
                            <span aria-hidden="true">·</span>
                            <span>{t.patientCategory}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onCallTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Bell className="w-3 h-3 text-emerald-600" />
                        <span>Panggil</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada antrian menunggu untuk {currentService.name}.
                  </div>
                )
              ) : historyTickets.length > 0 ? (
                historyTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-bold text-sm text-slate-800">
                          {t.ticketNumber}
                        </span>
                        <span className="text-xs text-slate-600 truncate max-w-[160px]">
                          {t.patientName}
                        </span>
                      </div>
                      {t.doctorNotes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{t.doctorNotes}"
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-semibold block ${t.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {t.status === 'completed' ? 'Selesai' : 'Dilewati'}
                      </span>
                      {t.referredTo && (
                        <span className="text-[10px] text-teal-600 font-medium">
                          Rujuk Farmasi
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada pasien selesai hari ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
