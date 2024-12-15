import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Home as HomeIcon, Bath, BedDouble, MessageSquare,
  Shield, Check
} from 'lucide-react';
import { Property } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Button } from './ui/Button';
import { formatPrice } from '../utils/format';
import { PropertyStatusBadge } from './PropertyStatusBadge';
import { Avatar } from './ui/Avatar';
import { PropertyRequirements } from './property/PropertyRequirements';

interface PropertyDetailsProps {
  property: Property;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const navigate = useNavigate();
  const { user, registeredUsers } = useAuthStore();
  const { createChat } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!property) return null;

  const landlord = property.landlordId ? registeredUsers[property.landlordId] : null;
  const isLandlord = user?.id === property.landlordId;

  const handleContactOwner = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!property.landlordId) {
      console.error('Landlord ID not found');
      return;
    }

    const chatId = createChat({
      participants: [user.id, property.landlordId],
      propertyId: property.id,
    });

    navigate('/messages');
  };

  const handleRequirementsUpdate = (requirements: any) => {
    // Aquí iría la lógica para actualizar los requisitos
    console.log('Actualizando requisitos:', requirements);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Main Image */}
        <div className="md:col-span-8">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-[400px] md:h-[600px] object-cover rounded-lg"
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title} ${index + 2}`}
              className="w-full h-[190px] md:h-[290px] object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Property Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                  <PropertyStatusBadge status={property.status} verified={property.verified} />
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">
                  {formatPrice(property.price)}
                </p>
                <p className="text-gray-600">por mes</p>
              </div>
            </div>

            {/* Características Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {property.features?.bedrooms && property.features.bedrooms > 0 && (
                <div className="flex flex-col items-center text-center">
                  <BedDouble className="h-6 w-6 text-indigo-600 mb-1" />
                  <span className="text-sm font-medium">{property.features.bedrooms}</span>
                  <span className="text-xs text-gray-500">
                    {property.features.bedrooms === 1 ? 'Dormitorio' : 'Dormitorios'}
                  </span>
                </div>
              )}
              
              {property.features?.bathrooms && property.features.bathrooms > 0 && (
                <div className="flex flex-col items-center text-center">
                  <Bath className="h-6 w-6 text-indigo-600 mb-1" />
                  <span className="text-sm font-medium">{property.features.bathrooms}</span>
                  <span className="text-xs text-gray-500">
                    {property.features.bathrooms === 1 ? 'Baño' : 'Baños'}
                  </span>
                </div>
              )}
              
              {property.features?.size && property.features.size > 0 && (
                <div className="flex flex-col items-center text-center">
                  <HomeIcon className="h-6 w-6 text-indigo-600 mb-1" />
                  <span className="text-sm font-medium">{property.features.size}m²</span>
                  <span className="text-xs text-gray-500">Superficie</span>
                </div>
              )}
            </div>

            {/* Mensaje de verificación pendiente */}
            {!property.verified && isLandlord && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Esta propiedad está pendiente de verificación por el administrador. 
                      No será visible públicamente hasta que sea verificada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Descripción</h2>
              <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Características Adicionales */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Características</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Check className={`h-5 w-5 ${property.features?.furnished ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-gray-600">
                    {property.features?.furnished ? 'Amueblado' : 'Sin amueblar'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className={`h-5 w-5 ${property.features?.petsAllowed ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-gray-600">
                    {property.features?.petsAllowed ? 'Mascotas permitidas' : 'No se admiten mascotas'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del Propietario */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar
                src={landlord?.avatar}
                name={landlord?.name || 'Propietario'}
                size="lg"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">
                    {landlord?.name}
                  </h3>
                  {landlord?.verified && (
                    <Shield className="h-5 w-5 text-green-500" title="Verificado" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Miembro desde {landlord?.createdAt ? 
                    new Date(landlord.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>

            {!isLandlord && (
              <Button
                onClick={handleContactOwner}
                variant="primary"
                className="w-full"
                icon={<MessageSquare className="h-5 w-5" />}
              >
                {user ? 'Contactar con el propietario' : 'Iniciar sesión para contactar'}
              </Button>
            )}
          </div>

          {/* Requisitos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <PropertyRequirements 
              requirements={property.requirements}
              isEditing={isLandlord && isEditing}
              onUpdate={isLandlord ? handleRequirementsUpdate : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};