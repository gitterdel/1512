export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
  type: 'message' | 'rental_request' | 'rental_response';
}

export interface Chat {
  id: string;
  participants: string[];
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
  unreadCount: number;
}