import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { toast } from 'react-hot-toast';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  
  if (!user) {
    navigate('/login');
    return null;
  }

  const [formData, setFormData] = useState({
    name: user.name || '',
    location: user.location || '',
    phone: user.phone || '',
    bio: user.bio || '',
    ...(user.role === 'tenant' ? {
      employmentStatus: user.tenantInfo?.employmentStatus || 'employed',
      workplace: user.tenantInfo?.workplace || '',
      monthlyIncome: user.tenantInfo?.monthlyIncome || 2000,
      hasPets: user.tenantInfo?.hasPets || false,
      smoker: user.tenantInfo?.smoker || false,
      preferredMoveInDate: user.tenantInfo?.preferredMoveInDate ? 
        new Date(user.tenantInfo.preferredMoveInDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    } : {})
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar nombre
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        toast.error('El nombre es obligatorio');
        return;
      }

      if (trimmedName.length < 2) {
        toast.error('El nombre debe tener al menos 2 caracteres');
        return;
      }

      // Validar ubicación
      const trimmedLocation = formData.location.trim();
      if (!trimmedLocation) {
        toast.error('La ubicación es obligatoria');
        return;
      }

      // Validar que la ubicación solo contenga letras, espacios, apóstrofes y guiones
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedLocation)) {
        toast.error('La ubicación solo puede contener letras, espacios, apóstrofes y guiones');
        return;
      }

      const updateData: Partial<User> = {
        name: trimmedName,
        location: trimmedLocation,
        phone: formData.phone,
        bio: formData.bio.trim()
      };

      if (user.role === 'tenant') {
        const monthlyIncome = Number(formData.monthlyIncome);
        if (isNaN(monthlyIncome) || monthlyIncome < 0) {
          toast.error('Por favor, introduce unos ingresos mensuales válidos');
          return;
        }

        updateData.tenantInfo = {
          ...user.tenantInfo,
          employmentStatus: formData.employmentStatus as 'employed' | 'self_employed' | 'student' | 'unemployed',
          workplace: formData.workplace.trim(),
          monthlyIncome: monthlyIncome,
          hasPets: formData.hasPets,
          smoker: formData.smoker,
          preferredMoveInDate: new Date(formData.preferredMoveInDate),
          residencyStatus: user.tenantInfo?.residencyStatus || 'resident',
          documents: user.tenantInfo?.documents || {
            residencyPermit: false,
            employmentContract: false,
            bankStatements: false
          }
        };
      }

      await updateUser(user.id, updateData);
      toast.success('Perfil actualizado correctamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold mt-4">Editar Perfil</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength={2}
              placeholder="Tu nombre completo"
            />

            <Input
              label="Ubicación"
              value={formData.location}
              onChange={(e) => {
                // Solo permitir letras, espacios, apóstrofes y guiones
                const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
                setFormData({ ...formData, location: value });
              }}
              placeholder="Ej: Andorra la Vella, La Massana..."
              required
            />

            <PhoneInput
              label="Teléfono"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Cuéntanos sobre ti..."
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    placeholder="Nombre de la empresa"
                  />
                )}

                <Input
                  label="Ingresos Mensuales (€)"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                  min="0"
                  step="100"
                  placeholder="Ingresos mensuales"
                />

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasPets}
                      onChange={(e) => setFormData({ ...formData, hasPets: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Tiene mascotas</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smoker}
                      onChange={(e) => setFormData({ ...formData, smoker: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Fumador</span>
                  </label>
                </div>

                <Input
                  label="Fecha preferida de mudanza"
                  type="date"
                  value={formData.preferredMoveInDate}
                  onChange={(e) => setFormData({ ...formData, preferredMoveInDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};