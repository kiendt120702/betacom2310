import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';

interface MobileDrawerProps {
  children?: React.ReactNode;
}

export const MobileDrawer = React.memo<MobileDrawerProps>(({ children }) => {
  return (
    <div className="md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <AppSidebar />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
});

MobileDrawer.displayName = "MobileDrawer";