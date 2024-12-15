const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !activeChat || !currentChat) return;

    try {
      const otherParticipantId = currentChat.participants.find(id => id !== user.id);
      if (!otherParticipantId) return;

      await sendMessage({
        chatId: activeChat,
        senderId: user.id,
        receiverId: otherParticipantId,
        content: inputValue.trim(),
        propertyId: currentChat.propertyId,
        type: 'message'
      });
      
      setInputValue('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };