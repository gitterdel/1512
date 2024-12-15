import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { TenantProfile } from '../components/tenant/TenantProfile';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const TenantProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, registeredUsers } = useAuthStore();

  // Verificar que el usuario actual es un propietario
  if (!user || user.role !== 'landlord') {
    navigate('/');
    return null;
  }

  const tenant = id ? registeredUsers[id] : null;

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TenantProfile tenant={tenant} />
    </div>
  );
};