
import React from 'react';
import { 
  Smartphone, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  // Mock data
  const stats = {
    connectedDevices: 3,
    totalMessages: 1247,
    scheduledMessages: 8,
    successRate: 98.5
  };

  const recentDevices = [
    { id: 1, name: 'iPhone Principal', status: 'online', lastSeen: 'Agora' },
    { id: 2, name: 'Android Vendas', status: 'online', lastSeen: '2 min atrás' },
    { id: 3, name: 'Samsung Marketing', status: 'offline', lastSeen: '1 hora atrás' },
  ];

  const recentMessages = [
    { id: 1, device: 'iPhone Principal', groups: 5, status: 'sent', time: '14:30' },
    { id: 2, device: 'Android Vendas', groups: 12, status: 'scheduled', time: '15:00' },
    { id: 3, device: 'Samsung Marketing', groups: 3, status: 'failed', time: '13:45' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-1">Visão geral dos seus dispositivos e mensagens</p>
        </div>
        
        <Button 
          onClick={() => onNavigate('devices')} 
          className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Conectar Dispositivo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-soft bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Dispositivos Conectados</CardTitle>
            <Smartphone className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.connectedDevices}</div>
            <p className="text-xs text-blue-600 mt-1">+1 desde ontem</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-whatsapp-50 to-whatsapp-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-whatsapp-800">Mensagens Enviadas</CardTitle>
            <MessageCircle className="h-5 w-5 text-whatsapp-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-whatsapp-900">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-whatsapp-600 mt-1">+127 hoje</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Agendadas</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.scheduledMessages}</div>
            <p className="text-xs text-orange-600 mt-1">Próximas 24h</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.successRate}%</div>
            <p className="text-xs text-green-600 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dispositivos Recentes */}
        <Card className="border-none shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Dispositivos</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('devices')}
                className="text-whatsapp-600 hover:text-whatsapp-700"
              >
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Smartphone className="w-8 h-8 text-slate-600" />
                    <div className={`absolute -top-1 -right-1 status-dot ${device.status}`}></div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{device.name}</p>
                    <p className="text-sm text-slate-500">{device.lastSeen}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {device.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={device.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                    {device.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mensagens Recentes */}
        <Card className="border-none shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('messages')}
                className="text-whatsapp-600 hover:text-whatsapp-700"
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    message.status === 'sent' ? 'bg-green-500' :
                    message.status === 'scheduled' ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900">{message.device}</p>
                    <p className="text-sm text-slate-500">{message.groups} grupos</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={message.status === 'sent' ? 'default' : message.status === 'scheduled' ? 'secondary' : 'destructive'}
                    className="mb-1"
                  >
                    {message.status === 'sent' ? 'Enviada' : 
                     message.status === 'scheduled' ? 'Agendada' : 'Falha'}
                  </Badge>
                  <p className="text-sm text-slate-500">{message.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
