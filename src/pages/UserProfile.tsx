import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { LandlordProfile } from '../components/profile/LandlordProfile';
import { TenantProfileView } from '../components/profile/TenantProfileView';
import { AdminProfileView } from '../components/profile/AdminProfileView';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

export const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, registeredUsers, refreshUserData } = useAuthStore();
  const { fromChat, chatId, fromAdmin } = location.state || {};

  // Cargar datos del usuario al montar el componente
  React.useEffect(() => {
    if (id) {
      refreshUserData(id).catch(console.error);
    }
  }, [id, refreshUserData]);

  const profileUser = id ? registeredUsers[id] : user;

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isOwnProfile = user?.id === profileUser.id;

  const handleBack = () => {
    if (fromChat && chatId) {
      navigate('/messages');
    } else if (fromAdmin) {
      navigate('/admin');
    } else {
      navigate(-1);
    }
  };

  const renderProfileContent = () => {
    switch (profileUser.role) {
      case 'landlord':
        return <LandlordProfile user={profileUser} />;
      case 'tenant':
        return <TenantProfileView user={profileUser} />;
      case 'admin':
        return <AdminProfileView user={profileUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            {fromChat ? 'Volver al chat' : fromAdmin ? 'Volver al panel' : 'Volver'}
          </Button>
        </div>

        <ProfileHeader 
          user={profileUser} 
          isEditable={isOwnProfile}
        />

        <div className="mt-8">
          {renderProfileContent()}
        </div>
      </div>
    </div>
  );
};