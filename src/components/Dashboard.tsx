
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface Device {
  id: string;
  name: string;
  phone_number: string | null;
  status: 'connected' | 'disconnected' | 'connecting';
  last_seen: string | null;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  device: {
    name: string;
  };
  target_groups: string[];
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    connectedDevices: 0,
    totalMessages: 0,
    scheduledMessages: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (devicesError) throw devicesError;

      // Fetch messages with device names
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          device:devices(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) throw messagesError;

      // Calculate stats
      const connectedDevices = devicesData?.filter(d => d.status === 'connected').length || 0;
      const totalMessages = messagesData?.filter(m => m.status === 'sent').length || 0;
      const scheduledMessages = messagesData?.filter(m => m.status === 'scheduled').length || 0;
      const successfulMessages = messagesData?.filter(m => m.status === 'sent').length || 0;
      const failedMessages = messagesData?.filter(m => m.status === 'failed').length || 0;
      const successRate = totalMessages > 0 ? (successfulMessages / (successfulMessages + failedMessages)) * 100 : 0;

      setDevices((devicesData || []) as Device[]);
      setMessages((messagesData || []) as Message[]);
      setStats({
        connectedDevices,
        totalMessages,
        scheduledMessages,
        successRate: Math.round(successRate * 10) / 10
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Carregando dispositivos...</p>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Nenhum dispositivo conectado</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('devices')}
                >
                  Conectar primeiro dispositivo
                </Button>
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Smartphone className="w-8 h-8 text-slate-600" />
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        device.status === 'connected' ? 'bg-green-500' :
                        device.status === 'connecting' ? 'bg-orange-500' : 
                        'bg-red-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{device.name}</p>
                      <p className="text-sm text-slate-500">{formatTimeAgo(device.last_seen)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.status === 'connected' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <Badge variant={device.status === 'connected' ? 'default' : 'secondary'} className="text-xs">
                      {device.status === 'connected' ? 'Online' : 
                       device.status === 'connecting' ? 'Conectando' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Carregando atividades...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Nenhuma mensagem ainda</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('messages')}
                >
                  Enviar primeira mensagem
                </Button>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      message.status === 'sent' ? 'bg-green-500' :
                      message.status === 'scheduled' ? 'bg-orange-500' :
                      message.status === 'pending' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900">{message.device?.name || 'Dispositivo desconhecido'}</p>
                      <p className="text-sm text-slate-500">{message.target_groups.length} grupos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        message.status === 'sent' ? 'default' : 
                        message.status === 'scheduled' ? 'secondary' : 
                        message.status === 'pending' ? 'outline' :
                        'destructive'
                      }
                      className="mb-1"
                    >
                      {message.status === 'sent' ? 'Enviada' : 
                       message.status === 'scheduled' ? 'Agendada' :
                       message.status === 'pending' ? 'Pendente' : 
                       'Falha'}
                    </Badge>
                    <p className="text-sm text-slate-500">
                      {message.status === 'sent' ? formatTime(message.sent_at) :
                       message.status === 'scheduled' ? formatTime(message.scheduled_for) :
                       formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
