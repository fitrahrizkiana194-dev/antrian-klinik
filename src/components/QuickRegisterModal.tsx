import React, { useState } from 'react';
import { X, UserPlus, Stethoscope, HeartHandshake, Baby, Eye, Pill, CreditCard, Printer, Check } from 'lucide-react';
import { ServiceConfig, Ticket, PatientCategory, PriorityLevel, ServiceId } from '../types/queue';

interface QuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceConfig[];
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  defaultServiceId?: ServiceId;
}

export const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({
  isOpen,
  onClose,
  services,
  tickets,
  onAddTicket,
  defaultServiceId = 'umum',
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>(defaultServiceId);
  const [patientName, setPatientName] = useState('');
  const [patientCategory, setPatientCategory] = useState<PatientCategory>('BPJS');
  const [priority, setPriority] = useState<PriorityLevel>('regular');
  const [phone, setPhone] = useState('');
  const [successTicket, setSuccessTicket] = useState<Ticket | null>(null);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sequence calculation
    const serviceTickets = tickets.filter((t) => t.serviceId === currentService.id);
    const lastSeq = serviceTickets.reduce((max, t) => Math.max(max, t.sequenceNumber), 0);
    const nextSeq = lastSeq + 1;
    const formattedNum = `${currentService.code}-${String(nextSeq).padStart(3, '0')}`;

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      ticketNumber: formattedNum,
      serviceId: currentService.id,
      serviceCode: currentService.code,
      sequenceNumber: nextSeq,
      patientName: patientName.trim() || `Pasien ${patientCategory} (${formattedNum})`,
      patientCategory,
      phone: phone.trim() || undefined,
      priority,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      calledAt: null,
      completedAt: null,
      counterNumber: currentService.counterNumber,
    };

    onAddTicket(newTicket);
    setSuccessTicket(newTicket);
  };

  const handleResetAndClose = () => {
    setSuccessTicket(null);
    setPatientName('');
    setPhone('');
    setPriority('regular');
    onClose();
  };

  const handleRegisterAnother = () => {
    setSuccessTicket(null);
    setPatientName('');
    setPhone('');
    setPriority('regular');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successTicket ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Pasien Berhasil Didaftarkan!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Nomor antrian telah tercatat di sistem dan tampil di Layar TV.
            </p>

            <div className="my-5 p-5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs font-semibold text-slate-500 block">
                NOMOR ANTRIAN
              </span>
              <span className="text-5xl font-extrabold font-mono-numbers text-emerald-600 block my-1">
                {successTicket.ticketNumber}
              </span>
              <span className="text-sm font-bold text-slate-800 block">
                {successTicket.patientName}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                {currentService.name} · Loket {currentService.counterNumber} ({successTicket.patientCategory})
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRegisterAnother}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                + Daftarkan Pasien Lain
              </button>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600">
                LOKET PENDAFTARAN PASIEN
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Tambah Pasien / Antrian Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">
              Masukkan identitas pasien dan pilih tujuan poliklinik untuk menerbitkan nomor antrian.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Poli / Layanan Tujuan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {services.map((s) => {
                    const isSelected = selectedServiceId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {s.code}
                          </span>
                          <span className="text-[10px] text-slate-400">Loket {s.counterNumber}</span>
                        </div>
                        <span className="text-xs font-bold block mt-1 truncate">
                          {s.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pasien
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Contoh: Ibu Siti Rahmawati / Bpk. Joko"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Penjamin
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                    {(['BPJS', 'Umum', 'Asuransi'] as PatientCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPatientCategory(cat)}
                        className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          patientCategory === cat
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Priority Checkbox */}
              <div>
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={priority === 'priority'}
                    onChange={(e) => setPriority(e.target.checked ? 'priority' : 'regular')}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Antrian Prioritas (Lansia / Bumil / Disabilitas)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Akan ditempatkan di urutan teratas antrian
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Pasien & Terbitkan Tiket</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
