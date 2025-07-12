
import React, { useState } from 'react';
import { 
  Smartphone, 
  Plus, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Trash2, 
  Edit3,
  RefreshCw,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  lastSeen: string;
  phoneNumber: string;
  groups: number;
  messagesCount: number;
}

const DeviceManager = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone Principal',
      status: 'online',
      lastSeen: 'Agora',
      phoneNumber: '+55 11 99999-9999',
      groups: 12,
      messagesCount: 1024
    },
    {
      id: '2',
      name: 'Android Vendas',
      status: 'online',
      lastSeen: '2 min atrás',
      phoneNumber: '+55 11 88888-8888',
      groups: 8,
      messagesCount: 567
    },
    {
      id: '3',
      name: 'Samsung Marketing',
      status: 'offline',
      lastSeen: '1 hora atrás',
      phoneNumber: '+55 11 77777-7777',
      groups: 15,
      messagesCount: 342
    }
  ]);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectDevice = () => {
    if (!newDeviceName.trim()) return;
    
    setIsConnecting(true);
    // Simular conexão
    setTimeout(() => {
      const newDevice: Device = {
        id: Date.now().toString(),
        name: newDeviceName,
        status: 'connecting',
        lastSeen: 'Conectando...',
        phoneNumber: 'Aguardando...',
        groups: 0,
        messagesCount: 0
      };
      
      setDevices(prev => [...prev, newDevice]);
      setNewDeviceName('');
      setIsConnecting(false);
      setShowQRDialog(false);
      
      // Simular que conectou após alguns segundos
      setTimeout(() => {
        setDevices(prev => prev.map(d => 
          d.id === newDevice.id 
            ? { ...d, status: 'online' as const, lastSeen: 'Agora', phoneNumber: '+55 11 66666-6666' }
            : d
        ));
      }, 3000);
    }, 2000);
  };

  const handleDisconnectDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const getStatusIcon = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'connecting':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Conectando</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dispositivos</h2>
          <p className="text-slate-600 mt-1">Gerencie seus dispositivos WhatsApp conectados</p>
        </div>
        
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogTrigger asChild>
            <Button className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Conectar Dispositivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-whatsapp-600" />
                <span>Conectar Novo Dispositivo</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Nome do Dispositivo</Label>
                <Input
                  id="device-name"
                  placeholder="Ex: iPhone Vendas"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              {/* QR Code Mockup */}
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="w-48 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  {isConnecting ? (
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-whatsapp-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Conectando...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">QR Code aparecerá aqui</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm text-slate-600 max-w-xs">
                  <p className="mb-2">1. Abra o WhatsApp no seu celular</p>
                  <p className="mb-2">2. Vá em Configurações → Aparelhos conectados</p>
                  <p>3. Escaneie o QR Code acima</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleConnectDevice}
                  disabled={!newDeviceName.trim() || isConnecting}
                  className="flex-1 bg-whatsapp-500 hover:bg-whatsapp-600"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Gerar QR Code
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Dispositivos Online</p>
                <p className="text-2xl font-bold text-green-900">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Conectando</p>
                <p className="text-2xl font-bold text-orange-900">
                  {devices.filter(d => d.status === 'connecting').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Offline</p>
                <p className="text-2xl font-bold text-red-900">
                  {devices.filter(d => d.status === 'offline').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Smartphone className="w-8 h-8 text-slate-600" />
                    <div className={`absolute -top-1 -right-1 status-dot ${device.status}`}></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-slate-500">{device.phoneNumber}</p>
                  </div>
                </div>
                {getStatusBadge(device.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Users className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">Grupos</p>
                  <p className="font-semibold text-slate-900">{device.groups}</p>
                </div>
                
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">Mensagens</p>
                  <p className="font-semibold text-slate-900">{device.messagesCount}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  {getStatusIcon(device.status)}
                  <span>Último acesso: {device.lastSeen}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDisconnectDevice(device.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card className="border-none shadow-soft">
          <CardContent className="text-center py-12">
            <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum dispositivo conectado</h3>
            <p className="text-slate-500 mb-6">Conecte seu primeiro dispositivo WhatsApp para começar</p>
            <Button 
              onClick={() => setShowQRDialog(true)}
              className="bg-whatsapp-500 hover:bg-whatsapp-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Conectar Primeiro Dispositivo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceManager;
