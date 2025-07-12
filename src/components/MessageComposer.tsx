
import React, { useState } from 'react';
import { 
  Send, 
  Calendar, 
  Paperclip, 
  Image, 
  FileText, 
  Users, 
  Smartphone,
  Clock,
  X,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Group {
  id: string;
  name: string;
  participants: number;
}

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  groups: Group[];
}

const MessageComposer = () => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Mock data
  const devices: Device[] = [
    {
      id: '1',
      name: 'iPhone Principal',
      status: 'online',
      groups: [
        { id: '1', name: 'Equipe Vendas', participants: 25 },
        { id: '2', name: 'Clientes Premium', participants: 120 },
        { id: '3', name: 'Marketing Digital', participants: 45 },
      ]
    },
    {
      id: '2',
      name: 'Android Vendas',
      status: 'online',
      groups: [
        { id: '4', name: 'Leads Qualificados', participants: 80 },
        { id: '5', name: 'Suporte Técnico', participants: 15 },
        { id: '6', name: 'Novos Clientes', participants: 200 },
      ]
    }
  ];

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!selectedDevice || selectedGroups.length === 0 || !message.trim()) {
      return;
    }

    // Aqui você implementaria o envio da mensagem
    console.log('Enviando mensagem:', {
      device: selectedDevice,
      groups: selectedGroups,
      message,
      scheduled: isScheduled,
      scheduleDate,
      scheduleTime,
      attachments
    });

    // Reset form
    setMessage('');
    setSelectedGroups([]);
    setAttachments([]);
    setScheduleDate('');
    setScheduleTime('');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Nova Mensagem</h2>
        <p className="text-slate-600 mt-1">Envie mensagens para múltiplos grupos de uma só vez</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Selection */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-whatsapp-600" />
                <span>Selecionar Dispositivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um dispositivo conectado" />
                </SelectTrigger>
                <SelectContent>
                  {devices.filter(d => d.status === 'online').map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{device.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Message Composer */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-whatsapp-600" />
                <span>Compor Mensagem</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="mt-1 resize-none"
                />
                <p className="text-sm text-slate-500 mt-2">{message.length} caracteres</p>
              </div>

              {/* Attachments */}
              <div>
                <Label>Anexos</Label>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="relative">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Anexar Arquivo
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                    </Button>
                    <p className="text-sm text-slate-500">Imagens, PDFs, Documentos</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file)}
                            <span className="text-sm text-slate-700">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                  />
                  <Label htmlFor="schedule">Agendar envio</Label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <Label htmlFor="schedule-date">Data</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Horário</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Selection */}
        <div className="space-y-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-whatsapp-600" />
                <span>Selecionar Grupos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDevice ? (
                <p className="text-slate-500 text-center py-8">
                  Selecione um dispositivo para ver os grupos disponíveis
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDeviceData?.groups.map(group => (
                    <div key={group.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Checkbox
                        id={group.id}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={group.id} className="font-medium cursor-pointer">
                          {group.name}
                        </Label>
                        <p className="text-sm text-slate-500">{group.participants} participantes</p>
                      </div>
                    </div>
                  ))}
                  
                  {selectedGroups.length > 0 && (
                    <div className="mt-4 p-3 bg-whatsapp-50 rounded-lg border border-whatsapp-200">
                      <p className="text-sm font-medium text-whatsapp-800">
                        {selectedGroups.length} grupo(s) selecionado(s)
                      </p>
                      <p className="text-sm text-whatsapp-600 mt-1">
                        Total de participantes: {
                          selectedDeviceData?.groups
                            .filter(g => selectedGroups.includes(g.id))
                            .reduce((sum, g) => sum + g.participants, 0)
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Button */}
          <Card className="border-none shadow-soft">
            <CardContent className="p-6">
              <Button
                onClick={handleSendMessage}
                disabled={!selectedDevice || selectedGroups.length === 0 || !message.trim()}
                className="w-full bg-whatsapp-500 hover:bg-whatsapp-600 text-white shadow-md"
                size="lg"
              >
                {isScheduled ? (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Agendar Mensagem
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Agora
                  </>
                )}
              </Button>
              
              {isScheduled && scheduleDate && scheduleTime && (
                <p className="text-sm text-slate-600 text-center mt-3">
                  Será enviada em {new Date(scheduleDate).toLocaleDateString('pt-BR')} às {scheduleTime}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;
