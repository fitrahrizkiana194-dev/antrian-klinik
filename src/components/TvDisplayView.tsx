import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Sparkles, Clock, Calendar, CheckCircle, Users } from 'lucide-react';
import { ServiceConfig, Ticket, ClinicSettings, CallEvent } from '../types/queue';

interface TvDisplayViewProps {
  services: ServiceConfig[];
  tickets: Ticket[];
  settings: ClinicSettings;
  activeCall: CallEvent | null;
  onRecallActive?: () => void;
}

export const TvDisplayView: React.FC<TvDisplayViewProps> = ({
  services,
  tickets,
  settings,
  activeCall,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Live Clock updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Health tip carousel slide
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 9000);
    return () => clearInterval(slideTimer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format Indonesian Date & Time
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate status per service
  const getServiceStatus = (serviceId: string) => {
    const serviceTickets = tickets.filter((t) => t.serviceId === serviceId);
    
    // Currently called or in-consultation
    const currentTicket = serviceTickets.find(
      (t) => t.status === 'calling' || t.status === 'in_consultation'
    );

    // Waiting queue
    const waitingTickets = serviceTickets.filter((t) => t.status === 'waiting');
    const nextTicket = waitingTickets[0];

    return {
      currentNumber: currentTicket ? currentTicket.ticketNumber : '—',
      currentPatient: currentTicket ? currentTicket.patientName : '',
      currentStatus: currentTicket ? currentTicket.status : null,
      nextNumber: nextTicket ? nextTicket.ticketNumber : '—',
      waitingCount: waitingTickets.length,
      totalCompleted: serviceTickets.filter((t) => t.status === 'completed').length,
    };
  };

  const healthSlides = [
    {
      title: 'Etika Batuk & Bersin di Fasilitas Kesehatan',
      text: 'Gunakan masker bila sedang batuk atau flu. Tutup hidung & mulut dengan lengan atas bagian dalam atau tisu sekali pakai, lalu buang ke tempat sampah tertutup.',
      tag: 'Edukasi Kemenkes RI',
    },
    {
      title: 'Jadwal Dokter & Layanan Spesialis Hari Ini',
      text: 'Layanan Poli Umum, Gigi, KIA, dan Mata beroperasi hingga pukul 21.00 WIB. Pendaftaran resep farmasi terakhir dilayani pukul 20.30 WIB.',
      tag: 'Informasi Layanan',
    },
    {
      title: 'Prioritas Antrian Pasien Khusus',
      text: 'Pasien Lansia (usia 60+), Ibu Hamil dengan usia kandungan trimester akhir, dan Penyandang Disabilitas berhak mendapatkan jalur antrian prioritas.',
      tag: 'Maklumat Pelayanan',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-white flex flex-col justify-between select-none">
      {/* TV Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-500/20">
            +
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {settings.clinicName}
            </h1>
            <p className="text-xs text-slate-400">
              {settings.clinicAddress}
            </p>
          </div>
        </div>

        {/* Live Date & Time Display */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-2xl font-bold font-mono-numbers text-white tracking-wider">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>{formattedTime} <span className="text-xs text-slate-400 font-normal">WIB</span></span>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh TV'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Big Calling Billboard (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Calling Card */}
          <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider">
                  PANGGILAN AKTIF SEKARANG
                </span>
                {activeCall && (
                  <span className="text-xs text-slate-400">· Baru Saja Dipanggil</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>
                  Total Pasien Mengantri: {tickets.filter((t) => t.status === 'waiting').length} Orang
                </span>
              </div>
            </div>

            {/* Giant Ticket Number */}
            <div className="my-auto py-8 text-center">
              <div className="text-sm font-medium text-slate-400 mb-2">
                NOMOR ANTRIAN
              </div>
              <div className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight font-mono-numbers text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all">
                {activeCall ? activeCall.ticketNumber : (tickets.find(t => t.status === 'calling' || t.status === 'in_consultation')?.ticketNumber || 'A-012')}
              </div>
              <div className="mt-4 text-lg sm:text-xl font-medium text-slate-200">
                {activeCall ? activeCall.patientName : (tickets.find(t => t.status === 'calling' || t.status === 'in_consultation')?.patientName || 'Bpk. Bambang Sutrisno')}
              </div>
            </div>

            {/* Destination Room Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  SILAKAN MENUJU KE
                </span>
                <span className="text-2xl font-bold text-white block">
                  {activeCall ? activeCall.serviceName : 'Poli Umum'}
                </span>
                <span className="text-sm text-emerald-400 font-medium">
                  {activeCall ? activeCall.roomName : 'Ruang Periksa 1 (Lantai 1)'}
                </span>
              </div>
              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                <span className="text-xs text-slate-400 block mb-1">
                  LOKET PELAYANAN
                </span>
                <span className="text-3xl font-extrabold font-mono-numbers text-white">
                  LOKET {activeCall ? activeCall.counterNumber : '01'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Educational Media & Live Poliklinik Grid (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Clinic Photo & Health Education Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
            <div className="h-44 w-full relative">
              <img
                src="/src/assets/images/clinic_reception_interior_1792494338122.jpg"
                alt="Ruang Tunggu Klinik"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-xs text-emerald-400 font-semibold block mb-0.5">
                  {healthSlides[activeSlide].tag}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {healthSlides[activeSlide].title}
                </h3>
              </div>
            </div>
            <div className="p-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
              {healthSlides[activeSlide].text}
            </div>
          </div>

          {/* Service status summary cards */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-xs font-semibold text-slate-300 tracking-wider">
                STATUS LOKET & POLI SAAT INI
              </h2>
              <span className="text-xs text-slate-500">Live Monitor</span>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {services.slice(0, 4).map((service) => {
                const stat = getServiceStatus(service.id);
                return (
                  <div
                    key={service.id}
                    className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-200 truncate">
                        {service.name}
                      </span>
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {service.code}
                      </span>
                    </div>

                    <div className="my-1">
                      <span className="text-[10px] text-slate-400 block">Sedang Dilayani</span>
                      <div className="text-2xl font-bold font-mono-numbers text-emerald-400">
                        {stat.currentNumber}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Berikutnya: <strong className="font-mono-numbers text-slate-200">{stat.nextNumber}</strong></span>
                      <span>Antri: <strong className="font-mono-numbers text-amber-400">{stat.waitingCount}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Farmasi & Kasir quick pill row */}
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
              {services.slice(4).map((service) => {
                const stat = getServiceStatus(service.id);
                return (
                  <div
                    key={service.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        {service.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Antri: {stat.waitingCount} orang
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block text-[10px]">Panggil</span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {stat.currentNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Running Text Ticker at Bottom */}
      <div className="bg-slate-950 border-t border-slate-800 py-3 px-6 flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded shrink-0 border border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PENGUMUMAN</span>
        </div>
        <div className="overflow-hidden flex-1 relative whitespace-nowrap">
          <span className="animate-marquee text-sm text-slate-300 font-medium tracking-wide">
            {settings.runningText} ··· Layanan Ambulans Gawat Darurat Hubungi: 119 / {settings.clinicPhone} ··· Rawat jalan BPJS mohon persiapkan KTP & Kartu KIS Digital.
          </span>
        </div>
      </div>
    </div>
  );
};
