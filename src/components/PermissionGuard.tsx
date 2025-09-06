import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import PageLoader from '@/components/PageLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissionName: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children, permissionName }) => {
  const { data: permissions, isLoading } = usePermissions();
  const navigate = useNavigate();

  if (isLoading) {
    return <PageLoader />;
  }

  if (permissions?.has(permissionName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập chức năng này.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionGuard;