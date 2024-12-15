import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface SavePoint {
  id: string;
  name: string;
  date: string;
  data: any;
}

interface SaveState {
  savePoints: SavePoint[];
  currentSavePoint: string | null;
  createSavePoint: (name: string) => void;
  restorePoint: (id: string) => void;
  deleteSavePoint: (id: string) => void;
  getSavePoint: (id: string) => SavePoint | undefined;
}

export const useSaveStore = create<SaveState>()(
  persist(
    (set, get) => ({
      savePoints: [],
      currentSavePoint: null,

      createSavePoint: (name) => {
        try {
          const savePoint: SavePoint = {
            id: Date.now().toString(),
            name,
            date: new Date().toISOString(),
            data: {
              // Capturar el estado actual de otros stores
              auth: localStorage.getItem('auth-storage'),
              properties: localStorage.getItem('property-storage'),
              chat: localStorage.getItem('chat-storage'),
              saved: localStorage.getItem('saved-properties-storage'),
            }
          };

          set(state => ({
            savePoints: [...state.savePoints, savePoint],
            currentSavePoint: savePoint.id
          }));

          toast.success('Punto de guardado creado');
        } catch (error) {
          console.error('Error creating save point:', error);
          toast.error('Error al crear punto de guardado');
        }
      },

      restorePoint: (id) => {
        try {
          const savePoint = get().savePoints.find(sp => sp.id === id);
          if (!savePoint) {
            throw new Error('Punto de guardado no encontrado');
          }

          // Restaurar el estado de cada store
          Object.entries(savePoint.data).forEach(([key, value]) => {
            if (value) {
              localStorage.setItem(`${key}-storage`, value as string);
            }
          });

          set({ currentSavePoint: id });
          
          // Forzar recarga para aplicar los cambios
          window.location.reload();
        } catch (error) {
          console.error('Error restoring save point:', error);
          toast.error('Error al restaurar punto de guardado');
        }
      },

      deleteSavePoint: (id) => {
        try {
          set(state => ({
            savePoints: state.savePoints.filter(sp => sp.id !== id),
            currentSavePoint: state.currentSavePoint === id ? null : state.currentSavePoint
          }));

          toast.success('Punto de guardado eliminado');
        } catch (error) {
          console.error('Error deleting save point:', error);
          toast.error('Error al eliminar punto de guardado');
        }
      },

      getSavePoint: (id) => {
        return get().savePoints.find(sp => sp.id === id);
      }
    }),
    {
      name: 'save-points-storage',
      version: 1
    }
  )
);