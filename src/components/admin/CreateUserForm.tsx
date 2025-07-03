import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock } from 'lucide-react'; // Removed Shield, Users
import { CreateUserData } from '@/hooks/types/userTypes'; // Updated import
import { UseMutationResult } from '@tanstack/react-query';

interface CreateUserFormProps {
  createUserMutation: UseMutationResult<any, Error, CreateUserData, unknown>;
  onSuccess: () => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  createUserMutation,
  onSuccess,
  onError,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUserMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });
      
      setFormData({
        email: '',
        password: '',
        full_name: '',
      });
      
      onSuccess();
    } catch (error: any) {
      onError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="user@example.com"
            required
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Mật khẩu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mật khẩu tạm thời"
            required
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Họ và tên
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Nguyễn Văn A"
            className="h-11 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 border-gray-200 hover:bg-gray-50"
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          disabled={createUserMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {createUserMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              Đang tạo...
            </div>
          ) : (
            'Tạo người dùng'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;