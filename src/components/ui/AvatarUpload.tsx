import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { storageService } from '../../lib/storage';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  size = 'lg',
  className = ''
}) => {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('La imagen no puede superar los 2MB');
      return;
    }

    try {
      setIsUploading(true);
      toast.loading('Subiendo avatar...', { id: 'avatar-upload' });

      // Delete previous avatar if exists
      if (user.avatar_path) {
        await storageService.deleteAvatar(user.avatar_path);
      }

      // Upload new avatar
      const publicUrl = await storageService.uploadAvatar(user.id, file);

      // Update user profile
      await updateUser(user.id, {
        avatar_url: publicUrl,
        avatar_path: `${user.id}/${file.name}`
      });

      toast.success('Avatar actualizado correctamente', { id: 'avatar-upload' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir el avatar', { id: 'avatar-upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatar_url) return;

    try {
      setIsUploading(true);
      toast.loading('Eliminando avatar...', { id: 'avatar-delete' });

      if (user.avatar_path) {
        await storageService.deleteAvatar(user.avatar_path);
      }

      await updateUser(user.id, {
        avatar_url: null,
        avatar_path: null
      });

      toast.success('Avatar eliminado correctamente', { id: 'avatar-delete' });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Error al eliminar el avatar', { id: 'avatar-delete' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar
        src={user.avatar_url}
        name={user.name}
        size={size}
        className={`${className} ${isUploading ? 'opacity-50' : ''}`}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {isHovered && !isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              icon={<Camera className="h-4 w-4" />}
            >
              {user.avatar_url ? 'Cambiar' : 'Subir'}
            </Button>
            {user.avatar_url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                icon={<X className="h-4 w-4" />}
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};