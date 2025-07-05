import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Menu,
  Brain,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart2,
  Users2, // Added for Teams icon
  User, // Added for My Profile icon
  LucideIcon // Import LucideIcon type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledgePage from '@/pages/SeoKnowledgePage';
import AppHeader from '@/components/AppHeader';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductCategoryManagement from '@/components/admin/ProductCategoryManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';
import TeamManagement from '@/pages/admin/TeamManagement';
import MyProfilePage from '@/pages/MyProfilePage';

const Management = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [redirectInitiated, setRedirectInitiated] = useState(false);

  // Function to determine the initial active tab based on user role and URL hash
  const getInitialTab = (userRole: typeof userProfile.role | undefined) => {
    const hash = window.location.hash.replace('#', '');
    const isAdmin = userRole === 'admin';
    const isLeader = userRole === 'leader';
    const isChuyenVien = userRole === 'chuyên viên';

    const allowedTabsForRole = new Set<string>();
    if (isAdmin) {
      allowedTabsForRole.add('dashboard');
      allowedTabsForRole.add('users');
      allowedTabsForRole.add('my-profile');
      allowedTabsForRole.add('teams');
      allowedTabsForRole.add('product-categories');
      allowedTabsForRole.add('knowledge');
      allowedTabsForRole.add('seo-knowledge');
      // Removed 'settings' from allowedTabsForRole
    } else if (isLeader) {
      allowedTabsForRole.add('users');
      allowedTabsForRole.add('my-profile');
    } else if (isChuyenVien) {
      allowedTabsForRole.add('my-profile');
    }

    if (hash && allowedTabsForRole.has(hash)) {
      return hash;
    }
    
    // Fallback to a default allowed tab if hash is invalid or not present
    if (isChuyenVien) return 'my-profile';
    if (isLeader) return 'users';
    if (isAdmin) return 'dashboard';
    return 'my-profile'; // Default for any other case (should be caught by initial redirect)
  };
  
  // Initialize activeTab using a function that depends on userProfile
  const [activeTab, setActiveTab] = useState(() => getInitialTab(undefined)); // Initialize with undefined role

  // Update activeTab once userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setActiveTab(getInitialTab(userProfile.role));
    }
  }, [userProfile]);

  // This useEffect handles URL hash updates and localStorage
  useEffect(() => {
    window.location.hash = activeTab;
    localStorage.setItem('managementActiveTab', activeTab);
  }, [activeTab]);

  // Authentication and Authorization check
  useEffect(() => {
    if (redirectInitiated) return;

    if (!user) {
      setRedirectInitiated(true);
      navigate('/auth');
      return;
    }
    
    // Allow admin, leader, and chuyên viên to access this page
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader' && userProfile.role !== 'chuyên viên') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang management.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/thumbnail'); // Redirect to a default page if not authorized
      return;
    }

    // If user is 'chuyên viên' and tries to access a tab other than 'my-profile', redirect them
    if (userProfile?.role === 'chuyên viên' && activeTab !== 'my-profile') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn chỉ có quyền truy cập hồ sơ của mình.",
        variant: "destructive",
      });
      setActiveTab('my-profile'); // Force set active tab to my-profile
      navigate('/management#my-profile', { replace: true }); // Update URL hash
    }

  }, [user, userProfile, navigate, toast, redirectInitiated, activeTab]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in or not authorized, return null (redirection handled by useEffect)
  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'leader' && userProfile.role !== 'chuyên viên')) return null;

  const isAdmin = userProfile.role === 'admin';
  const isLeader = userProfile.role === 'leader';
  const isChuyenVien = userProfile.role === 'chuyên viên';

  const menuItems = useMemo(() => {
    const items: { id: string; label: string; icon: LucideIcon }[] = [];
    if (isAdmin) {
      items.push({ id: 'dashboard', label: 'Thống kê', icon: BarChart2 });
    }
    items.push(
      { id: 'my-profile', label: 'Hồ sơ của tôi', icon: User }
    );
    // Only add these for Admin/Leader
    if (isAdmin || isLeader) {
      items.push({ id: 'users', label: 'Quản lý User', icon: Users });
    }
    if (isAdmin) {
      items.push(
        { id: 'teams', label: 'Quản lý Team', icon: Users2 },
        { id: 'product-categories', label: 'Quản lý Ngành hàng', icon: Package },
        { id: 'knowledge', label: 'Knowledge Base', icon: Brain },
        { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search },
        // Removed settings item
      );
    }
    return items;
  }, [isAdmin, isLeader]);

  const renderContent = () => {
    // For 'chuyên viên', always render MyProfilePage regardless of activeTab
    if (isChuyenVien) {
      return <MyProfilePage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <DashboardOverview /> : null;
      case 'users':
        return (isAdmin || isLeader) ? <UserManagement /> : null;
      case 'my-profile':
        return <MyProfilePage />;
      case 'teams':
        return isAdmin ? <TeamManagement /> : null;
      case 'product-categories':
        return isAdmin ? <ProductCategoryManagement /> : null;
      case 'knowledge':
        return isAdmin ? <KnowledgeBase /> : null;
      case 'seo-knowledge':
        return isAdmin ? <SeoKnowledgePage /> : null;
      // Removed case for 'settings'
      default:
        // Fallback for invalid or unauthorized tabs
        return isLeader ? <UserManagement /> : (isAdmin ? <DashboardOverview /> : <MyProfilePage />); // Default to MyProfilePage if no other valid tab
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar - Improved Design */}
        <div className={`hidden md:flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 border-r border-gray-200`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-[64px]">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Management
                </h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  // Prevent 'chuyên viên' from navigating to unauthorized tabs
                  if (isChuyenVien && item.id !== 'my-profile') {
                    toast({
                      title: "Không có quyền truy cập",
                      description: "Bạn chỉ có quyền truy cập hồ sơ của mình.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <item.icon size={20} />
                </div>
                {sidebarOpen && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
                {!sidebarOpen && activeTab === item.id && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {userProfile.full_name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{userProfile.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 border-b border-gray-100">
                <SheetTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Management</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-2">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      // Prevent 'chuyên viên' from navigating to unauthorized tabs on mobile
                      if (isChuyenVien && item.id !== 'my-profile') {
                        toast({
                          title: "Không có quyền truy cập",
                          description: "Bạn chỉ có quyền truy cập hồ sơ của mình.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="justify-start text-base py-3 px-4 h-auto"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;