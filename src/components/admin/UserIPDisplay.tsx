import React from "react";
import { Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { useUserLatestLogin } from "@/hooks/useLoginTracking";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserIPDisplayProps {
  userId: string;
  compact?: boolean;
}

const UserIPDisplay: React.FC<UserIPDisplayProps> = ({ userId, compact = false }) => {
  const { data: latestLogin, isLoading, error } = useUserLatestLogin(userId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (error || !latestLogin) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="h-4 w-4" />
        <span className="text-xs">Chưa có dữ liệu</span>
      </div>
    );
  }

  const getDeviceIcon = () => {
    if (latestLogin.device_type === 'tablet') return <Tablet className="h-4 w-4" />;
    if (latestLogin.is_mobile || latestLogin.device_type === 'mobile') return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!latestLogin.success) return "text-red-600";
    
    const loginTime = new Date(latestLogin.login_time);
    const now = new Date();
    const diffInHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "text-green-600";
    if (diffInHours < 24) return "text-blue-600";
    return "text-gray-600";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Globe className={`h-3 w-3 ${getStatusColor()}`} />
        <code className="text-xs bg-muted px-1 py-0.5 rounded text-muted-foreground">
          {latestLogin.ip_address || 'N/A'}
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Globe className={`h-4 w-4 ${getStatusColor()}`} />
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {latestLogin.ip_address || 'Unknown'}
        </code>
        {!latestLogin.success && (
          <Badge variant="destructive" className="text-xs">
            Thất bại
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {getDeviceIcon()}
        <span>
          {latestLogin.browser_name} • {latestLogin.os_name}
        </span>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {format(new Date(latestLogin.login_time), "dd/MM/yyyy HH:mm", { locale: vi })}
      </div>
    </div>
  );
};

export default UserIPDisplay;