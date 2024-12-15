import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePropertyStore } from '../store/usePropertyStore';
import { useAuthStore } from '../store/useAuthStore';
import { Property } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, updateProperty } = usePropertyStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Property | null>(null);

  useEffect(() => {
    const property = properties.find(p => p.id === id);
    if (!property) {
      navigate('/dashboard/landlord');
      return;
    }

    if (property.landlordId !== user?.id) {
      navigate('/dashboard/landlord');
      return;
    }

    setFormData(property);
  }, [id, properties, user, navigate]);

  if (!formData) {
    return <LoadingSpinner />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    updateProperty(formData.id, formData);
    navigate('/dashboard/landlord');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        images: [...prev.images, ...newImages]
      };
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Propiedad</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Imágenes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Propiedad ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="images"
            />
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">
                Haz clic para subir o arrastra las imágenes aquí
              </span>
              <span className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF hasta 10MB
              </span>
            </label>
          </div>
        </div>

        {/* Información Básica */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título del Anuncio"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Precio Mensual (€)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecciona un comú</option>
                <option value="Andorra la Vella">Andorra la Vella</option>
                <option value="Santa Coloma">Santa Coloma</option>
                <option value="La Margineda">La Margineda</option>
                <option value="Escaldes-Engordany">Escaldes-Engordany</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Propiedad
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'house' | 'room' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="house">Casa completa</option>
                <option value="room">Habitación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Dormitorios"
              type="number"
              value={formData.features?.bedrooms || 0}
              onChange={(e) => setFormData({
                ...formData,
                features: {
                  ...formData.features,
                  bedrooms: Number(e.target.value)
                }
              })}
              min="0"
            />
            <Input
              label="Baños"
              type="number"
              value={formData.features?.bathrooms || 0}
              onChange={(e) => setFormData({
                ...formData,
                features: {
                  ...formData.features,
                  bathrooms: Number(e.target.value)
                }
              })}
              min="0"
            />
            <Input
              label="Tamaño (m²)"
              type="number"
              value={formData.features?.size || 0}
              onChange={(e) => setFormData({
                ...formData,
                features: {
                  ...formData.features,
                  size: Number(e.target.value)
                }
              })}
              min="0"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features?.furnished}
                onChange={(e) => setFormData({
                  ...formData,
                  features: {
                    ...formData.features,
                    furnished: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Amueblado</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features?.petsAllowed}
                onChange={(e) => setFormData({
                  ...formData,
                  features: {
                    ...formData.features,
                    petsAllowed: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Se permiten mascotas</span>
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Descripción</h2>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe tu propiedad en detalle..."
            required
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard/landlord')}
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
    </div>
  );
};