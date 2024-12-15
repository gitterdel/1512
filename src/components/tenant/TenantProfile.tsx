import React from 'react';
import { Shield, MapPin, Calendar, Briefcase, Dog, Cigarette, DollarSign, FileText, ArrowLeft } from 'lucide-react';
import { User } from '../../types';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

interface TenantProfileProps {
  tenant: User;
}

export const TenantProfile: React.FC<TenantProfileProps> = ({ tenant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fromChat, chatId } = location.state || {};

  const handleBack = () => {
    if (fromChat && chatId) {
      navigate('/messages');
    } else {
      navigate(-1);
    }
  };

  const age = tenant.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(tenant.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          icon={<ArrowLeft className="h-5 w-5" />}
        >
          {fromChat ? 'Volver al chat' : 'Volver'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Rest of the component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
};