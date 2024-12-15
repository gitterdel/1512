import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { Property, PropertyRequirements } from '../types';
import { usePropertyStore } from '../store/usePropertyStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PropertyRequirements as PropertyRequirementsComponent } from '../components/property/PropertyRequirements';

const comus = [
  'Andorra la Vella',
  'Santa Coloma',
  'La Margineda',
  'Escaldes-Engordany'
];

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const { addProperty } = usePropertyStore();
  const { user } = useAuthStore();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    type: 'house' as const,
    amenities: [] as string[],
    features: {
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      furnished: false,
      petsAllowed: false,
    },
    requirements: {
      deposit: 2,
      minStay: 6,
      documents: {
        payslips: true,
        bankGuarantee: false,
        idCard: true,
        employmentContract: true,
        taxReturns: false
      },
      otherRequirements: []
    } as PropertyRequirements
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (images.length === 0) {
      alert('Por favor, añade al menos una imagen de la propiedad');
      return;
    }

    if (!formData.location) {
      alert('Por favor, selecciona una ubicación');
      return;
    }

    try {
      const newProperty: Omit<Property, 'id' | 'createdAt'> = {
        ...formData,
        images,
        landlordId: user.id,
        status: 'available',
        views: 0,
        rating: 0,
        verified: false,
        hidden: false
      };

      await addProperty(newProperty);
      navigate('/landlord/dashboard');
    } catch (error) {
      console.error('Error al crear la propiedad:', error);
      alert('Hubo un error al crear la propiedad. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Publicar Nueva Propiedad</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título del Anuncio"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecciona un comú</option>
                {comus.map(comu => (
                  <option key={comu} value={comu}>{comu}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Propiedad
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'house' | 'room' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="house">Casa completa</option>
                <option value="room">Habitación</option>
              </select>
            </div>
            <Input
              label="Precio Mensual (€)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              min="0"
              required
            />
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
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
            </label>
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Características */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Dormitorios"
              type="number"
              value={formData.features.bedrooms}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  bedrooms: Number(e.target.value)
                }
              }))}
              min="1"
            />
            <Input
              label="Baños"
              type="number"
              value={formData.features.bathrooms}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  bathrooms: Number(e.target.value)
                }
              }))}
              min="1"
            />
            <Input
              label="Tamaño (m²)"
              type="number"
              value={formData.features.size}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                features: {
                  ...prev.features,
                  size: Number(e.target.value)
                }
              }))}
              min="0"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.furnished}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    furnished: e.target.checked
                  }
                }))}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Amueblado</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.features.petsAllowed}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    petsAllowed: e.target.checked
                  }
                }))}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Se permiten mascotas</span>
            </label>
          </div>
        </div>

        {/* Requisitos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PropertyRequirementsComponent
            requirements={formData.requirements}
            isEditing={true}
            onUpdate={(requirements) => setFormData(prev => ({
              ...prev,
              requirements
            }))}
          />
        </div>

        {/* Descripción */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Descripción</h2>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
            onClick={() => navigate('/landlord/dashboard')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Publicar Propiedad
          </Button>
        </div>
      </form>
    </div>
  );
};