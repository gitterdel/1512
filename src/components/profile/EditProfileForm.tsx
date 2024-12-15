import React, { useState } from 'react';
import { User } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

interface EditProfileFormProps {
  user: User;
  onClose: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onClose }) => {
  const { updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user.name,
    location: user.location || '',
    phone: user.phone || '',
    bio: user.bio || '',
    ...(user.role === 'tenant' ? {
      employmentStatus: user.tenantInfo?.employmentStatus || 'employed',
      workplace: user.tenantInfo?.workplace || '',
      monthlyIncome: user.tenantInfo?.monthlyIncome || 0,
      hasPets: user.tenantInfo?.hasPets || false,
      smoker: user.tenantInfo?.smoker || false,
      preferredMoveInDate: user.tenantInfo?.preferredMoveInDate || new Date()
    } : {})
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(user.id, {
        ...formData,
        ...(user.role === 'tenant' ? {
          tenantInfo: {
            ...user.tenantInfo,
            employmentStatus: formData.employmentStatus,
            workplace: formData.workplace,
            monthlyIncome: formData.monthlyIncome,
            hasPets: formData.hasPets,
            smoker: formData.smoker,
            preferredMoveInDate: formData.preferredMoveInDate
          }
        } : {})
      });
      toast.success('Perfil actualizado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        label="Ubicación"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      />

      <Input
        label="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Biografía
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {user.role === 'tenant' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Situación Laboral
            </label>
            <select
              value={formData.employmentStatus}
              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="employed">Empleado</option>
              <option value="self_employed">Autónomo</option>
              <option value="student">Estudiante</option>
              <option value="unemployed">En búsqueda</option>
            </select>
          </div>

          {formData.employmentStatus === 'employed' && (
            <Input
              label="Empresa"
              value={formData.workplace}
              onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
            />
          )}

          <Input
            label="Ingresos Mensuales"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
          />

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasPets}
                onChange={(e) => setFormData({ ...formData, hasPets: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2">Tiene mascotas</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.smoker}
                onChange={(e) => setFormData({ ...formData, smoker: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2">Fumador</span>
            </label>
          </div>

          <Input
            label="Fecha preferida de mudanza"
            type="date"
            value={formData.preferredMoveInDate.toString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, preferredMoveInDate: new Date(e.target.value) })}
          />
        </>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};