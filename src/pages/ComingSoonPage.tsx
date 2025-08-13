import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass } from "lucide-react";

const ComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <Hourglass className="w-8 h-8" />
            Sắp ra mắt!
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-xl text-muted-foreground mb-4">
            Tính năng này đang được phát triển.
          </p>
          <p className="text-sm text-gray-500">
            Chúng tôi đang nỗ lực để mang đến cho bạn những tính năng tốt nhất.
            Vui lòng quay lại sau nhé!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;