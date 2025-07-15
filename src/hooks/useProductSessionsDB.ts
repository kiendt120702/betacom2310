import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProductFormData } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';

export interface ProductSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  products: ProductFormData[];
}

export const useProductSessionsDB = () => {
  const [sessions, setSessions] = useState<ProductSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentProducts, setCurrentProducts] = useState<ProductFormData[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load sessions từ database
  const loadSessions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('product_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Load products for each session
      const sessionsWithProducts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: productsData, error: productsError } = await supabase
            .from('product_session_items')
            .select('product_data')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

          if (productsError) throw productsError;

          return {
            ...session,
            products: productsData?.map(item => item.product_data as ProductFormData) || []
          } as ProductSession;
        })
      );

      setSessions(sessionsWithProducts);

      // Nếu chưa có session nào được chọn và có sessions, chọn session đầu tiên
      if (!currentSessionId && sessionsWithProducts.length > 0) {
        const firstSession = sessionsWithProducts[0];
        setCurrentSessionId(firstSession.id);
        setCurrentProducts(firstSession.products);
      } else if (currentSessionId) {
        // Cập nhật products của session hiện tại
        const currentSession = sessionsWithProducts.find(s => s.id === currentSessionId);
        if (currentSession) {
          setCurrentProducts(currentSession.products);
        }
      }

      // Nếu không có session nào, tạo session đầu tiên
      if (sessionsWithProducts.length === 0) {
        await createNewSession();
      }
    } catch (error) {
      console.error('Lỗi khi tải sessions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phiên làm việc.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load sessions khi user thay đổi
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Tạo session mới
  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_sessions')
        .insert({
          user_id: user.id,
          title: `Phiên làm việc ${new Date().toLocaleDateString('vi-VN')}`,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ProductSession = {
        ...data,
        products: []
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setCurrentProducts([]);
      setHasUnsavedChanges(false);

      toast({
        title: "Thành công",
        description: "Đã tạo phiên làm việc mới.",
      });
    } catch (error) {
      console.error('Lỗi khi tạo session:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo phiên làm việc mới.",
        variant: "destructive",
      });
    }
  };

  // Chọn session
  const selectSession = async (sessionId: string) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi chuyển sang phiên làm việc khác không?"
      );
      if (confirmSwitch) {
        await saveCurrentSession();
      }
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentProducts(session.products);
      setHasUnsavedChanges(false);
    }
  };

  // Lưu session hiện tại
  const saveCurrentSession = async () => {
    if (!currentSessionId || !user) return;

    try {
      // Cập nhật thời gian updated_at của session
      const { error: updateError } = await supabase
        .from('product_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);

      if (updateError) throw updateError;

      // Xóa tất cả products cũ của session
      const { error: deleteError } = await supabase
        .from('product_session_items')
        .delete()
        .eq('session_id', currentSessionId);

      if (deleteError) throw deleteError;

      // Thêm lại tất cả products mới
      if (currentProducts.length > 0) {
        const { error: insertError } = await supabase
          .from('product_session_items')
          .insert(
            currentProducts.map(product => ({
              session_id: currentSessionId,
              product_data: product as any // Cast to Json type
            }))
          );

        if (insertError) throw insertError;
      }

      // Cập nhật state
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              products: currentProducts,
              updated_at: new Date().toISOString()
            }
          : session
      ));

      setHasUnsavedChanges(false);

      toast({
        title: "Đã lưu",
        description: "Phiên làm việc đã được lưu thành công.",
      });
    } catch (error) {
      console.error('Lỗi khi lưu session:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu phiên làm việc.",
        variant: "destructive",
      });
    }
  };

  // Xóa session
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('product_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);

      if (currentSessionId === sessionId) {
        if (newSessions.length > 0) {
          const firstSession = newSessions[0];
          setCurrentSessionId(firstSession.id);
          setCurrentProducts(firstSession.products);
        } else {
          await createNewSession();
        }
      }

      toast({
        title: "Đã xóa",
        description: "Phiên làm việc đã được xóa.",
      });
    } catch (error) {
      console.error('Lỗi khi xóa session:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa phiên làm việc.",
        variant: "destructive",
      });
    }
  };

  // Đổi tên session
  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('product_sessions')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, title: newTitle, updated_at: new Date().toISOString() }
          : session
      ));

      toast({
        title: "Đã đổi tên",
        description: "Tên phiên làm việc đã được cập nhật.",
      });
    } catch (error) {
      console.error('Lỗi khi đổi tên session:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đổi tên phiên làm việc.",
        variant: "destructive",
      });
    }
  };

  // Thêm sản phẩm vào session hiện tại
  const addProduct = (product: ProductFormData) => {
    const newProducts = [...currentProducts, product];
    setCurrentProducts(newProducts);
    setHasUnsavedChanges(true);
  };

  // Xóa tất cả sản phẩm trong session hiện tại
  const clearCurrentProducts = () => {
    setCurrentProducts([]);
    setHasUnsavedChanges(true);
  };

  return {
    sessions,
    currentSessionId,
    currentProducts,
    hasUnsavedChanges,
    isLoading,
    createNewSession,
    selectSession,
    saveCurrentSession,
    deleteSession,
    renameSession,
    addProduct,
    clearCurrentProducts,
    loadSessions,
  };
};