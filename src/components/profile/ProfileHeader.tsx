import React from 'react';
import { Shield, MapPin, Calendar, Mail, Phone, Edit } from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  user: User;
  isEditable?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isEditable = false
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  return (
    <div className="relative">
      {/* Background Hero */}
      <div className="absolute inset-0 h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column - Avatar & Main Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="xl"
                  className="w-40 h-40 ring-4 ring-white/20 shadow-2xl"
                />
                {user.verified && (
                  <div className="absolute -bottom-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Name and Role */}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm`}>
                    {user.role === 'landlord' ? 'Propietario' : 
                     user.role === 'tenant' ? 'Inquilino' : 
                     'Administrador'}
                  </span>
                </div>

                {/* Action Buttons */}
                {isEditable && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    icon={<Edit className="h-5 w-5" />}
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-6 flex flex-wrap gap-4">
                {user.location && (
                  <div className="flex items-center text-white/80">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center text-white/80">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center text-white/80">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="mt-6 text-white/90 max-w-3xl">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Miembro desde</p>
                  <p className="text-white font-semibold mt-0.5">
                    {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};