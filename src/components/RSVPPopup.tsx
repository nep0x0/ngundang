'use client';

import { useState } from 'react';
import { Guest, rsvpService, guestService } from '@/lib/supabase';

interface RSVPPopupProps {
  guest: Guest;
  onClose: () => void;
  onSubmit: () => void;
  onRSVPSuccess?: () => void; // Callback to refresh RSVP list
}

export default function RSVPPopup({ guest, onClose, onSubmit, onRSVPSuccess }: RSVPPopupProps) {
  const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir'>('hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Submit RSVP
      await rsvpService.create({
        guest_name: guest.name,
        attendance,
        guest_count: attendance === 'hadir' ? guestCount : 0,
        message: message.trim() || undefined,
        invitation_code: guest.invitation_code
      });

      // Update guest's RSVP status
      await guestService.update(guest.id, {
        rsvp_submitted: true
      });

      // Call callback to refresh RSVP list
      if (onRSVPSuccess) {
        onRSVPSuccess();
      }

      onSubmit();
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Terjadi kesalahan saat mengirim konfirmasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestName = guest.partner ? `${guest.name} & ${guest.partner}` : guest.name;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-slate-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">💌 Konfirmasi Kehadiran</h3>
              <p className="text-blue-100 text-sm">Halo {guestName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Apakah Anda akan hadir di acara pernikahan kami?
            </p>
          </div>

          {/* Attendance Selection */}
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="attendance"
                value="hadir"
                checked={attendance === 'hadir'}
                onChange={(e) => setAttendance(e.target.value as 'hadir')}
                className="w-4 h-4 text-blue-600 mr-3"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <span className="font-medium text-gray-800">✅ Ya, saya akan hadir</span>
                <p className="text-sm text-gray-500">Saya akan menghadiri acara</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
              <input
                type="radio"
                name="attendance"
                value="tidak_hadir"
                checked={attendance === 'tidak_hadir'}
                onChange={(e) => setAttendance(e.target.value as 'tidak_hadir')}
                className="w-4 h-4 text-slate-600 mr-3"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <span className="font-medium text-gray-800">❌ Maaf, saya tidak dapat hadir</span>
                <p className="text-sm text-gray-500">Saya berhalangan hadir</p>
              </div>
            </label>
          </div>

          {/* Guest Count (only if attending) */}
          {attendance === 'hadir' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah tamu yang akan hadir
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                disabled={isSubmitting}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} orang
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan untuk pengantin (opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Selamat untuk kalian berdua..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-slate-600 text-white rounded-xl hover:from-blue-600 hover:to-slate-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Mengirim...
                </div>
              ) : (
                'Konfirmasi Kehadiran'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
