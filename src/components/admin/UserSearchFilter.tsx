
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userCount: number;
}

const UserSearchFilter = React.memo<UserSearchFilterProps>(({ 
  searchTerm, 
  onSearchChange, 
  userCount 
}) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {userCount > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          Tìm thấy {userCount} người dùng
        </p>
      )}
    </div>
  );
});

UserSearchFilter.displayName = 'UserSearchFilter';

export default UserSearchFilter;
