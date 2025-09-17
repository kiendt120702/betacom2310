import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useSegments } from '@/hooks/useSegments';
import { useProfileSegmentRoles, useUpsertProfileSegmentRoles, useDeleteProfileSegmentRoles } from '@/hooks/useProfileSegmentRoles';
import { useUsers } from '@/hooks/useUsers';
import { UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types/enums';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SegmentRoleManagerProps {
  user: UserProfile;
  departmentId: string | null;
}

type SegmentState = {
  enabled: boolean;
  role: string;
  manager_id: string | null;
  existing_id?: string;
};

const SegmentRoleManager: React.FC<SegmentRoleManagerProps> = ({ user, departmentId }) => {
  const { data: departments } = useTeams();
  const { data: segments = [], isLoading: segmentsLoading } = useSegments(departmentId || undefined);
  const { data: currentRoles = [], isLoading: rolesLoading } = useProfileSegmentRoles(user.id);
  const { data: usersData } = useUsers({ page: 1, pageSize: 1000, searchTerm: "", selectedRole: "all", selectedTeam: "all", selectedManager: "all" });
  const leaders = useMemo(() => usersData?.users.filter((profile) => profile.role === 'leader') || [], [usersData]);

  const upsertMutation = useUpsertProfileSegmentRoles();
  const deleteMutation = useDeleteProfileSegmentRoles();

  const [segmentStates, setSegmentStates] = useState<Record<string, SegmentState>>({});
  const initializedContext = useRef<string | null>(null);

  useEffect(() => {
    initializedContext.current = null;
    setSegmentStates({});
  }, [user.id, departmentId]);

  useEffect(() => {
    if (!departmentId) {
      setSegmentStates({});
      return;
    }
    if (segmentsLoading || rolesLoading) {
      return;
    }

    const roleMap = new Map(currentRoles.map((role) => [role.segment_id, role]));
    const nextState = segments.reduce<Record<string, SegmentState>>((acc, segment) => {
      const existingRole = roleMap.get(segment.id);
      acc[segment.id] = {
        enabled: !!existingRole,
        role: existingRole?.role || 'chuyên viên',
        manager_id: existingRole?.manager_id || null,
        existing_id: existingRole?.id,
      };
      return acc;
    }, {});

    setSegmentStates((previous) => {
      const contextKey = `${user.id}-${departmentId}`;
      const shouldReset =
        initializedContext.current !== contextKey ||
        Object.keys(previous).length !== segments.length ||
        segments.some((segment) => {
          const prevState = previous[segment.id];
          const newState = nextState[segment.id];
          if (!prevState) return true;
          return (
            prevState.existing_id !== newState.existing_id ||
            prevState.enabled !== newState.enabled ||
            prevState.role !== newState.role ||
            prevState.manager_id !== newState.manager_id
          );
        });

      if (shouldReset) {
        initializedContext.current = contextKey;
        return nextState;
      }

      return previous;
    });
  }, [segments, currentRoles, segmentsLoading, rolesLoading, departmentId, user.id]);

  const handleSave = async () => {
    const toUpsert: any[] = [];
    const toDelete: string[] = [];

    segments.forEach((segment) => {
      const state = segmentStates[segment.id];
      if (!state) return;

      if (state.enabled) {
        const upsertData: any = {
          profile_id: user.id,
          segment_id: segment.id,
          role: state.role,
          manager_id: state.manager_id,
        };
        if (state.existing_id) {
          upsertData.id = state.existing_id;
        }
        toUpsert.push(upsertData);
      } else if (state.existing_id) {
        toDelete.push(state.existing_id);
      }
    });

    if (toDelete.length > 0) {
      await deleteMutation.mutateAsync(toDelete);
    }
    if (toUpsert.length > 0) {
      await upsertMutation.mutateAsync(toUpsert);
    }
  };

  const handleToggle = (segmentId: string, enabled: boolean) => {
    setSegmentStates((previous) => ({
      ...previous,
      [segmentId]: { ...previous[segmentId], enabled },
    }));
  };

  const handleRoleChange = (segmentId: string, role: string) => {
    setSegmentStates((previous) => ({
      ...previous,
      [segmentId]: { ...previous[segmentId], role },
    }));
  };

  const handleManagerChange = (segmentId: string, managerId: string) => {
    setSegmentStates((previous) => ({
      ...previous,
      [segmentId]: {
        ...previous[segmentId],
        manager_id: managerId === 'none' ? null : managerId,
      },
    }));
  };

  const departmentName = useMemo(() => {
    return departments?.find((department) => department.id === departmentId)?.name;
  }, [departments, departmentId]);

  if (!departmentId) {
    return null;
  }

  if (rolesLoading || segmentsLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân công theo mảng</CardTitle>
        <CardDescription>
          Quản lý vai trò và leader cho từng mảng trong phòng ban:
          {" "}
          <strong>{departmentName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {segments.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mảng</TableHead>
                  <TableHead className="text-center w-[100px]">Kích hoạt</TableHead>
                  <TableHead className="w-[200px]">Vai trò</TableHead>
                  <TableHead className="w-[200px]">Leader quản lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((segment) => {
                  const state = segmentStates[segment.id];
                  return (
                    <TableRow key={segment.id}>
                      <TableCell className="font-semibold">{segment.name}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={state?.enabled ?? false}
                          onCheckedChange={(checked) => handleToggle(segment.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {state?.enabled && (
                          <Select
                            value={state.role}
                            onValueChange={(value) => handleRoleChange(segment.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              {Constants.public.Enums.user_role
                                .filter((role) => role !== 'deleted')
                                .map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {state?.enabled && (
                          <Select
                            value={state.manager_id || 'none'}
                            onValueChange={(value) => handleManagerChange(segment.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn leader" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Không có</SelectItem>
                              {leaders.map((leader) => (
                                <SelectItem key={leader.id} value={leader.id}>
                                  {leader.full_name || leader.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Phòng ban này chưa có mảng nào được định nghĩa.
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={upsertMutation.isPending || deleteMutation.isPending}
          >
            {upsertMutation.isPending || deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu phân công
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SegmentRoleManager;