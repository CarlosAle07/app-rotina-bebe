'use client';

import { useState } from 'react';
import { Baby, AppSettings } from '@/lib/types';
import { saveBaby, deleteBaby, deleteAllEvents, saveSettings, exportData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trash2, Download, AlertTriangle } from 'lucide-react';

interface ConfiguracoesProps {
  baby: Baby;
  settings: AppSettings;
  onUpdate: () => void;
}

export default function Configuracoes({ baby, settings, onUpdate }: ConfiguracoesProps) {
  const [editedBaby, setEditedBaby] = useState<Baby>(baby);
  const [editedSettings, setEditedSettings] = useState<AppSettings>(settings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveBaby = () => {
    saveBaby(editedBaby);
    onUpdate();
    alert('Informações atualizadas!');
  };

  const handleSaveSettings = () => {
    saveSettings(editedSettings);
    onUpdate();
    alert('Configurações salvas!');
  };

  const handleDeleteAll = () => {
    if (showDeleteConfirm) {
      deleteBaby();
      deleteAllEvents();
      onUpdate();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotina-bebe-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Bebê</CardTitle>
          <CardDescription>Edite os dados cadastrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={editedBaby.name}
              onChange={(e) => setEditedBaby({ ...editedBaby, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-birthDate">Data de nascimento</Label>
            <Input
              id="edit-birthDate"
              type="date"
              value={editedBaby.birthDate}
              onChange={(e) => setEditedBaby({ ...editedBaby, birthDate: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-weight">Peso (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={editedBaby.weight || ''}
                onChange={(e) => setEditedBaby({ ...editedBaby, weight: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-height">Altura (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                step="0.1"
                value={editedBaby.height || ''}
                onChange={(e) => setEditedBaby({ ...editedBaby, height: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleSaveBaby} className="w-full">
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure lembretes automáticos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled" className="cursor-pointer">
              Ativar notificações
            </Label>
            <Switch
              id="notifications-enabled"
              checked={editedSettings.notifications.enabled}
              onCheckedChange={(checked) =>
                setEditedSettings({
                  ...editedSettings,
                  notifications: { ...editedSettings.notifications, enabled: checked },
                })
              }
            />
          </div>

          {editedSettings.notifications.enabled && (
            <>
              <div>
                <Label htmlFor="feeding-interval">Intervalo de alimentação (minutos)</Label>
                <Input
                  id="feeding-interval"
                  type="number"
                  value={editedSettings.notifications.feedingInterval || 180}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      notifications: {
                        ...editedSettings.notifications,
                        feedingInterval: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sleep-interval">Intervalo de sono (minutos)</Label>
                <Input
                  id="sleep-interval"
                  type="number"
                  value={editedSettings.notifications.sleepInterval || 120}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      notifications: {
                        ...editedSettings.notifications,
                        sleepInterval: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1"
                />
              </div>
            </>
          )}

          <Button onClick={handleSaveSettings} className="w-full">
            Salvar configurações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
          <CardDescription>Exporte ou exclua seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Exportar dados
          </Button>

          <Button
            onClick={handleDeleteAll}
            variant={showDeleteConfirm ? 'destructive' : 'outline'}
            className="w-full"
            size="lg"
          >
            {showDeleteConfirm ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Clique novamente para confirmar
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir todos os dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
