import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  Shield, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";
import { useLoginHistory, formatDeviceInfo, formatLocationInfo, type LoginSession } from "@/hooks/useLoginTracking";
import { useDebounce } from "@/hooks/useDebounce";
import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";

interface LoginHistoryTableProps {
  userId?: string;
  showUserColumn?: boolean;
  limit?: number;
}

const LoginHistoryTable: React.FC<LoginHistoryTableProps> = ({ 
  userId, 
  showUserColumn = true,
  limit = 100 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: loginHistoryData, isLoading, refetch } = useLoginHistory(
    userId, 
    limit, 
    (page - 1) * pageSize
  );

  const loginHistory = loginHistoryData?.sessions || [];
  const totalCount = loginHistoryData?.totalCount || 0;

  // Filter sessions based on search criteria
  const filteredSessions = useMemo(() => {
    return loginHistory.filter(session => {
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = 
          session.email?.toLowerCase().includes(searchLower) ||
          session.ip_address?.includes(searchLower) ||
          session.browser_name?.toLowerCase().includes(searchLower) ||
          session.os_name?.toLowerCase().includes(searchLower) ||
          formatDeviceInfo(session).toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'success' && !session.success) return false;
        if (statusFilter === 'failed' && session.success) return false;
      }

      // Device filter
      if (deviceFilter !== 'all') {
        if (deviceFilter === 'desktop' && session.device_type !== 'desktop') return false;
        if (deviceFilter === 'mobile' && session.device_type !== 'mobile') return false;
        if (deviceFilter === 'tablet' && session.device_type !== 'tablet') return false;
      }

      return true;
    });
  }, [loginHistory, debouncedSearchTerm, statusFilter, deviceFilter]);

  const getDeviceIcon = (deviceType: string, isMobile: boolean) => {
    if (deviceType === 'tablet') return <Tablet className="h-4 w-4" />;
    if (isMobile || deviceType === 'mobile') return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getStatusBadge = (session: LoginSession) => {
    if (session.success) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          Thành công
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Thất bại
        </Badge>
      );
    }
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return 'N/A';
    
    // Parse PostgreSQL interval format
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    }
    
    return duration;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDeviceFilter('all');
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Lịch sử đăng nhập
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Theo dõi địa chỉ IP và thiết bị đăng nhập
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo email, IP, thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || statusFilter !== 'all' || deviceFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {loginHistory.filter(s => s.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Thành công</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {loginHistory.filter(s => !s.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Thất bại</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(loginHistory.map(s => s.ip_address)).size}
              </div>
              <div className="text-sm text-muted-foreground">IP khác nhau</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {loginHistory.filter(s => s.is_mobile).length}
              </div>
              <div className="text-sm text-muted-foreground">Từ Mobile</div>
            </div>
          </div>

          {/* Login History Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {showUserColumn && <TableHead>Người dùng</TableHead>}
                  <TableHead>Địa chỉ IP</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showUserColumn ? 7 : 6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        Đang tải...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-muted/50">
                      {showUserColumn && (
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-sm">{session.email}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {session.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {session.ip_address || 'Unknown'}
                          </code>
                        </div>
                        {session.location_info && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatLocationInfo(session.location_info)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type, session.is_mobile)}
                          <div className="flex flex-col">
                            <div className="text-sm">{formatDeviceInfo(session)}</div>
                            <div className="text-xs text-muted-foreground">
                              {session.browser_name} {session.browser_version}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(session)}
                        {!session.success && session.failure_reason && (
                          <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate">
                            {session.failure_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <div className="text-sm">
                              {format(new Date(session.login_time), "dd/MM/yyyy", { locale: vi })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(session.login_time), "HH:mm:ss", { locale: vi })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {session.logout_time ? formatDuration(session.session_duration) : 'Đang hoạt động'}
                        </div>
                        {session.logout_time && (
                          <div className="text-xs text-muted-foreground">
                            Đăng xuất: {format(new Date(session.logout_time), "HH:mm", { locale: vi })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={showUserColumn ? 7 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || deviceFilter !== 'all' ? 
                            'Không có lịch sử đăng nhập phù hợp với bộ lọc.' : 
                            'Chưa có lịch sử đăng nhập.'
                          }
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredSessions.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Hiển thị {filteredSessions.length} lần đăng nhập
              {(searchTerm || statusFilter !== 'all' || deviceFilter !== 'all') && (
                <span> (đã lọc từ {totalCount} tổng cộng)</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginHistoryTable;