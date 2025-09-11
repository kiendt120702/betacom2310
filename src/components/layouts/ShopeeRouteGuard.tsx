import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ShopeeRouteGuardProps {
  children: React.ReactNode;
}

const ShopeeRouteGuard: React.FC<ShopeeRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();
  const { isBooking } = useUserPermissions(userProfile);
  const navigate = useNavigate();

  if (isLoading) {
    return <PageLoader />;
  }

  // Block booking role
  if (isBooking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Bạn không có quyền truy cập vào nội dung này.
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
  }

  return <>{children}</>;
};

export default ShopeeRouteGuard;