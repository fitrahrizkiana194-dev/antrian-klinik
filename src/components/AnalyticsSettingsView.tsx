import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Settings, 
  Volume2, 
  Trash2, 
  Check, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { ServiceConfig, Ticket, ClinicSettings } from '../types/queue';

interface AnalyticsSettingsViewProps {
  services: ServiceConfig[];
  tickets: Ticket[];
  settings: ClinicSettings;
  onUpdateSettings: (newSettings: ClinicSettings) => void;
  onResetTodayQueue: () => void;
  onSeedDemoData: () => void;
}

export const AnalyticsSettingsView: React.FC<AnalyticsSettingsViewProps> = ({
  services,
  tickets,
  settings,
  onUpdateSettings,
  onResetTodayQueue,
  onSeedDemoData,
}) => {
  const [formData, setFormData] = useState<ClinicSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute stats
  const totalTickets = tickets.length;
  const waitingTickets = tickets.filter((t) => t.status === 'waiting').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'calling' || t.status === 'in_consultation').length;
  const completedTickets = tickets.filter((t) => t.status === 'completed').length;
  const skippedTickets = tickets.filter((t) => t.status === 'skipped').length;

  const bpjsCount = tickets.filter((t) => t.patientCategory === 'BPJS').length;
  const umumCount = tickets.filter((t) => t.patientCategory === 'Umum').length;
  const asuransiCount = tickets.filter((t) => t.patientCategory === 'Asuransi').length;
  const priorityCount = tickets.filter((t) => t.priority === 'priority').length;

  // Average wait time in completed tickets
  const completedWithTimes = tickets.filter((t) => t.status === 'completed' && t.calledAt);
  const avgWaitMin = completedWithTimes.length > 0
    ? Math.round(
        completedWithTimes.reduce((acc, t) => {
          const diff = (new Date(t.calledAt!).getTime() - new Date(t.createdAt).getTime()) / 60000;
          return acc + Math.max(1, diff);
        }, 0) / completedWithTimes.length
      )
    : 14;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = [
      'Nomor Antrian',
      'Poli / Layanan',
      'Nama Pasien',
      'Kategori',
      'Prioritas',
      'Status',
      'Waktu Ambil Tiket',
      'Waktu Dipanggil',
      'Waktu Selesai',
      'Catatan Dokter'
    ];

    const rows = tickets.map((t) => {
      const serviceName = services.find((s) => s.id === t.serviceId)?.name || t.serviceId;
      return [
        `"${t.ticketNumber}"`,
        `"${serviceName}"`,
        `"${t.patientName}"`,
        `"${t.patientCategory}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${new Date(t.createdAt).toLocaleTimeString('id-ID')}"`,
        `"${t.calledAt ? new Date(t.calledAt).toLocaleTimeString('id-ID') : '-'}"`,
        `"${t.completedAt ? new Date(t.completedAt).toLocaleTimeString('id-ID') : '-'}"`,
        `"${(t.doctorNotes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-antrian-klinik-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-600">
            DASHBOARD MANAJEMEN KLINIK
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Rekap Antrian & Pengaturan Sistem
          </h1>
          <p className="text-xs text-slate-500">
            Analitik alur pelayanan pasien hari ini dan konfigurasi profil klinik & audio TV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Laporan (CSV)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Antrian Hari Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Pasien Terdaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono-numbers text-slate-900">
            {totalTickets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Hari ini · Termasuk farmasi & kasir
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Sedang Menunggu</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono-numbers text-amber-600">
            {waitingTickets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {inProgressTickets} sedang dalam pemeriksaan
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Selesai Dilayani</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono-numbers text-emerald-600">
            {completedTickets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {skippedTickets} pasien dilewati / absen
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Rerata Waktu Tunggu</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono-numbers text-sky-600">
            ~{avgWaitMin} <span className="text-base font-normal">menit</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Berdasarkan waktu panggil loket
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Breakdown per Poli */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Distribusi Antrian per Poliklinik</span>
            <span className="text-xs text-slate-400 font-normal">Hari Ini</span>
          </h3>

          <div className="space-y-4">
            {services.map((service) => {
              const count = tickets.filter((t) => t.serviceId === service.id).length;
              const percent = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
              const waiting = tickets.filter((t) => t.serviceId === service.id && t.status === 'waiting').length;

              return (
                <div key={service.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">
                      {service.name} ({service.code})
                    </span>
                    <span className="font-mono-numbers text-slate-600">
                      <strong>{count}</strong> pasien ({percent}%) · Menunggu: {waiting}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Kategori Penjamin:</span>
            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <span>BPJS: {bpjsCount}</span>
              <span aria-hidden="true">·</span>
              <span>Umum: {umumCount}</span>
              <span aria-hidden="true">·</span>
              <span>Asuransi: {asuransiCount}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700">Prioritas: {priorityCount}</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pengaturan Profil Klinik & Suara TV
              </h3>
            </div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Tersimpan
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Klinik / Puskesmas
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.clinicPhone}
                  onChange={(e) => setFormData({ ...formData, clinicPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teks Berjalan (Running Text Layar TV)
              </label>
              <textarea
                rows={2}
                value={formData.runningText}
                onChange={(e) => setFormData({ ...formData, runningText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Audio configuration */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Konfigurasi Audio Panggilan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Kecepatan Suara TTS: {formData.audioSpeechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.2"
                    step="0.05"
                    value={formData.audioSpeechRate}
                    onChange={(e) => setFormData({ ...formData, audioSpeechRate: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Volume Bel Nada: {Math.round(formData.audioBellVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={formData.audioBellVolume}
                    onChange={(e) => setFormData({ ...formData, audioBellVolume: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onSeedDemoData}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Muat Ulang Contoh Data Demo
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Reset Queue */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Mulai Antrian Hari Baru?
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tindakan ini akan mengarsipkan antrian hari ini dan me-reset nomor tiket untuk semua poliklinik kembali ke nomor 001. Anda tetap dapat mengekspor laporan CSV sebelum menghapus.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetTodayQueue();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Reset Antrian</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
