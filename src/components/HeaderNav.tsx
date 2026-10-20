import React from 'react';
import { Volume2, VolumeX, Tv, Printer, Stethoscope, Pill, BarChart3, Bell, UserPlus } from 'lucide-react';
import { ClinicSettings } from '../types/queue';

export type ActiveTab = 'tv' | 'kiosk' | 'doctor' | 'pharmacy' | 'settings';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  settings: ClinicSettings;
  onToggleAudio: () => void;
  onTestSound: () => void;
  isCallingActive?: boolean;
  onOpenRegisterModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  settings,
  onToggleAudio,
  onTestSound,
  isCallingActive,
  onOpenRegisterModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              +
            </div>
            <button
              onClick={() => onTabChange('tv')}
              className="text-left cursor-pointer group focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap block">
                {settings.clinicName}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap block">
                Sistem Antrian & Panggilan Pasien
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation tabs with single-line labels */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onTabChange('tv')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'tv'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Layar TV Antrian</span>
            </button>

            <button
              onClick={() => onTabChange('kiosk')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'kiosk'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Kiosk Mandiri Pasien</span>
            </button>

            <button
              onClick={() => onTabChange('doctor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'doctor'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Meja Dokter & Loket</span>
            </button>

            <button
              onClick={() => onTabChange('pharmacy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'pharmacy'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Farmasi & Kasir</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekap & Pengaturan</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary action (+ Tambah Pasien) and audio controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Pasien</span>
            </button>

            <button
              onClick={onTestSound}
              title="Uji Suara Bel & Panggilan Bahasa Indonesia"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-all ${
                isCallingActive ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tes Bel</span>
            </button>

            <button
              onClick={onToggleAudio}
              title={settings.audioVoiceEnabled ? 'Suara Panggilan Aktif' : 'Suara Panggilan Mati'}
              className={`p-2 rounded-lg border transition-colors ${
                settings.audioVoiceEnabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {settings.audioVoiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          <button
            onClick={onOpenRegisterModal}
            className="px-3 py-1 rounded text-xs whitespace-nowrap bg-emerald-600 text-white font-bold"
          >
            + Pasien
          </button>
          <button
            onClick={() => onTabChange('tv')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'tv' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Layar TV
          </button>
          <button
            onClick={() => onTabChange('kiosk')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'kiosk' ? 'bg-emerald-600 text-white' : 'text-slate-600'
            }`}
          >
            Kiosk Tiket
          </button>
          <button
            onClick={() => onTabChange('doctor')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'doctor' ? 'bg-emerald-600 text-white' : 'text-slate-600'
            }`}
          >
            Meja Dokter
          </button>
          <button
            onClick={() => onTabChange('pharmacy')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'pharmacy' ? 'bg-emerald-600 text-white' : 'text-slate-600'
            }`}
          >
            Farmasi
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-slate-600'
            }`}
          >
            Rekap
          </button>
        </div>
      </div>
    </header>
  );
};
