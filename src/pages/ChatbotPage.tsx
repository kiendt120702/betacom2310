
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Chatbot from '@/components/Chatbot';
import AppHeader from '@/components/AppHeader';

const ChatbotPage = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tư vấn chiến lược thông minh</h1>
          <p className="text-gray-600 mt-2">
            Chatbot AI hỗ trợ tư vấn chiến lược marketing dựa trên cơ sở kiến thức chuyên môn
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg h-[700px]">
          <Chatbot className="h-full p-4" />
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
