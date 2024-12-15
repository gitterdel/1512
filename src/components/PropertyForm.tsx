import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '../lib/validations/property';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const PropertyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(propertySchema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Lógica de envío
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Título"
        error={errors.title?.message}
        {...register('title')}
      />
      {/* ... resto de campos ... */}
      <Button
        type="submit"
        isLoading={isSubmitting}
      >
        Publicar Propiedad
      </Button>
    </form>
  );
};