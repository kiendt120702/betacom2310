
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 text-destructive">
            <AlertTriangle className="w-full h-full" />
          </div>
          <CardTitle className="text-destructive">
            Đã có lỗi xảy ra
          </CardTitle>
          <CardDescription>
            Ứng dụng gặp phải lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full" 
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Tải lại trang
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-3 bg-muted rounded-md text-sm">
              <summary className="cursor-pointer font-medium text-destructive">
                Chi tiết lỗi (Development Only)
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 overflow-auto bg-background p-2 rounded border">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
