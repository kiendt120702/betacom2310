import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/useUserProfile";
import { useAllPermissions, useRolePermissions, useUserPermissionOverrides, useUpdateUserPermissionOverrides, PermissionNode } from "@/hooks/usePermissions";
import { UserRole } from "@/hooks/types/userTypes";
import { Loader2, Search, CheckCircle2, XCircle, Minus, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

const getPermissionDisplayName = (name: string): string => {
  const nameMap: Record<string, string> = {
    // Thumbnail Management
    manage_thumbnails_root: "Quản lý Thư viện (Gốc)",
    manage_categories: "Quản lý Danh mục",
    manage_thumbnails: "Quản lý Thumbnails",
    approve_thumbnails: "Duyệt Thumbnails",
    create_thumbnails: "Tạo Thumbnails",
    delete_thumbnails: "Xóa Thumbnails",
    edit_thumbnails: "Sửa Thumbnails",
    view_thumbnails: "Xem Thumbnails",
    manage_thumbnail_types: "Quản lý Loại Thumbnail",
    
    // Training Management
    manage_training_root: "Quản lý Đào tạo (Gốc)",
    grade_essays: "Chấm bài Tự luận",
    manage_edu_shopee: "Quản lý Edu Shopee",
    manage_general_training: "Quản lý Đào tạo Chung",
    manage_leader_training: "Quản lý Đào tạo Leader",
    manage_specialist_training: "Quản lý Đào tạo Chuyên viên",
    view_learning_progress: "Xem Tiến độ học tập",
    
    // System Access
    system_access: "Truy cập hệ thống",
    access_admin_panel: "Truy cập Admin Panel",
    access_leader_view: "Truy cập Leader View",
    
    // User Management
    manage_users_root: "Quản lý Người dùng (Gốc)",
    manage_permissions: "Quản lý Quyền hạn",
    manage_roles: "Quản lý Vai trò",
    manage_teams: "Quản lý Phòng ban",
    manage_users: "Quản lý Người dùng",
    create_users: "Tạo Người dùng",
    delete_users: "Xóa Người dùng",
    edit_users: "Sửa Người dùng",
    view_users: "Xem Người dùng",
    
    // Sales & Revenue Management
    manage_sales_root: "Quản lý Bán hàng (Gốc)",
    view_sales_dashboard: "Xem Dashboard Bán hàng",
    manage_daily_sales_report: "Quản lý Báo cáo Bán hàng Hàng ngày",
    upload_revenue_excel: "Upload Excel Doanh thu",
    manage_comprehensive_reports: "Quản lý Báo cáo Tổng hợp",
    upload_multi_day_reports: "Upload Báo cáo Nhiều ngày",
    view_revenue_analytics: "Xem Phân tích Doanh thu",
    manage_goal_setting: "Quản lý Thiết lập Mục tiêu",
    view_shop_performance: "Xem Hiệu suất Cửa hàng",
    export_sales_data: "Xuất Dữ liệu Bán hàng",
    
    // Shop Management
    manage_shops_root: "Quản lý Cửa hàng (Gốc)",
    create_shops: "Tạo Cửa hàng",
    edit_shops: "Sửa Cửa hàng",
    delete_shops: "Xóa Cửa hàng",
    view_shops: "Xem Cửa hàng",
    assign_shop_leaders: "Phân công Leader Cửa hàng",
    manage_shop_performance: "Quản lý Hiệu suất Cửa hàng",
    
    // Employee & Personnel Management
    manage_employees_root: "Quản lý Nhân viên (Gốc)",
    create_employees: "Tạo Nhân viên",
    edit_employees: "Sửa Nhân viên",
    delete_employees: "Xóa Nhân viên",
    view_employees: "Xem Nhân viên",
    manage_personnel_assignments: "Quản lý Phân công Nhân sự",
    view_organizational_chart: "Xem Sơ đồ Tổ chức",
    manage_manager_relationships: "Quản lý Quan hệ Quản lý",
    bulk_import_employees: "Nhập Nhân viên Hàng loạt",
    
    // AI & GPT Integration
    manage_ai_root: "Quản lý AI (Gốc)",
    access_gpt_chat: "Truy cập Chat GPT",
    manage_gpt_conversations: "Quản lý Cuộc hội thoại GPT",
    generate_seo_content: "Tạo Nội dung SEO",
    access_ai_tools: "Truy cập Công cụ AI",
    manage_ai_settings: "Quản lý Cài đặt AI",
    
    // Dashboard & Analytics
    manage_dashboards_root: "Quản lý Dashboard (Gốc)",
    view_executive_dashboard: "Xem Dashboard Điều hành",
    view_sales_analytics: "Xem Phân tích Bán hàng",
    view_training_analytics: "Xem Phân tích Đào tạo",
    view_user_analytics: "Xem Phân tích Người dùng",
    export_analytics_data: "Xuất Dữ liệu Phân tích",
    manage_kpi_metrics: "Quản lý Chỉ số KPI",
    
    // Content Management
    manage_content_root: "Quản lý Nội dung (Gốc)",
    manage_theory_content: "Quản lý Nội dung Lý thuyết",
    access_wysiwyg_editor: "Truy cập Trình soạn thảo WYSIWYG",
    upload_training_videos: "Upload Video Đào tạo",
    manage_video_content: "Quản lý Nội dung Video",
    create_quiz_questions: "Tạo Câu hỏi Quiz",
    manage_essay_questions: "Quản lý Câu hỏi Tự luận",
    manage_practice_exercises: "Quản lý Bài tập Thực hành",
    
    // Assessment & Evaluation
    manage_assessments_root: "Quản lý Đánh giá (Gốc)",
    create_quizzes: "Tạo Quiz",
    edit_quizzes: "Sửa Quiz",
    delete_quizzes: "Xóa Quiz",
    view_quiz_results: "Xem Kết quả Quiz",
    grade_essays_manual: "Chấm bài Tự luận Thủ công",
    manage_grading_workflows: "Quản lý Quy trình Chấm điểm",
    export_assessment_data: "Xuất Dữ liệu Đánh giá",
    
    // Delivery & Logistics
    manage_delivery_root: "Quản lý Giao hàng (Gốc)",
    access_fast_delivery_theory: "Truy cập Lý thuyết Giao hàng Nhanh",
    use_delivery_calculator: "Sử dụng Máy tính Giao hàng",
    manage_delivery_metrics: "Quản lý Chỉ số Giao hàng",
    view_delivery_performance: "Xem Hiệu suất Giao hàng",
    
    // Feedback & Quality Assurance
    manage_feedback_root: "Quản lý Phản hồi (Gốc)",
    view_user_feedback: "Xem Phản hồi Người dùng",
    manage_bug_reports: "Quản lý Báo cáo Lỗi",
    handle_feature_requests: "Xử lý Yêu cầu Tính năng",
    manage_system_improvements: "Quản lý Cải tiến Hệ thống",
    export_feedback_data: "Xuất Dữ liệu Phản hồi",
    
    // Utilities & Tools
    manage_utilities_root: "Quản lý Tiện ích (Gốc)",
    access_rating_calculator: "Truy cập Máy tính Đánh giá",
    manage_seo_tools: "Quản lý Công cụ SEO",
    access_system_utilities: "Truy cập Tiện ích Hệ thống",
    manage_calculation_tools: "Quản lý Công cụ Tính toán",
    
    // Data Import/Export
    manage_data_operations_root: "Quản lý Thao tác Dữ liệu (Gốc)",
    bulk_import_users: "Nhập Người dùng Hàng loạt",
    export_user_data: "Xuất Dữ liệu Người dùng",
    upload_excel_files: "Upload File Excel",
    process_bulk_operations: "Xử lý Thao tác Hàng loạt",
    manage_data_migrations: "Quản lý Di chuyển Dữ liệu",
    
    // Leader-Specific Permissions
    manage_leader_functions_root: "Quản lý Chức năng Leader (Gốc)",
    access_leader_dashboard: "Truy cập Dashboard Leader",
    manage_team_personnel: "Quản lý Nhân sự Nhóm",
    view_team_performance: "Xem Hiệu suất Nhóm",
    assign_team_members: "Phân công Thành viên Nhóm",
    manage_team_goals: "Quản lý Mục tiêu Nhóm",
  };
  return nameMap[name] || name;
};

interface PermissionsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Memoized permission item component for better performance
const PermissionItem = memo<{
  node: PermissionNode;
  level: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
  searchTerm: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}>(({ node, level, checked, onChange, searchTerm, isExpanded, onToggleExpanded }) => {
  const displayName = getPermissionDisplayName(node.name);
  const hasChildren = node.children.length > 0;
  const matchesSearch = searchTerm === '' || displayName.toLowerCase().includes(searchTerm.toLowerCase());
  
  if (!matchesSearch && !hasChildren) return null;
  
  return (
    <div className="w-full">
      <div 
        style={{ marginLeft: `${level * 16}px` }} 
        className="flex items-center space-x-2 py-1.5 hover:bg-muted/50 rounded-sm px-2 -mx-2 transition-colors"
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggleExpanded}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-6" />
        )}
        <Checkbox
          id={node.id}
          checked={checked}
          onCheckedChange={onChange}
          className="flex-shrink-0"
        />
        <Label 
          htmlFor={node.id} 
          className="text-sm cursor-pointer flex-1 min-w-0 break-words leading-relaxed"
        >
          {displayName}
        </Label>
        {checked && (
          <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map(child => (
            <PermissionItemContainer
              key={child.id}
              node={child}
              level={level + 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Container component to manage state for each permission item
const PermissionItemContainer: React.FC<{
  node: PermissionNode;
  level: number;
  searchTerm: string;
}> = ({ node, level, searchTerm }) => {
  const { permissionState, handlePermissionChange, expandedNodes, toggleExpanded } = usePermissionContext();
  
  return (
    <PermissionItem
      node={node}
      level={level}
      checked={permissionState[node.id] || false}
      onChange={(checked) => handlePermissionChange(node.id, checked)}
      searchTerm={searchTerm}
      isExpanded={expandedNodes.has(node.id)}
      onToggleExpanded={() => toggleExpanded(node.id)}
    />
  );
};

// Context for permission state management
const PermissionContext = React.createContext<{
  permissionState: Record<string, boolean>;
  handlePermissionChange: (id: string, checked: boolean) => void;
  expandedNodes: Set<string>;
  toggleExpanded: (id: string) => void;
} | null>(null);

const usePermissionContext = () => {
  const context = React.useContext(PermissionContext);
  if (!context) throw new Error('usePermissionContext must be used within PermissionContext');
  return context;
};

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ user, open, onOpenChange }) => {
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { data: allPermissions = [], isLoading: permissionsLoading } = useAllPermissions();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRolePermissions(user.role);
  const { data: userOverrides, isLoading: overridesLoading } = useUserPermissionOverrides(user.id);
  const updateUserOverrides = useUpdateUserPermissionOverrides();

  useEffect(() => {
    if (rolePermissions && userOverrides) {
      const initialState: Record<string, boolean> = {};
      const grantOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'grant').map(o => o.permission_id));
      const denyOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'deny').map(o => o.permission_id));

      const allPermissionIds: string[] = [];
      const flatten = (nodes: PermissionNode[]) => {
        nodes.forEach(node => {
          allPermissionIds.push(node.id);
          if (node.children) flatten(node.children);
        });
      };
      flatten(allPermissions);

      allPermissionIds.forEach(id => {
        if (grantOverrides.has(id)) {
          initialState[id] = true;
        } else if (denyOverrides.has(id)) {
          initialState[id] = false;
        } else {
          initialState[id] = rolePermissions.includes(id);
        }
      });
      setPermissionState(initialState);
    }
  }, [rolePermissions, userOverrides, allPermissions]);

  const handlePermissionChange = useCallback((permissionId: string, checked: boolean) => {
    setPermissionState(prev => ({ ...prev, [permissionId]: checked }));
  }, []);
  
  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Auto-expand nodes that match search
  useEffect(() => {
    if (searchTerm && allPermissions.length > 0) {
      const nodesToExpand = new Set<string>();
      
      const searchAndExpand = (nodes: PermissionNode[]) => {
        nodes.forEach(node => {
          const displayName = getPermissionDisplayName(node.name);
          if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
            // Expand all parent nodes
            let current = node.parent_id;
            while (current) {
              nodesToExpand.add(current);
              const parentNode = allPermissions.find(n => n.id === current);
              current = parentNode?.parent_id;
            }
          }
          if (node.children.length > 0) {
            searchAndExpand(node.children);
          }
        });
      };
      
      searchAndExpand(allPermissions);
      setExpandedNodes(prev => new Set([...prev, ...nodesToExpand]));
    }
  }, [searchTerm, allPermissions]);

  const handleSave = useCallback(() => {
    const permissionOverrides: { permission_id: string; permission_type: 'grant' | 'deny' }[] = [];
    
    Object.entries(permissionState).forEach(([permissionId, isChecked]) => {
      const isRolePermission = rolePermissions?.includes(permissionId);
      
      if (isChecked && !isRolePermission) {
        permissionOverrides.push({ permission_id: permissionId, permission_type: 'grant' });
      } else if (!isChecked && isRolePermission) {
        permissionOverrides.push({ permission_id: permissionId, permission_type: 'deny' });
      }
    });

    updateUserOverrides.mutate({
      userId: user.id,
      permissionOverrides,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  }, [permissionState, rolePermissions, updateUserOverrides, user.id, onOpenChange]);
  
  // Bulk actions
  const handleSelectAll = useCallback(() => {
    const allPermissionIds: string[] = [];
    const flatten = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        allPermissionIds.push(node.id);
        if (node.children) flatten(node.children);
      });
    };
    flatten(allPermissions);
    
    const newState: Record<string, boolean> = {};
    allPermissionIds.forEach(id => {
      newState[id] = true;
    });
    setPermissionState(newState);
  }, [allPermissions]);
  
  const handleDeselectAll = useCallback(() => {
    const allPermissionIds: string[] = [];
    const flatten = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        allPermissionIds.push(node.id);
        if (node.children) flatten(node.children);
      });
    };
    flatten(allPermissions);
    
    const newState: Record<string, boolean> = {};
    allPermissionIds.forEach(id => {
      newState[id] = false;
    });
    setPermissionState(newState);
  }, [allPermissions]);
  
  const handleResetToRole = useCallback(() => {
    const allPermissionIds: string[] = [];
    const flatten = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        allPermissionIds.push(node.id);
        if (node.children) flatten(node.children);
      });
    };
    flatten(allPermissions);
    
    const newState: Record<string, boolean> = {};
    allPermissionIds.forEach(id => {
      newState[id] = rolePermissions?.includes(id) || false;
    });
    setPermissionState(newState);
  }, [allPermissions, rolePermissions]);
  
  const handleExpandAll = useCallback(() => {
    const allNodeIds: string[] = [];
    const collectIds = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          allNodeIds.push(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(allPermissions);
    setExpandedNodes(new Set(allNodeIds));
  }, [allPermissions]);
  
  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  // Stats for display
  const permissionStats = useMemo(() => {
    const allPermissionIds: string[] = [];
    const flatten = (nodes: PermissionNode[]) => {
      nodes.forEach(node => {
        allPermissionIds.push(node.id);
        if (node.children) flatten(node.children);
      });
    };
    flatten(allPermissions);
    
    const total = allPermissionIds.length;
    const granted = allPermissionIds.filter(id => permissionState[id]).length;
    const roleGranted = rolePermissions ? allPermissionIds.filter(id => rolePermissions.includes(id)).length : 0;
    
    return { total, granted, roleGranted };
  }, [allPermissions, permissionState, rolePermissions]);

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return allPermissions;
    
    const filtered: PermissionNode[] = [];
    const filterNodes = (nodes: PermissionNode[]): PermissionNode[] => {
      return nodes.filter(node => {
        const displayName = getPermissionDisplayName(node.name);
        const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const filteredChildren = node.children.length > 0 ? filterNodes(node.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren
          };
        }
        return false;
      }).map(node => ({
        ...node,
        children: node.children.length > 0 ? filterNodes(node.children) : []
      }));
    };
    
    return filterNodes(allPermissions);
  }, [allPermissions, searchTerm]);
  
  const contextValue = useMemo(() => ({
    permissionState,
    handlePermissionChange,
    expandedNodes,
    toggleExpanded
  }), [permissionState, handlePermissionChange, expandedNodes, toggleExpanded]);

  const isLoading = permissionsLoading || rolePermissionsLoading || overridesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Phân quyền cho: {user.full_name || user.email}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span>Vai trò:</span>
              <Badge variant="secondary">{user.role}</Badge>
              {user.teams?.name && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>Phòng ban:</span>
                  <Badge variant="outline">{user.teams.name}</Badge>
                </>
              )}
              {user.manager?.full_name && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>Quản lý:</span>
                  <Badge variant="outline">{user.manager.full_name}</Badge>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col pt-4 min-h-0">
          {/* Permission Management Header */}
          <div className="flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Quyền hạn chi tiết</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {permissionStats.granted}/{permissionStats.total} quyền
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Vai trò: {permissionStats.roleGranted} quyền
                </Badge>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm quyền hạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-7"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs h-7"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Bỏ chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToRole}
                  className="text-xs h-7"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Reset về vai trò
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandAll}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Mở rộng
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="text-xs h-7"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Thu gọn
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Permission Tree */}
          <div className="flex-1 border rounded-md overflow-hidden min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-1">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <PermissionContext.Provider value={contextValue}>
                    {filteredPermissions.length > 0 ? (
                      filteredPermissions.map(node => (
                        <PermissionItemContainer
                          key={node.id}
                          node={node}
                          level={0}
                          searchTerm={searchTerm}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div>Không tìm thấy quyền hạn phù hợp</div>
                      </div>
                    )}
                  </PermissionContext.Provider>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="pt-4 flex-shrink-0 flex-col sm:flex-row gap-2 border-t bg-background">
          <div className="flex-1 text-sm text-muted-foreground">
            {permissionStats.granted !== permissionStats.roleGranted && (
              <div>Có {Math.abs(permissionStats.granted - permissionStats.roleGranted)} thay đổi so với vai trò mặc định</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={updateUserOverrides.isPending}>
              {updateUserOverrides.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi ({permissionStats.granted} quyền)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;