
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import DeviceManager from '@/components/DeviceManager';
import MessageComposer from '@/components/MessageComposer';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
