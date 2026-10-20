import React, { useState } from 'react';
import { Pill, CreditCard, Bell, CheckCircle2, Clock, Search, RotateCcw, ArrowRight } from 'lucide-react';
import { ServiceConfig, Ticket, ClinicSettings } from '../types/queue';

interface PharmacyCashierViewProps {
  services: ServiceConfig[];
  tickets: Ticket[];
  settings: ClinicSettings;
  onCallTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
}

export const PharmacyCashierView: React.FC<PharmacyCashierViewProps> = ({
  services,
  tickets,
  settings,
  onCallTicket,
  onUpdateTicketStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'farmasi' | 'kasir'>('farmasi');
  const [searchQuery, setSearchQuery] = useState('');

  const pharmacyService = services.find((s) => s.id === 'farmasi') || services[4];
  const cashierService = services.find((s) => s.id === 'kasir') || services[5];

  const currentService = activeSubTab === 'farmasi' ? pharmacyService : cashierService;

  // Filter tickets for currently selected sub-service
  const relevantTickets = tickets.filter((t) => t.serviceId === currentService.id);

  // Active called ticket
  const activeTicket = relevantTickets.find(
    (t) => t.status === 'calling' || t.status === 'in_consultation'
  );

  // Waiting tickets
  const waitingTickets = relevantTickets
    .filter((t) => t.status === 'waiting')
    .filter((t) =>
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Completed tickets
  const completedTickets = relevantTickets.filter((t) => t.status === 'completed');

  const handleCallNext = () => {
    if (waitingTickets.length > 0) {
      onCallTicket(waitingTickets[0]);
    }
  };

  const handleRecall = () => {
    if (activeTicket) {
      onCallTicket(activeTicket);
    }
  };

  const handleFinish = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'completed');
    }
  };

  const handleFinishAndCallNext = () => {
    if (activeTicket) {
      onUpdateTicketStatus(activeTicket.id, 'completed');
    }
    if (waitingTickets.length > 0) {
      onCallTicket(waitingTickets[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Switcher: Farmasi vs Kasir */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <div>
          <span className="text-xs font-semibold text-emerald-600">
            PELAYANAN LANJUTAN
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Farmasi / Apotek & Kasir
          </h1>
          <p className="text-xs text-slate-500">
            Kelola antrian penyerahan obat resep dan proses pembayaran pasien.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('farmasi')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'farmasi'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Loket Farmasi (Kode E)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('kasir')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'kasir'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-rose-600" />
            <span>Loket Kasir & BPJS (Kode K)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Station Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="text-xs font-bold text-slate-700 tracking-wider">
                STATUS LOKET: {currentService.name.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Petugas: {currentService.doctorName}
              </span>
            </div>

            {activeTicket ? (
              <div>
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">
                      NOMOR ANTRIAN AKTIF
                    </span>
                    <span className="text-6xl font-black font-mono-numbers text-teal-600 block my-1">
                      {activeTicket.ticketNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTicket.patientName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{activeTicket.patientCategory}</span>
                      <span aria-hidden="true">·</span>
                      <span>Loket {currentService.counterNumber}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={handleRecall}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Panggil Ulang Suara</span>
                    </button>

                    {waitingTickets.length > 0 ? (
                      <button
                        onClick={handleFinishAndCallNext}
                        className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai & Panggil #{waitingTickets[0].ticketNumber}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinish}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{activeSubTab === 'farmasi' ? 'Obat Diserahkan (Selesai)' : 'Pembayaran Lunas'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeTicket.doctorNotes && (
                  <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-slate-700">
                    <span className="font-bold text-teal-900 block mb-1">
                      Catatan Resep Dokter:
                    </span>
                    <p className="italic">{activeTicket.doctorNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  {activeSubTab === 'farmasi' ? <Pill className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Tidak Ada Panggilan Aktif di {currentService.name}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  {waitingTickets.length > 0
                    ? `Terdapat ${waitingTickets.length} antrian menunggu di loket ini.`
                    : 'Tidak ada resep atau pembayaran tertunda.'}
                </p>

                <button
                  onClick={handleCallNext}
                  disabled={waitingTickets.length === 0}
                  className={`px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all ${
                    waitingTickets.length > 0
                      ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer ring-2 ring-teal-500/30'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    Panggil Nomor Antrian Berikutnya ({waitingTickets[0]?.ticketNumber || 'Kosong'})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Waiting Queue */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 tracking-wider">
                  ANTRIAN MENUNGGU ({waitingTickets.length})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Total Diserahkan Hari Ini: {completedTickets.length}
                </span>
              </div>

              {waitingTickets.length > 0 && !activeTicket && (
                <button
                  onClick={handleCallNext}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Panggil Sekarang</span>
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor antrian..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {waitingTickets.length > 0 ? (
                waitingTickets.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-extrabold font-mono-numbers text-base text-slate-900 block">
                          {t.ticketNumber}
                        </span>
                        <span className="text-xs text-slate-700 font-medium truncate block max-w-[160px]">
                          {t.patientName}
                        </span>
                        {t.doctorNotes && (
                          <span className="text-[10px] text-slate-500 italic block truncate max-w-[160px]">
                            {t.doctorNotes}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onCallTicket(t)}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Bell className="w-3 h-3 text-teal-600" />
                      <span>Panggil</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada antrian menunggu di {currentService.name}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
