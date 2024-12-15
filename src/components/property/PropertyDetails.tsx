import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Home as HomeIcon, Bath, BedDouble, MessageSquare,
  Shield, Check, Bookmark, BookmarkCheck
} from 'lucide-react';
import { Property } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useSavedPropertiesStore } from '../../store/useSavedPropertiesStore';
import { Button } from '../ui/Button';
import { formatPrice } from '../../utils/format';
import { PropertyStatusBadge } from '../PropertyStatusBadge';
import { Avatar } from '../ui/Avatar';
import { PropertyRequirements } from './PropertyRequirements';
import { Image } from '../ui/Image';
import { toast } from 'react-hot-toast';

// ... resto del código igual ...

{/* Image Gallery Grid */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
  {/* Main Image */}
  <div className="md:col-span-8">
    <Image
      src={property.images[0]}
      alt={property.title}
      className="w-full h-[400px] md:h-[600px] object-cover rounded-lg"
      fallback="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
    />
  </div>

  {/* Thumbnail Grid */}
  <div className="md:col-span-4 grid grid-cols-2 gap-4">
    {property.images.slice(1, 5).map((image, index) => (
      <Image
        key={index}
        src={image}
        alt={`${property.title} ${index + 2}`}
        className="w-full h-[190px] md:h-[290px] object-cover rounded-lg"
        fallback="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
      />
    ))}
  </div>
</div>

// ... resto del código igual ...