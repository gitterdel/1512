import React, { useState } from 'react';
import { Save, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useSaveStore } from '../store/useSaveStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { format } from 'date-fns';

export const SavePointManager: React.FC = () => {
  const { savePoints, createSavePoint, restorePoint, deleteSavePoint } = useSaveStore();
  const [newSaveName, setNewSaveName] = useState('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newSaveName.trim()) return;
    createSavePoint(newSaveName);
    setNewSaveName('');
  };

  const handleRestore = (id: string) => {
    setShowConfirm(id);
  };

  const confirmRestore = (id: string) => {
    restorePoint(id);
    setShowConfirm(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Puntos de Guardado</h2>

      {/* Create new save point */}
      <div className="flex space-x-2 mb-6">
        <Input
          value={newSaveName}
          onChange={(e) => setNewSaveName(e.target.value)}
          placeholder="Nombre del punto de guardado"
        />
        <Button
          onClick={handleCreate}
          disabled={!newSaveName.trim()}
          icon={<Save className="h-4 w-4" />}
        >
          Guardar
        </Button>
      </div>

      {/* Save points list */}
      <div className="space-y-4">
        {savePoints.map((savePoint) => (
          <div key={savePoint.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{savePoint.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(savePoint.date), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(savePoint.id)}
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  Restaurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSavePoint(savePoint.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Confirmation dialog */}
            {showConfirm === savePoint.id && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      ¿Estás seguro de que quieres restaurar este punto de guardado? 
                      Se perderán todos los cambios realizados después de este punto.
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => confirmRestore(savePoint.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {savePoints.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Save className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay puntos de guardado</p>
          </div>
        )}
      </div>
    </div>
  );
};