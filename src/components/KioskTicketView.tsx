import React, { useState } from 'react';
import { 
  Printer, 
  Check, 
  Clock, 
  Users, 
  ArrowRight, 
  HeartHandshake, 
  Stethoscope, 
  Baby, 
  Eye, 
  Pill, 
  CreditCard,
  X,
  Share2
} from 'lucide-react';
import { ServiceConfig, Ticket, ClinicSettings, PatientCategory, PriorityLevel, ServiceId } from '../types/queue';

interface KioskTicketViewProps {
  services: ServiceConfig[];
  tickets: Ticket[];
  settings: ClinicSettings;
  onAddTicket: (ticket: Ticket) => void;
}

export const KioskTicketView: React.FC<KioskTicketViewProps> = ({
  services,
  tickets,
  settings,
  onAddTicket,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientCategory, setPatientCategory] = useState<PatientCategory>('BPJS');
  const [priority, setPriority] = useState<PriorityLevel>('regular');
  const [phone, setPhone] = useState('');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Icon mapping for services
  const getServiceIcon = (id: ServiceId) => {
    switch (id) {
      case 'umum': return <Stethoscope className="w-6 h-6 text-emerald-600" />;
      case 'gigi': return <HeartHandshake className="w-6 h-6 text-sky-600" />;
      case 'kia': return <Baby className="w-6 h-6 text-amber-600" />;
      case 'mata': return <Eye className="w-6 h-6 text-indigo-600" />;
      case 'farmasi': return <Pill className="w-6 h-6 text-teal-600" />;
      case 'kasir': return <CreditCard className="w-6 h-6 text-rose-600" />;
    }
  };

  // Calculate waiting count for a service
  const getWaitingCount = (serviceId: string) => {
    return tickets.filter((t) => t.serviceId === serviceId && t.status === 'waiting').length;
  };

  // Generate new ticket
  const handleIssueTicket = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedService) return;

    // Find highest sequence number for this service today
    const serviceTickets = tickets.filter((t) => t.serviceId === selectedService.id);
    const lastSeq = serviceTickets.reduce((max, t) => Math.max(max, t.sequenceNumber), 0);
    const nextSeq = lastSeq + 1;
    const formattedNum = `${selectedService.code}-${String(nextSeq).padStart(3, '0')}`;

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      ticketNumber: formattedNum,
      serviceId: selectedService.id,
      serviceCode: selectedService.code,
      sequenceNumber: nextSeq,
      patientName: patientName.trim() || `Pasien ${patientCategory} (${formattedNum})`,
      patientCategory,
      phone: phone.trim() || undefined,
      priority,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      calledAt: null,
      completedAt: null,
      counterNumber: selectedService.counterNumber,
    };

    onAddTicket(newTicket);
    setIssuedTicket(newTicket);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  const handleResetKiosk = () => {
    setIssuedTicket(null);
    setSelectedService(null);
    setPatientName('');
    setPhone('');
    setPriority('regular');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Kiosk Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-semibold text-emerald-600 tracking-wider">
          MESIN TIKET ANTRIAN MANDIRI
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
          Ambil Nomor Antrian Pasien
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Silakan pilih poliklinik atau loket tujuan di bawah ini untuk mencetak karcis antrian Anda.
        </p>
      </div>

      {/* Grid of Service Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service) => {
          const waitingCount = getWaitingCount(service.id);
          const isSelected = selectedService?.id === service.id;

          return (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getServiceIcon(service.id)}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      KODE {service.code}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Loket {service.counterNumber}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  {service.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {service.description}
                </p>

                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{service.doctorName}</span>
                  <span className="text-slate-400 block text-[11px]">{service.specialistTitle}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Antri di depan: <strong className="text-slate-800 font-mono-numbers">{waitingCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{waitingCount * service.avgTimeMin} mnt</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Service Drawer / Form */}
      {selectedService && !issuedTicket && (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-emerald-600">
                FORMULIR KUNJUNGAN
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Konfirmasi Tiket: {selectedService.name} (Kode {selectedService.code})
              </h3>
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleIssueTicket} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pasien (Opsional)
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Contoh: Bpk. Sugeng / Ibu Anisa (atau kosongkan)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Penjamin / Pasien
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
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
                  Nomor HP / WhatsApp (Opsional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Priority Check */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={priority === 'priority'}
                  onChange={(e) => setPriority(e.target.checked ? 'priority' : 'regular')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Antrian Prioritas Khusus
                  </span>
                  <span className="text-slate-500">
                    Untuk Lansia (&gt;60 tahun), Ibu Hamil, Balita, atau Penyandang Disabilitas
                  </span>
                </div>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak & Ambil Karcis Antrian</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Karcis Thermal Receipt Virtual */}
      {issuedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={handleResetKiosk}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thermal Receipt Body */}
            <div
              id="thermal-receipt"
              className="bg-white border border-dashed border-slate-300 p-6 rounded-lg text-center font-mono"
            >
              <div className="border-b border-slate-300 pb-3 mb-3">
                <h4 className="font-bold text-base tracking-tight text-slate-900">
                  {settings.clinicName}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {settings.clinicAddress}
                </p>
                <p className="text-[10px] text-slate-500">
                  Telp: {settings.clinicPhone}
                </p>
              </div>

              <div className="text-[11px] text-slate-600 flex justify-between my-2">
                <span>WAKTU CETAK:</span>
                <span>
                  {new Date(issuedTicket.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  {new Date(issuedTicket.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Big Ticket Box */}
              <div className="my-4 py-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[11px] font-sans font-semibold text-slate-500 block">
                  NOMOR ANTRIAN ANDA
                </span>
                <span className="text-4xl font-extrabold text-slate-900 font-mono-numbers block tracking-wider mt-1">
                  {issuedTicket.ticketNumber}
                </span>
                <span className="text-[11px] font-sans text-slate-600 mt-1 block">
                  {services.find((s) => s.id === issuedTicket.serviceId)?.name}
                </span>
              </div>

              <div className="text-left text-[11px] text-slate-600 space-y-1 border-t border-b border-slate-200 py-3 my-3">
                <div className="flex justify-between">
                  <span>Nama Pasien:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {issuedTicket.patientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Penjamin:</span>
                  <span className="font-bold text-slate-900">{issuedTicket.patientCategory}</span>
                </div>
                {issuedTicket.priority === 'priority' && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Prioritas:</span>
                    <span>Lansia / Khusus</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Loket Tujuan:</span>
                  <span className="font-bold text-slate-900">
                    Loket {issuedTicket.counterNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Antrian:</span>
                  <span className="font-bold text-slate-900">
                    {getWaitingCount(issuedTicket.serviceId)} Orang di Depan
                  </span>
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="py-2">
                <div className="h-9 w-full flex items-center justify-center gap-[2px] overflow-hidden opacity-80">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{
                        width: (i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2) + 'px',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[9px] tracking-widest text-slate-400 block mt-1">
                  *{issuedTicket.id.toUpperCase()}*
                </span>
              </div>

              <p className="text-[9px] text-slate-500 mt-3 font-sans">
                Simpan tiket ini. Harap perhatikan panggilan nomor pada layar monitor TV ruang tunggu.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Mencetak...' : 'Cetak Karcis Kertas'}</span>
              </button>

              <button
                onClick={handleResetKiosk}
                className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Selesai / Pasien Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
