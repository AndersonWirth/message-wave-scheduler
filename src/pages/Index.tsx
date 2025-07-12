
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import DeviceManager from '@/components/DeviceManager';
import MessageComposer from '@/components/MessageComposer';
import Auth from '@/components/Auth';
import { Loader } from 'lucide-react';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'devices':
        return <DeviceManager />;
      case 'messages':
      case 'new-message':
        return <MessageComposer />;
      case 'schedule':
        return (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Agendamentos</h2>
            <p className="text-slate-600">Em desenvolvimento - Lista de mensagens agendadas</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Configurações</h2>
            <p className="text-slate-600">Em desenvolvimento - Configurações do sistema</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-whatsapp-500" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} user={user}>
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
