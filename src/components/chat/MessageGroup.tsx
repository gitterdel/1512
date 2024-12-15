import React, { useState } from 'react';
import { format } from 'date-fns';
import { User } from '../../types';
import { QuickProfileView } from './QuickProfileView';

interface MessageGroupProps {
  group: {
    senderId: string;
    messages: Array<{
      id: string;
      content: string;
      createdAt: Date;
    }>;
  };
  isCurrentUser: boolean;
  sender: User;
  onViewFullProfile?: () => void;
}

export const MessageGroup: React.FC<MessageGroupProps> = ({
  group,
  isCurrentUser,
  sender,
  onViewFullProfile,
}) => {
  const [showProfile, setShowProfile] = useState(false);

  if (!sender) return null;

  const getFormattedName = () => {
    if (!sender?.name) return '';
    const nameParts = sender.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
    }
    return sender.name;
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} relative`}>
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[70%]`}>
        <button
          onClick={() => setShowProfile(true)}
          className="focus:outline-none"
        >
          {sender?.avatar ? (
            <img
              src={sender.avatar}
              alt={getFormattedName()}
              className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-indigo-500"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center hover:ring-2 hover:ring-indigo-500">
              <span className="text-sm font-semibold text-indigo-600">
                {getFormattedName().charAt(0)}
              </span>
            </div>
          )}
        </button>
        <div className={`mx-2 space-y-1`}>
          {group.messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                isCurrentUser
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {index === 0 && (
                <button
                  onClick={() => setShowProfile(true)}
                  className={`text-xs opacity-70 mb-1 hover:opacity-100 ${
                    isCurrentUser ? 'text-white' : 'text-indigo-600'
                  }`}
                >
                  {getFormattedName()}
                </button>
              )}
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {format(new Date(msg.createdAt), 'HH:mm')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showProfile && sender && (
        <div className={`absolute top-0 ${isCurrentUser ? 'left-0' : 'right-0'} transform ${isCurrentUser ? '-translate-x-full' : 'translate-x-full'}`}>
          <QuickProfileView
            user={sender}
            onClose={() => setShowProfile(false)}
            onViewFullProfile={onViewFullProfile}
          />
        </div>
      )}
    </div>
  );
};