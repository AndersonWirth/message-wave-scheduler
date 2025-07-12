import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppManagerHook {
  generateQRCode: (deviceId: string) => Promise<void>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  getDeviceStatus: (deviceId: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useWhatsAppManager = (): WhatsAppManagerHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callWhatsAppFunction = async (action: string, deviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action, deviceId }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (deviceId: string) => {
    await callWhatsAppFunction('generateQR', deviceId);
  };

  const disconnectDevice = async (deviceId: string) => {
    await callWhatsAppFunction('disconnect', deviceId);
  };

  const getDeviceStatus = async (deviceId: string) => {
    return await callWhatsAppFunction('getStatus', deviceId);
  };

  return {
    generateQRCode,
    disconnectDevice,
    getDeviceStatus,
    isLoading,
    error
  };
};