import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const { chats, messages } = useChatStore();
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'message' | 'rental' | 'system';
    read: boolean;
    createdAt: Date;
  }[]>([]);

  useEffect(() => {
    if (!user) return;

    // Verificar nuevos mensajes
    const unreadMessages = chats.flatMap(chat => 
      messages[chat.id]?.filter(msg => 
        !msg.read && msg.receiverId === user.id
      ) || []
    );

    // Crear notificaciones para mensajes no leídos
    const newNotifications = unreadMessages.map(msg => ({
      id: msg.id,
      title: 'Nuevo mensaje',
      message: msg.content,
      type: 'message' as const,
      read: false,
      createdAt: msg.createdAt
    }));

    setNotifications(prev => [...prev, ...newNotifications]);
  }, [user, chats, messages]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  };
};