"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import { Banner } from '@/hooks/useBanners';
import LazyImage from '@/components/LazyImage';

interface ImagePreviewDialogProps {
  banner: Banner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCanvaOpen?: (link: string | null) => void;
}

const ImagePreviewDialog = ({ banner, open, onOpenChange, onCanvaOpen }: ImagePreviewDialogProps) => {
  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-xl font-semibold text-gray-900">
            {banner.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative flex justify-center items-center bg-muted rounded-lg overflow-hidden">
            <LazyImage 
              src={banner.image_url} 
              alt={banner.name}
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              placeholderClassName="w-full h-64 flex items-center justify-center"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-gray-100">
            {banner.canva_link && onCanvaOpen && (
              <Button 
                onClick={() => onCanvaOpen(banner.canva_link)}
                className="bg-chat-general-main hover:bg-chat-general-main/90 text-white flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trong Canva
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;