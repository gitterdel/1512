<template>
  <GridLayout rows="auto" columns="auto, *, auto" class="chat-item">
    <Image :src="otherParticipant.avatar" col="0" class="avatar" />
    
    <StackLayout col="1" class="chat-content">
      <Label :text="otherParticipant.name" class="participant-name" />
      <Label :text="lastMessagePreview" class="last-message" />
    </StackLayout>
    
    <StackLayout col="2" class="chat-meta">
      <Label :text="formattedDate" class="timestamp" />
      <Label :text="chat.unreadCount.toString()" class="unread-count" 
             v-if="chat.unreadCount > 0" />
    </StackLayout>
  </GridLayout>
</template>

<script lang="ts">
import Vue from 'vue';
import { format } from 'date-fns';
import { Chat } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export default Vue.extend({
  name: 'ChatListItem',
  
  props: {
    chat: {
      type: Object as () => Chat,
      required: true
    }
  },

  computed: {
    otherParticipant() {
      const currentUser = useAuthStore.getState().user;
      const otherParticipantId = this.chat.participants.find(
        id => id !== currentUser?.id
      );
      return useAuthStore.getState().registeredUsers[otherParticipantId || ''];
    },

    lastMessagePreview(): string {
      return this.chat.lastMessage?.content.slice(0, 50) + '...' || 'No hay mensajes';
    },

    formattedDate(): string {
      if (!this.chat.lastMessage?.createdAt) return '';
      return format(new Date(this.chat.lastMessage.createdAt), 'HH:mm');
    }
  }
});
</script>

<style scoped>
.chat-item {
  padding: 12;
  background-color: white;
}

.avatar {
  width: 40;
  height: 40;
  border-radius: 20;
  margin-right: 12;
}

.chat-content {
  margin-right: 8;
}

.participant-name {
  font-size: 16;
  font-weight: bold;
  color: #1f2937;
}

.last-message {
  font-size: 14;
  color: #6b7280;
}

.chat-meta {
  text-align: right;
}

.timestamp {
  font-size: 12;
  color: #9ca3af;
}

.unread-count {
  background-color: #4f46e5;
  color: white;
  font-size: 12;
  font-weight: bold;
  padding: 2 6;
  border-radius: 10;
  margin-top: 4;
}
</style>