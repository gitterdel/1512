import React from 'react';
import { format } from 'date-fns';
import { Message } from '../../types/chat';
import { useAuthStore } from '../../store/useAuthStore';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const { registeredUsers } = useAuthStore();
  const sender = registeredUsers[message.senderId];

  const getMessageContent = () => {
    switch (message.type) {
      case 'rental_request':
        return (
          <div className="bg-yellow-50 p-2 rounded-md">
            <p className="text-yellow-800">
              Ha enviado una solicitud de alquiler
            </p>
          </div>
        );
      case 'rental_response':
        return (
          <div className={`p-2 rounded-md ${
            message.metadata?.requestStatus === 'approved'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            <p>
              {message.metadata?.requestStatus === 'approved'
                ? 'Ha aprobado la solicitud de alquiler'
                : 'Ha rechazado la solicitud de alquiler'}
            </p>
          </div>
        );
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
        <div className={`rounded-lg p-3 ${
          isOwn 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {!isOwn && (
            <p className="text-xs font-medium mb-1">
              {sender?.name}
            </p>
          )}
          
          {getMessageContent()}
          
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-70">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {isOwn && (
              message.read 
                ? <CheckCheck className="h-4 w-4 opacity-70" />
                : <Check className="h-4 w-4 opacity-70" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};