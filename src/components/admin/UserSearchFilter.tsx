
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

interface UserSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userCount: number;
}

const UserSearchFilter: React.FC<UserSearchFilterProps> = ({ 
  searchTerm, 
  onSearchChange,
  userCount 
}) => {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 h-11"
        />
      </div>
      
      {searchTerm && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <Users className="w-4 h-4 text-blue-600" />
          <span>
            Tìm thấy <span className="font-semibold text-blue-700">{userCount}</span> người dùng
            {searchTerm && (
              <>
                {' '}cho "<span className="font-medium text-gray-900">{searchTerm}</span>"
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserSearchFilter;
