
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import AppHeader from '@/components/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagement from '@/components/admin/UserManagement';
import BannerManagement from '@/components/admin/BannerManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledge from '@/components/admin/SeoKnowledge';

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && userProfile.role !== 'admin') {
      navigate('/banners');
      return;
    }
  }, [user, userProfile, navigate]);

  if (!user || !userProfile || userProfile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Admin</h1>
          <p className="text-gray-600 mt-2">Quản lý người dùng, banner và kiến thức hệ thống</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="banners">Banner</TabsTrigger>
            <TabsTrigger value="knowledge">Kiến thức tư vấn</TabsTrigger>
            <TabsTrigger value="seo-knowledge">Kiến thức SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>

          <TabsContent value="seo-knowledge">
            <SeoKnowledge />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
