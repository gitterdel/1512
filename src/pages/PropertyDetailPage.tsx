import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PropertyDetails } from '../components/PropertyDetails';
import { usePropertyStore } from '../store/usePropertyStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSavedPropertiesStore } from '../store/useSavedPropertiesStore';
import { Button } from '../components/ui/Button';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { properties } = usePropertyStore();
  const { user } = useAuthStore();
  const { toggleSaved, isSaved } = useSavedPropertiesStore();
  
  const property = properties.find(p => p.id === id);
  const isPropertySaved = user && property ? isSaved(user.id, property.id) : false;

  // Check if we came from chat
  const { fromChat, chatId } = location.state || {};

  const handleBack = () => {
    if (fromChat && chatId) {
      navigate('/messages');
    } else {
      navigate(-1);
    }
  };

  const handleSaveProperty = () => {
    if (user && property) {
      toggleSaved(user.id, property.id);
    } else {
      navigate('/login');
    }
  };

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Propiedad no encontrada</h2>
          <p className="mt-2 text-gray-600">La propiedad que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {fromChat ? 'Volver al chat' : 'Volver a resultados'}
          </button>

          {user && (
            <Button
              onClick={handleSaveProperty}
              variant={isPropertySaved ? 'primary' : 'outline'}
            >
              {isPropertySaved ? 'Guardado' : 'Guardar'}
            </Button>
          )}
        </div>
        
        <PropertyDetails property={property} />
      </div>
    </div>
  );
};