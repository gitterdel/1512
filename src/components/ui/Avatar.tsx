import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (!src) {
    return (
      <div className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-indigo-100 to-indigo-50
        rounded-full 
        flex 
        items-center 
        justify-center
        ring-2
        ring-indigo-100
        ${className}
      `}>
        {name ? (
          <span className="font-semibold text-indigo-600">
            {getInitials(name)}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-indigo-600" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        object-cover
        ring-2
        ring-indigo-100
        ${className}
      `}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = 'none';
        setTimeout(() => {
          img.style.display = 'block';
          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EEF2FF&color=4F46E5`;
        }, 100);
      }}
    />
  );
};