import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';
import { ProductSession } from '@/components/product-post/ProductSidebar';

const SESSIONS_STORAGE_KEY = 'product-sessions';
const CURRENT_SESSION_KEY = 'current-session-id';

export const useProductSessions = () => {
  const [sessions, setSessions] = useState<ProductSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentProducts, setCurrentProducts] = useState<ProductFormData[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Load sessions từ localStorage khi component mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const savedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
      
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        
        // Nếu có session hiện tại được lưu, load nó
        if (savedCurrentSessionId) {
          const currentSession = parsedSessions.find((s: ProductSession) => s.id === savedCurrentSessionId);
          if (currentSession) {
            setCurrentSessionId(savedCurrentSessionId);
            setCurrentProducts(currentSession.products);
          } else {
            // Nếu session không tồn tại, tạo session mới
            createNewSession();
          }
        } else if (parsedSessions.length > 0) {
          // Nếu không có session hiện tại nhưng có sessions, chọn session đầu tiên
          const firstSession = parsedSessions[0];
          setCurrentSessionId(firstSession.id);
          setCurrentProducts(firstSession.products);
        } else {
          // Nếu không có session nào, tạo session mới
          createNewSession();
        }
      } else {
        // Nếu không có dữ liệu, tạo session đầu tiên
        createNewSession();
      }
    } catch (error) {
      console.error('Lỗi khi tải sessions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phiên làm việc.",
        variant: "destructive",
      });
      createNewSession();
    }
  }, []);

  // Lưu sessions vào localStorage
  const saveSessions = (newSessions: ProductSession[]) => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
    } catch (error) {
      console.error('Lỗi khi lưu sessions:', error);
      toast({
        title: "Cảnh báo",
        description: "Không thể lưu dữ liệu phiên làm việc.",
        variant: "destructive",
      });
    }
  };

  // Lưu current session ID
  const saveCurrentSessionId = (sessionId: string | null) => {
    try {
      if (sessionId) {
        localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (error) {
      console.error('Lỗi khi lưu current session ID:', error);
    }
  };

  // Tạo session mới
  const createNewSession = () => {
    const newSession: ProductSession = {
      id: Date.now().toString(),
      title: `Phiên làm việc ${new Date().toLocaleDateString('vi-VN')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      products: [],
    };

    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    setCurrentSessionId(newSession.id);
    setCurrentProducts([]);
    setHasUnsavedChanges(false);
    
    saveSessions(newSessions);
    saveCurrentSessionId(newSession.id);

    toast({
      title: "Thành công",
      description: "Đã tạo phiên làm việc mới.",
    });
  };

  // Chọn session
  const selectSession = (sessionId: string) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi chuyển sang phiên làm việc khác không?"
      );
      if (confirmSwitch) {
        saveCurrentSession();
      }
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentProducts(session.products);
      setHasUnsavedChanges(false);
      saveCurrentSessionId(sessionId);
    }
  };

  // Lưu session hiện tại
  const saveCurrentSession = () => {
    if (!currentSessionId) return;

    const updatedSessions = sessions.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            products: currentProducts,
            updated_at: new Date().toISOString()
          }
        : session
    );

    setSessions(updatedSessions);
    setHasUnsavedChanges(false);
    saveSessions(updatedSessions);

    toast({
      title: "Đã lưu",
      description: "Phiên làm việc đã được lưu thành công.",
    });
  };

  // Xóa session
  const deleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    saveSessions(newSessions);

    if (currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        const firstSession = newSessions[0];
        setCurrentSessionId(firstSession.id);
        setCurrentProducts(firstSession.products);
        saveCurrentSessionId(firstSession.id);
      } else {
        createNewSession();
      }
    }

    toast({
      title: "Đã xóa",
      description: "Phiên làm việc đã được xóa.",
    });
  };

  // Đổi tên session
  const renameSession = (sessionId: string, newTitle: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, title: newTitle, updated_at: new Date().toISOString() }
        : session
    );

    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    toast({
      title: "Đã đổi tên",
      description: "Tên phiên làm việc đã được cập nhật.",
    });
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
    createNewSession,
    selectSession,
    saveCurrentSession,
    deleteSession,
    renameSession,
    addProduct,
    clearCurrentProducts,
  };
};