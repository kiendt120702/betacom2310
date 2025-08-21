import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface StandardManagementLayoutProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children: ReactNode;
  isLoading?: boolean;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    actionButton?: {
      label: string;
      onClick: () => void;
      icon?: LucideIcon;
    };
  };
  isEmpty?: boolean;
}

const StandardManagementLayout: React.FC<StandardManagementLayoutProps> = ({
  title,
  description,
  icon: Icon,
  actionButton,
  children,
  isLoading,
  emptyState,
  isEmpty = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty && emptyState) {
    const EmptyIcon = emptyState.icon;
    const EmptyActionIcon = emptyState.actionButton?.icon;
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            </div>
            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
              >
                {actionButton.icon && <actionButton.icon className="w-4 h-4 mr-2" />}
                {actionButton.label}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <EmptyIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {emptyState.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {emptyState.description}
            </p>
            {emptyState.actionButton && (
              <Button
                onClick={emptyState.actionButton.onClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
              >
                {EmptyActionIcon && <EmptyActionIcon className="w-4 h-4 mr-2" />}
                {emptyState.actionButton.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
            >
              {actionButton.icon && <actionButton.icon className="w-4 h-4 mr-2" />}
              {actionButton.label}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default StandardManagementLayout;