/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { TvDisplayView } from './components/TvDisplayView';
import { KioskTicketView } from './components/KioskTicketView';
import { DoctorCounterView } from './components/DoctorCounterView';
import { PharmacyCashierView } from './components/PharmacyCashierView';
import { AnalyticsSettingsView } from './components/AnalyticsSettingsView';
import { QuickRegisterModal } from './components/QuickRegisterModal';
import { INITIAL_SERVICES, INITIAL_SETTINGS, INITIAL_TICKETS } from './data/initialData';
import { Ticket, ClinicSettings, CallEvent, ServiceConfig, ServiceId } from './types/queue';
import { announceQueueCall, playChime } from './services/soundService';

const STORAGE_KEYS = {
  TICKETS: 'medika_clinic_tickets_v1',
  SETTINGS: 'medika_clinic_settings_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tv');
  const [services] = useState<ServiceConfig[]>(INITIAL_SERVICES);

  // Load saved tickets or initial seed
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_TICKETS;
  });

  // Load saved settings or initial settings
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SETTINGS;
  });

  // Currently active announcement for TV spotlight
  const [activeCall, setActiveCall] = useState<CallEvent | null>(() => {
    const active = INITIAL_TICKETS.find((t) => t.status === 'calling' || t.status === 'in_consultation');
    if (active) {
      const s = INITIAL_SERVICES.find((serv) => serv.id === active.serviceId);
      return {
        ticketNumber: active.ticketNumber,
        serviceName: s ? s.name : 'Poli Umum',
        roomName: s ? s.roomName : 'Ruang Periksa 1',
        counterNumber: active.counterNumber,
        patientName: active.patientName,
        timestamp: new Date().toISOString(),
      };
    }
    return null;
  });

  const [isCallingAudioActive, setIsCallingAudioActive] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [quickRegisterServiceId, setQuickRegisterServiceId] = useState<ServiceId>('umum');

  const handleOpenRegisterModal = (serviceId?: ServiceId) => {
    if (serviceId) {
      setQuickRegisterServiceId(serviceId);
    }
    setIsRegisterModalOpen(true);
  };

  // Sync tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch {
      // Ignore
    }
  }, [tickets]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Add new ticket from Kiosk
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [...prev, newTicket]);
    // Optional gentle chime on kiosk ticket print
    playChime(0.2);
  };

  // Call / Announce ticket
  const handleCallTicket = async (ticket: Ticket) => {
    const service = services.find((s) => s.id === ticket.serviceId);
    const serviceName = service ? service.name : 'Poli';
    const roomName = service ? service.roomName : 'Ruangan';

    const now = new Date().toISOString();

    // Update ticket state to calling
    setTickets((prev) =>
      prev.map((t) => {
        // If same service was calling another patient, complete or keep
        if (t.id === ticket.id) {
          return {
            ...t,
            status: 'calling',
            calledAt: now,
          };
        }
        return t;
      })
    );

    // Update active call billboard
    setActiveCall({
      ticketNumber: ticket.ticketNumber,
      serviceName,
      roomName,
      counterNumber: ticket.counterNumber,
      patientName: ticket.patientName,
      timestamp: now,
    });

    // Sound & Indonesian voice announcement
    if (settings.audioVoiceEnabled) {
      setIsCallingAudioActive(true);
      try {
        await announceQueueCall({
          ticketNumber: ticket.ticketNumber,
          serviceName,
          roomName,
          patientName: ticket.patientName,
          speechRate: settings.audioSpeechRate,
          bellVolume: settings.audioBellVolume,
        });
      } finally {
        setTimeout(() => setIsCallingAudioActive(false), 2000);
      }
    }
  };

  // Update ticket status
  const handleUpdateTicketStatus = (ticketId: string, status: Ticket['status'], notes?: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            completedAt: status === 'completed' || status === 'skipped' ? now : t.completedAt,
            doctorNotes: notes !== undefined ? notes : t.doctorNotes,
          };
        }
        return t;
      })
    );
  };

  // Refer patient from Doctor examination to Pharmacy
  const handleReferToPharmacy = (ticket: Ticket, doctorNotes?: string) => {
    const now = new Date().toISOString();

    // Find sequence for pharmacy
    const pharmacyTickets = tickets.filter((t) => t.serviceId === 'farmasi');
    const lastSeq = pharmacyTickets.reduce((max, t) => Math.max(max, t.sequenceNumber), 0);
    const nextSeq = lastSeq + 1;
    const pharmacyNum = `E-${String(nextSeq).padStart(3, '0')}`;

    // Create new linked ticket in Farmasi
    const pharmacyTicket: Ticket = {
      id: `t-pharm-${Date.now()}`,
      ticketNumber: pharmacyNum,
      serviceId: 'farmasi',
      serviceCode: 'E',
      sequenceNumber: nextSeq,
      patientName: `${ticket.patientName} (Rujukan ${ticket.ticketNumber})`,
      patientCategory: ticket.patientCategory,
      priority: ticket.priority,
      status: 'waiting',
      createdAt: now,
      calledAt: null,
      completedAt: null,
      counterNumber: 5,
      doctorNotes: doctorNotes || ticket.doctorNotes,
    };

    // Update original ticket to completed with referral link
    setTickets((prev) => [
      ...prev.map((t) =>
        t.id === ticket.id
          ? {
              ...t,
              status: 'completed' as const,
              completedAt: now,
              doctorNotes: doctorNotes || t.doctorNotes,
              referredTo: 'farmasi' as const,
              referredPharmacyTicketNumber: pharmacyNum,
            }
          : t
      ),
      pharmacyTicket,
    ]);
  };

  // Test sound
  const handleTestSound = async () => {
    setIsCallingAudioActive(true);
    await announceQueueCall({
      ticketNumber: 'A-012',
      serviceName: 'Poli Umum',
      roomName: 'Ruang Periksa 1',
      speechRate: settings.audioSpeechRate,
      bellVolume: settings.audioBellVolume,
    });
    setIsCallingAudioActive(false);
  };

  // Toggle Audio
  const handleToggleAudio = () => {
    setSettings((prev) => ({
      ...prev,
      audioVoiceEnabled: !prev.audioVoiceEnabled,
    }));
  };

  // Reset Today Queue
  const handleResetTodayQueue = () => {
    setTickets([]);
    setActiveCall(null);
  };

  // Reload Seed Demo Data
  const handleSeedDemoData = () => {
    setTickets(INITIAL_TICKETS);
    const active = INITIAL_TICKETS.find((t) => t.status === 'calling' || t.status === 'in_consultation');
    if (active) {
      const s = INITIAL_SERVICES.find((serv) => serv.id === active.serviceId);
      setActiveCall({
        ticketNumber: active.ticketNumber,
        serviceName: s ? s.name : 'Poli Umum',
        roomName: s ? s.roomName : 'Ruang Periksa 1',
        counterNumber: active.counterNumber,
        patientName: active.patientName,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={settings}
        onToggleAudio={handleToggleAudio}
        onTestSound={handleTestSound}
        isCallingActive={isCallingAudioActive}
        onOpenRegisterModal={() => handleOpenRegisterModal()}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {activeTab === 'tv' && (
          <TvDisplayView
            services={services}
            tickets={tickets}
            settings={settings}
            activeCall={activeCall}
          />
        )}

        {activeTab === 'kiosk' && (
          <KioskTicketView
            services={services}
            tickets={tickets}
            settings={settings}
            onAddTicket={handleAddTicket}
          />
        )}

        {activeTab === 'doctor' && (
          <DoctorCounterView
            services={services}
            tickets={tickets}
            settings={settings}
            onCallTicket={handleCallTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onReferToPharmacy={handleReferToPharmacy}
            onOpenRegisterModal={handleOpenRegisterModal}
          />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyCashierView
            services={services}
            tickets={tickets}
            settings={settings}
            onCallTicket={handleCallTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        )}

        {activeTab === 'settings' && (
          <AnalyticsSettingsView
            services={services}
            tickets={tickets}
            settings={settings}
            onUpdateSettings={setSettings}
            onResetTodayQueue={handleResetTodayQueue}
            onSeedDemoData={handleSeedDemoData}
          />
        )}
      </main>

      {/* Quick Patient Registration Modal */}
      <QuickRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        services={services}
        tickets={tickets}
        onAddTicket={handleAddTicket}
        defaultServiceId={quickRegisterServiceId}
      />
    </div>
  );
}
