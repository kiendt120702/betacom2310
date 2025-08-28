import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  LogOut,
  Search,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useActiveSessions, useLogoutSession, formatDeviceInfo, type ActiveSession } from "@/hooks/useLoginTracking";
import { useDebounce } from "@/hooks/useDebounce";
import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ActiveSessionsTableProps {
  userId?: string;
  showUserColumn?: boolean;
}

const ActiveSessionsTable: React.FC<ActiveSessionsTableProps> = ({ 
  userId, 
  showUserColumn = true 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const { data: activeSessions = [], isLoading, refetch } = useActiveSessions(userId);
  const logoutSessionMutation = useLogoutSession();

  // Filter sessions based on search criteria
  const filteredSessions = useMemo(() => {
    return activeSessions.filter(session => {
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

      // Device filter
      if (deviceFilter !== 'all') {
        if (deviceFilter === 'desktop' && session.device_type !== 'desktop') return false;
        if (deviceFilter === 'mobile' && session.device_type !== 'mobile') return false;
        if (deviceFilter === 'tablet' && session.device_type !== 'tablet') return false;
      }

      return true;
    });
  }, [activeSessions, debouncedSearchTerm, deviceFilter]);

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'tablet') return <Tablet className="h-4 w-4" />;
    if (deviceType === 'mobile') return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getActivityStatus = (lastActivity: string) => {
    const now = new Date();
    const activityTime = new Date(lastActivity);
    const diffInMinutes = (now.getTime() - activityTime.getTime()) / (1000 * 60);

    if (diffInMinutes < 5) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Đang hoạt động
        </Badge>
      );
    } else if (diffInMinutes < 30) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Không hoạt động
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Có thể hết hạn
        </Badge>
      );
    }
  };

  const handleLogoutSession = async (sessionId: string, sessionUserId: string) => {
    try {
      await logoutSessionMutation.mutateAsync({
        userId: sessionUserId,
        sessionId
      });

      toast({
        title: "Đăng xuất thành công",
        description: "Phiên làm việc đã được đăng xuất",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất phiên làm việc",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDeviceFilter('all');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Phiên hoạt động
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Theo dõi các phiên đăng nhập đang hoạt động
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
              
              {(searchTerm || deviceFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Active Sessions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {showUserColumn && <TableHead>Người dùng</TableHead>}
                  <TableHead>Địa chỉ IP</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian đăng nhập</TableHead>
                  <TableHead>Hoạt động gần nhất</TableHead>
                  <TableHead>Hành động</TableHead>
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
                    <TableRow key={session.session_id} className="hover:bg-muted/50">
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <div className="flex flex-col">
                            <div className="text-sm">{formatDeviceInfo(session)}</div>
                            <div className="text-xs text-muted-foreground">
                              {session.browser_name} • {session.os_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActivityStatus(session.last_activity)}
                        {session.is_current && (
                          <Badge variant="outline" className="ml-1 bg-blue-100 text-blue-800 border-blue-200">
                            Hiện tại
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <div className="text-sm">
                              {format(new Date(session.login_time), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistance(new Date(session.login_time), new Date(), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="flex flex-col">
                            <div className="text-sm">
                              {format(new Date(session.last_activity), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistance(new Date(session.last_activity), new Date(), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLogoutSession(session.session_id, session.user_id)}
                          disabled={logoutSessionMutation.isPending}
                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Đăng xuất
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={showUserColumn ? 7 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Monitor className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          {searchTerm || deviceFilter !== 'all' ? 
                            'Không có phiên hoạt động phù hợp với bộ lọc.' : 
                            'Không có phiên hoạt động nào.'
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
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Hiển thị {filteredSessions.length} phiên hoạt động
                {(searchTerm || deviceFilter !== 'all') && (
                  <span> (đã lọc từ {activeSessions.length} tổng cộng)</span>
                )}
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {activeSessions.filter(s => {
                    const diffInMinutes = (new Date().getTime() - new Date(s.last_activity).getTime()) / (1000 * 60);
                    return diffInMinutes < 5;
                  }).length} đang hoạt động
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {activeSessions.filter(s => {
                    const diffInMinutes = (new Date().getTime() - new Date(s.last_activity).getTime()) / (1000 * 60);
                    return diffInMinutes >= 5 && diffInMinutes < 30;
                  }).length} không hoạt động
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSessionsTable;