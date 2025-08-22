import React from 'react';
import { useUpload } from '@/contexts/UploadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from './ui/button';

const UploadQueue: React.FC = () => {
  const { uploads, removeUpload } = useUpload();

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-[100] space-y-2">
      {uploads.map(task => (
        <Card key={task.id} className="shadow-lg animate-in fade-in slide-in-from-bottom-5">
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium truncate">{task.file.name}</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeUpload(task.id)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-2">
              {task.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {task.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
              {task.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {task.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
              <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
            </div>
            <Progress value={task.progress} className="h-2 mt-2" />
            {task.error && <p className="text-xs text-destructive mt-1">{task.error}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UploadQueue;