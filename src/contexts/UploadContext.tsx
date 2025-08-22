import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useChunkedUpload } from '@/hooks/useChunkedUpload';

export type UploadEntityType = 'edu_exercise' | 'general_training';

export interface UploadTask {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
  entityId: string;
  entityType: UploadEntityType;
}

interface UploadContextType {
  uploads: UploadTask[];
  addUpload: (file: File, entityId: string, entityType: UploadEntityType) => void;
  removeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { uploadLargeVideo } = useChunkedUpload();

  const updateUpload = (id: string, updates: Partial<UploadTask>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const addUpload = useCallback((file: File, entityId: string, entityType: UploadEntityType) => {
    const id = `${file.name}-${Date.now()}`;
    const newTask: UploadTask = { id, file, status: 'uploading', progress: 0, entityId, entityType };
    setUploads(prev => [...prev, newTask]);

    const uploadFile = async () => {
      try {
        // Use chunked upload for better handling of large files
        const result = await uploadLargeVideo(file, (progress) => {
          updateUpload(id, { 
            progress: progress.progress, 
            status: progress.status,
            error: progress.error 
          });
        });

        if (result.error) {
          throw new Error(result.error);
        }

        const publicUrl = result.url!;

        // Update the database with the video URL
        let updateError;
        if (entityType === 'edu_exercise') {
          ({ error: updateError } = await supabase
            .from('edu_knowledge_exercises')
            .update({ exercise_video_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', entityId));
        } else if (entityType === 'general_training') {
          ({ error: updateError } = await supabase
            .from('general_training_exercises')
            .update({ video_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', entityId));
        }

        if (updateError) throw updateError;

        updateUpload(id, { status: 'success', progress: 100, url: publicUrl });
        queryClient.invalidateQueries({ queryKey: ['edu-exercises'] });
        queryClient.invalidateQueries({ queryKey: ['general-training'] });
        toast({
          title: "Upload thành công",
          description: `Video "${file.name}" đã được thêm vào bài học.`,
        });

      } catch (error: any) {
        console.error('Upload failed:', error);
        const errorMessage = error.message || 'Lỗi không xác định';

        updateUpload(id, { status: 'error', error: errorMessage });
        toast({
          title: "Upload thất bại",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    uploadFile();
  }, [queryClient, toast, uploadLargeVideo]);

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UploadContext.Provider value={{ uploads, addUpload, removeUpload }}>
      {children}
    </UploadContext.Provider>
  );
};