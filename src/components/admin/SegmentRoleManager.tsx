import React, { useState, useEffect, useMemo } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useSegments, Segment } from '@/hooks/useSegments';
import { useProfileSegmentRoles, useUpsertProfileSegmentRoles, useDeleteProfileSegmentRoles, ProfileSegmentRole } from '@/hooks/useProfileSegmentRoles';
import { useUsers } from '@/hooks/useUsers';
import { UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types/enums';

interface SegmentRoleManagerProps {
  user: UserProfile;
}

const SegmentRoleManager: React.FC<SegmentRoleManagerProps> = ({ user }) => {
  const { data: departments } = useTeams();
  const vanHanhDept = useMemo(() => departments?.find(d => d.name === 'Phòng Vận Hành'), [departments]);
  const { data: segments = [] } = useSegments(vanHanhDept?.id);
  const { data: currentRoles = [], isLoading: rolesLoading } = useProfileSegmentRoles(user.id);
  const { data: usersData } = useUsers({ page: 1, pageSize: 1000, searchTerm: "", selectedRole: "all", selectedTeam: "all", selectedManager: "all" });
  const leaders = useMemo(() => usersData?.users.filter(u => u.role === 'leader') || [], [usersData]);

  const upsertMutation = useUpsertProfileSegmentRoles();
  const deleteMutation = useDeleteProfileSegmentRoles();

  const [segmentStates, setSegmentStates] = useState<Record<string, {
    enabled: boolean;
    role: string;
    manager_id: string | null;
    existing_id?: string;
  }>>({});

  useEffect(() => {
    if (segments.length > 0) {
      const initialStates: typeof segmentStates = {};
      segments.forEach(segment => {
        const existingRole = currentRoles.find(r => r.segment_id === segment.id);
        initialStates[segment.id] = {
          enabled: !!existingRole,
          role: existingRole?.role || 'chuyên viên',
          manager_id: existingRole?.manager_id || null,
          existing_id: existingRole?.id,
        };
      });
      setSegmentStates(initialStates);
    }
  }, [segments, currentRoles]);

  const handleSave = async () => {
    const toUpsert: any[] = [];
    const toDelete: string[] = [];

    segments.forEach(segment => {
      const state = segmentStates[segment.id];
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
    setSegmentStates(prev => ({
      ...prev,
      [segmentId]: { ...prev[segmentId], enabled }
    }));
  };

  const handleRoleChange = (segmentId: string, role: string) => {
    setSegmentStates(prev => ({
      ...prev,
      [segmentId]: { ...prev[segmentId], role }
    }));
  };

  const handleManagerChange = (segmentId: string, manager_id: string) => {
    setSegmentStates(prev => ({
      ...prev,
      [segmentId]: { ...prev[segmentId], manager_id: manager_id === 'none' ? null : manager_id }
    }));
  };

  if (!vanHanhDept || user.team_id !== vanHanhDept.id) {
    return null;
  }

  if (rolesLoading) {
    return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân công theo mảng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {segments.map(segment => (
          <div key={segment.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor={`switch-${segment.id}`} className="text-lg font-semibold">{segment.name}</Label>
              <Switch
                id={`switch-${segment.id}`}
                checked={segmentStates[segment.id]?.enabled || false}
                onCheckedChange={(checked) => handleToggle(segment.id, checked)}
              />
            </div>
            {segmentStates[segment.id]?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select value={segmentStates[segment.id]?.role} onValueChange={(value) => handleRoleChange(segment.id, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.user_role.filter(r => r !== 'deleted').map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leader quản lý</Label>
                  <Select value={segmentStates[segment.id]?.manager_id || 'none'} onValueChange={(value) => handleManagerChange(segment.id, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {leaders.map(leader => (
                        <SelectItem key={leader.id} value={leader.id}>{leader.full_name || leader.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={upsertMutation.isPending || deleteMutation.isPending}>
            {upsertMutation.isPending || deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu phân công
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SegmentRoleManager;