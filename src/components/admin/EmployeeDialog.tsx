import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEmployee, useUpdateEmployee, Employee, CreateEmployeeData } from "@/hooks/useEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  role: z.enum(["personnel", "leader"], { required_error: "Vai trò là bắt buộc" }),
  leader_id: z.string().nullable().optional(),
  team_id: z.string().nullable().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  initialRole?: 'personnel' | 'leader';
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange, employee, initialRole }) => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const isEditing = !!employee;
  const roleForLogic = isEditing ? watch("role") : initialRole;

  const leaderOptions = useMemo(() => employees.filter(e => e.role === 'leader'), [employees]);

  useEffect(() => {
    if (open) {
      if (employee) { // Editing mode
        reset({
          name: employee.name,
          role: employee.role,
          leader_id: employee.leader_id,
          team_id: employee.team_id,
        });
      } else { // Adding mode
        reset({
          name: "",
          role: initialRole,
          leader_id: null,
          team_id: null,
        });
      }
    }
  }, [employee, initialRole, open, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    let submissionData: CreateEmployeeData;

    if (isEditing) {
      submissionData = {
        name: data.name,
        role: data.role,
        leader_id: data.leader_id || null,
        team_id: data.team_id || null,
      };
      await updateEmployee.mutateAsync({ id: employee.id, ...submissionData });
    } else { // Adding mode
      if (initialRole === 'personnel') {
        const selectedLeader = employees.find(e => e.id === data.leader_id);
        submissionData = {
          name: data.name,
          role: 'personnel',
          leader_id: data.leader_id || null,
          team_id: selectedLeader?.team_id || null,
        };
      } else { // Adding leader
        submissionData = {
          name: data.name,
          role: 'leader',
          leader_id: null,
          team_id: data.team_id || null,
        };
      }
      await createEmployee.mutateAsync(submissionData);
    }
    onOpenChange(false);
  };

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Nhân sự" : (initialRole === 'leader' ? "Thêm Leader mới" : "Thêm Nhân sự mới")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {isEditing && (
            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personnel">Nhân sự</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>
          )}

          {(roleForLogic === 'leader' || isEditing) && (
            <div>
              <Label htmlFor="team_id">Team</Label>
              <Controller
                name="team_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "null-option"} disabled={teamsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null-option">Không có team</SelectItem>
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {roleForLogic === "personnel" && (
            <div>
              <Label htmlFor="leader_id">Leader quản lý</Label>
              <Controller
                name="leader_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "null-option"} disabled={employeesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn leader..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null-option">Không có</SelectItem>
                      {leaderOptions.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employee ? "Lưu thay đổi" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;