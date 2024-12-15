import React from 'react';
import { Search, X } from 'lucide-react';
import { Message } from '../../types/chat';
import { Input } from '../ui/Input';

interface ChatSearchProps {
  messages: Message[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose: () => void;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  messages,
  searchTerm,
  onSearchChange,
  onClose
}) => {
  const matchCount = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  ).length;

  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar en la conversación..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-5 w-5 text-gray-400" />}
            autoFocus
          />
        </div>
        {searchTerm && (
          <span className="text-sm text-gray-500">
            {matchCount} {matchCount === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};