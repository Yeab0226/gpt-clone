import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

const API_BASE_URL = 'http://localhost:3777/api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    axios.get(API_BASE_URL + '/chat/chats')
      .then(response => setChats(response.data.data.chats))
      .catch(() => setError('Could not load chat history. Please refresh to retry.'));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  const handleSelectChat = async chatId => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(API_BASE_URL + '/chat/conversations', {
        params: { chatId },
      });
      setConversations(response.data.data.conversations);
      setActiveChatId(chatId);
    } catch {
      setError('Could not open this chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (isLoading) return;
    setActiveChatId(null);
    setConversations([]);
    setError('');
  };

  const handleDeleteChat = async chatId => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      await axios.delete(API_BASE_URL + '/chat/chats/' + chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setConversations([]);
      }
    } catch {
      setError('Could not delete this chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async question => {
    if (isLoading) return;
    setError('');
    // Optimistically add user message
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };
    setConversations(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      let chatId = activeChatId;
      if (!chatId) {
        const result = await axios.post(API_BASE_URL + '/chat/chats', {
          title: question,
        });
        const chat = result.data.data.chat;
        chatId = chat.id;
        setActiveChatId(chatId);
        setChats(prev => [chat, ...prev]);
      }
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        question,
        chatId,
      });
      if (response.data.success) {
        const { userConversation, assistantConversation } = response.data.data;
        setChats(prev => {
          const current = prev.find(chat => chat.id === chatId);
          return current ? [current, ...prev.filter(chat => chat.id !== chatId)] : prev;
        });
        // Replace temp message with real ones
        setConversations(prev => {
          const filtered = prev.filter(msg => msg.id !== tempUserMessage.id);
          return [...filtered, userConversation, assistantConversation];
        });
      }
    } catch (error) {
      console.error('Error posting conversation:', error);

      // Extract error message from backend response or use a realistic fallback
      const errorMessage =
        error.response?.data?.message ||
        'There was an error generating a response.';

      // Add error message to chat
      const errorConversation = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
      };

      setConversations(prev => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app'>
      {isSidebarOpen && <Sidebar
        onHideSidebar={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        isLoading={isLoading}
      />}

      <main className='chat'>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onShowSidebar={() => setIsSidebarOpen(true)}
        />
        {error && <p className='chatError' role='alert'>{error}</p>}

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          key={activeChatId ?? "new"}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
