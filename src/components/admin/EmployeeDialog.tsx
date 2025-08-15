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
import { useTeams } from "@/hooks/useTeams"; // Import useTeams
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  role: z.enum(["personnel", "leader"], { required_error: "Vai trò là bắt buộc" }),
  leader_id: z.string().nullable().optional(),
  team_id: z.string().nullable().optional(), // Add team_id to schema
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange, employee }) => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: teams = [], isLoading: teamsLoading } = useTeams(); // Fetch teams

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const selectedRole = watch("role"); // Watch the role field
  const selectedTeamId = watch("team_id"); // Watch the team_id field

  const leaderOptions = useMemo(() => employees.filter(e => e.role === 'leader'), [employees]);

  useEffect(() => {
    if (employee) {
      reset({ 
        name: employee.name, 
        role: employee.role, 
        leader_id: employee.leader_id,
        team_id: employee.team_id || null, // Initialize team_id
      });
    } else {
      reset({ name: "", role: "personnel", leader_id: null, team_id: null });
    }
  }, [employee, open, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    const newEmployeeData: CreateEmployeeData = {
      name: data.name,
      role: data.role,
      leader_id: data.leader_id || null,
      team_id: data.team_id || null, // Ensure team_id is passed
    };

    if (employee) {
      await updateEmployee.mutateAsync({ id: employee.id, ...newEmployeeData });
    } else {
      await createEmployee.mutateAsync(newEmployeeData);
    }
    onOpenChange(false);
  };

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? "Chỉnh sửa Nhân sự" : "Thêm Nhân sự mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
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
          {selectedRole === "personnel" && ( // Only show leader selection for personnel
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