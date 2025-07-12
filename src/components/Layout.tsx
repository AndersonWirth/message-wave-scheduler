
import React from 'react';
import { MessageSquare, Smartphone, Calendar, Settings, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const Layout = ({ children, currentPage = 'dashboard', onPageChange }: LayoutProps) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'devices', name: 'Dispositivos', icon: Smartphone },
    { id: 'messages', name: 'Mensagens', icon: MessageSquare },
    { id: 'schedule', name: 'Agendamentos', icon: Calendar },
    { id: 'settings', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-whatsapp-gradient rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">WhatsApp Manager</h1>
                <p className="text-sm text-slate-500">Gerencie múltiplos dispositivos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                size="sm" 
                className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-md"
                onClick={() => onPageChange?.('new-message')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Mensagem
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange?.(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-whatsapp-50 text-whatsapp-700 border border-whatsapp-200 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-whatsapp-600' : 'text-slate-400'}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
