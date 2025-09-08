# Integration Guide - Slide Show Nexus Admin

## Tổng quan Integration

Hướng dẫn tích hợp các thành phần và dịch vụ bên ngoài với Slide Show Nexus Admin system. Bao gồm Supabase setup, third-party services, và deployment configurations.

## Supabase Integration

### 1. Database Setup

#### Connection Configuration
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

#### Environment Variables
```env
# .env.local
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Schema

#### Core Tables Structure
```sql
-- Users và Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'leader', 'employee', 'trainer')),
  avatar_url TEXT,
  department TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thumbnails Management
CREATE TABLE thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES thumbnail_categories(id),
  type_id UUID REFERENCES thumbnail_types(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count INTEGER DEFAULT 0,
  creator_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training System
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  theory_content TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  required_viewing_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Analytics
CREATE TABLE comprehensive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  report_date DATE NOT NULL,
  platform TEXT CHECK (platform IN ('shopee', 'tiktok')),
  revenue DECIMAL(12,2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  traffic INTEGER DEFAULT 0,
  goal_revenue DECIMAL(12,2),
  goal_orders INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_reports ENABLE ROW LEVEL SECURITY;

-- Basic user access policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Admin full access policy  
CREATE POLICY "Admins have full access" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Manager access to team members
CREATE POLICY "Managers can access team data" ON profiles
  FOR SELECT USING (
    manager_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### 3. Storage Configuration

#### Bucket Setup
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', false);
```

#### Storage Policies
```sql
-- Thumbnail upload policy
CREATE POLICY "Users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

-- Video upload policy (admin only)
CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'trainer')
    )
  );
```

### 4. Edge Functions

#### User Management Function
```typescript
// supabase/functions/create-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { email, password, full_name, role, department } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create auth user
    const { data: user, error: authError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.user.id,
        email,
        full_name,
        role,
        department
      });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true, user }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

## Frontend Integration

### 1. Authentication Setup

#### AuthContext Implementation
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. Protected Routes

#### Route Guard Components
```typescript
// src/components/layouts/AdminRouteGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { data: permissions, isLoading } = useUserPermissions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!permissions?.canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
```

### 3. Data Fetching Hooks

#### Generic Query Hook Pattern
```typescript
// src/hooks/useOptimizedQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};
```

## Third-Party Integrations

### 1. File Upload (Supabase Storage)

#### Image Upload Service
```typescript
// src/lib/imageUpload.ts
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export const uploadImage = async (
  file: File,
  bucket: string = 'thumbnails',
  folder: string = ''
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}${Date.now()}-${Math.random()}.${fileExt}`;

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };

  } catch (error) {
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};
```

### 2. Real-time Notifications

#### Toast Integration
```typescript
// src/hooks/useToast.ts
import { toast } from 'sonner';

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  return { showSuccess, showError, showInfo };
};
```

### 3. Excel File Processing

#### Excel Import/Export
```typescript
// src/lib/excelUtils.ts
import * as XLSX from 'xlsx';

export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: any[], filename: string = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};
```

## Deployment Integration

### 1. Vercel Configuration

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm ci",
  "env": {
    "REACT_APP_SUPABASE_URL": "@supabase-url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "REACT_APP_SUPABASE_URL": "@supabase-url", 
      "REACT_APP_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 2. Environment Management

#### Production Environment
```bash
# Set environment variables in Vercel dashboard
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

#### Development Environment
```env
# .env.local for development
REACT_APP_SUPABASE_URL=http://localhost:54321
REACT_APP_SUPABASE_ANON_KEY=your-local-anon-key
```

### 3. CI/CD Pipeline

#### GitHub Actions (if using GitHub)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring và Analytics

### 1. Error Tracking

#### Error Boundary Integration
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; showDetails?: boolean },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          {this.props.showDetails && (
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 2. Performance Monitoring

#### Page Load Tracking
```typescript
// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();
    
    // Track page view
    console.log(`Page loaded: ${location.pathname}`);
    
    // Cleanup function to measure page interaction time
    return () => {
      const endTime = performance.now();
      const timeSpent = endTime - startTime;
      console.log(`Time spent on ${location.pathname}: ${timeSpent}ms`);
    };
  }, [location]);
};
```