import React from 'react';
import { format } from 'date-fns';
import { Message } from '../../types/chat';
import { useAuthStore } from '../../store/useAuthStore';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  onProfileClick?: (userId: string) => void;
  onViewFullProfile?: (userId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages,
  currentUserId,
  onProfileClick,
  onViewFullProfile
}) => {
  const { registeredUsers } = useAuthStore();

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUserId;
    const sender = registeredUsers[message.senderId];
    const messageDate = new Date(message.createdAt);

    // Validate date before formatting
    const timeString = !isNaN(messageDate.getTime()) 
      ? format(messageDate, 'HH:mm')
      : '--:--';

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
          {!isOwn && (
            <button
              onClick={() => onProfileClick?.(message.senderId)}
              className="flex-shrink-0 focus:outline-none"
            >
              <Avatar
                src={sender?.avatar}
                name={sender?.name || 'Usuario'}
                size="sm"
              />
            </button>
          )}

          <div>
            {!isOwn && (
              <button
                onClick={() => onProfileClick?.(message.senderId)}
                className="text-xs font-medium mb-1 text-gray-500 hover:text-gray-700"
              >
                {sender?.name || 'Usuario'}
              </button>
            )}
            <div className={`rounded-lg px-4 py-2 ${
              isOwn 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-900 shadow-sm'
            }`}>
              <p className="break-words whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className={`text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`}>
                  {timeString}
                </span>
                {isOwn && (
                  message.read 
                    ? <CheckCheck className={`h-4 w-4 ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`} />
                    : <Check className={`h-4 w-4 ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          {renderMessage(message)}
        </div>
      ))}
    </div>
  );
};