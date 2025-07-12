import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  Wifi, 
  WifiOff, 
  QrCode, 
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Device {
  id: string;
  name: string;
  phone_number: string | null;
  status: 'connected' | 'disconnected' | 'connecting';
  last_seen: string | null;
  qr_code: string | null;
  created_at: string;
}

const DeviceManager = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [addingDevice, setAddingDevice] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDevices((data || []) as Device[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dispositivos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!deviceName.trim()) return;

    setAddingDevice(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('devices')
        .insert({
          name: deviceName.trim(),
          status: 'connecting',
          qr_code: 'pending',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Dispositivo adicionado",
        description: "Use o QR Code para conectar o dispositivo.",
      });

      setDevices([data as Device, ...devices]);
      setDeviceName('');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar dispositivo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingDevice(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.id !== deviceId));
      
      toast({
        title: "Dispositivo removido",
        description: "O dispositivo foi desconectado e removido.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover dispositivo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRefreshDevice = async (deviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .update({ qr_code: 'pending', status: 'connecting' })
        .eq('id', deviceId)
        .select()
        .single();

      if (error) throw error;

      setDevices(devices.map(d => d.id === deviceId ? data as Device : d));
      
      toast({
        title: "QR Code renovado",
        description: "Um novo QR Code foi gerado para conexão.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao renovar QR Code",
        description: error.message,
        variant: "destructive",
      });
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dispositivos</h2>
          <p className="text-slate-600 mt-1">Gerencie seus dispositivos WhatsApp conectados</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Conectados</CardTitle>
            <Wifi className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {devices.filter(d => d.status === 'connected').length}
            </div>
            <p className="text-xs text-green-600 mt-1">Dispositivos online</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Conectando</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {devices.filter(d => d.status === 'connecting').length}
            </div>
            <p className="text-xs text-orange-600 mt-1">Aguardando conexão</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Desconectados</CardTitle>
            <WifiOff className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {devices.filter(d => d.status === 'disconnected').length}
            </div>
            <p className="text-xs text-red-600 mt-1">Dispositivos offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-whatsapp-500" />
          <p className="text-slate-500">Carregando dispositivos...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum dispositivo conectado</h3>
          <p className="text-slate-500 mb-6">Adicione seu primeiro dispositivo WhatsApp para começar a enviar mensagens.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Dispositivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="device-name">Nome do Dispositivo</Label>
                  <Input
                    id="device-name"
                    placeholder="Ex: iPhone Principal, Android Vendas..."
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddDevice}
                    disabled={!deviceName.trim() || addingDevice}
                    className="flex-1 bg-whatsapp-500 hover:bg-whatsapp-600"
                  >
                    {addingDevice && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar Dispositivo
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-6">
          {devices.map((device) => (
            <Card key={device.id} className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Smartphone className="w-10 h-10 text-slate-600" />
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        device.status === 'connected' ? 'bg-green-500' :
                        device.status === 'connecting' ? 'bg-orange-500' : 
                        'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{device.name}</h3>
                      {device.phone_number && (
                        <p className="text-slate-600">{device.phone_number}</p>
                      )}
                      <p className="text-sm text-slate-500">
                        Último acesso: {formatTimeAgo(device.last_seen)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Adicionado em {new Date(device.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {device.status === 'connected' ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : device.status === 'connecting' ? (
                      <Clock className="w-5 h-5 text-orange-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                    
                    <Badge 
                      variant={
                        device.status === 'connected' ? 'default' : 
                        device.status === 'connecting' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {device.status === 'connected' ? 'Conectado' : 
                       device.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  {device.status !== 'connected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRefreshDevice(device.id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reconectar
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>

                {/* QR Code Section */}
                {device.qr_code && device.status !== 'connected' && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <QrCode className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Escaneie para conectar</span>
                    </div>
                    {device.qr_code === 'pending' ? (
                      <div className="bg-white p-8 rounded-lg text-center">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-whatsapp-500" />
                        <p className="text-sm text-slate-500">Gerando QR Code...</p>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-lg inline-block">
                        <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-slate-400" />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Abra o WhatsApp no dispositivo e escaneie este código
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Device Button for when there are existing devices */}
      {devices.length > 0 && (
        <div className="mt-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Dispositivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="device-name">Nome do Dispositivo</Label>
                  <Input
                    id="device-name"
                    placeholder="Ex: iPhone Principal, Android Vendas..."
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddDevice}
                    disabled={!deviceName.trim() || addingDevice}
                    className="flex-1 bg-whatsapp-500 hover:bg-whatsapp-600"
                  >
                    {addingDevice && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar Dispositivo
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;