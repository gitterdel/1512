import * as z from 'zod';

export const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  location: z.string().min(1, 'La ubicación es requerida'),
  type: z.enum(['room', 'house']),
  amenities: z.array(z.string()).min(1, 'Selecciona al menos una amenidad'),
  features: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    size: z.number().optional(),
    furnished: z.boolean(),
    petsAllowed: z.boolean(),
  }),
  images: z.array(z.string()).min(1, 'Añade al menos una imagen'),
});