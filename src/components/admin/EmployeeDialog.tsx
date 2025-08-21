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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateEmployee,
  useUpdateEmployee,
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
} from "@/hooks/useEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  leader_id: z.string().nullable().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  initialRole?: "personnel" | "leader";
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onOpenChange,
  employee,
  initialRole,
}) => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 1000 });
  const employees = employeesData?.employees || [];
  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const isEditing = !!employee;

  const leaderOptions = useMemo(
    () => employees.filter((e) => e.role === "leader"),
    [employees],
  );

  useEffect(() => {
    if (open) {
      if (employee) {
        // Editing mode
        reset({
          name: employee.name,
          leader_id: employee.leader_id,
        });
      } else {
        // Adding mode
        reset({
          name: "",
          leader_id: null,
        });
      }
    }
  }, [employee, initialRole, open, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    const selectedLeader = employees.find((e) => e.id === data.leader_id);
    
    if (isEditing && employee) {
      const updateData: UpdateEmployeeData = {
        name: data.name,
        leader_id: data.leader_id || null,
        team_id: selectedLeader?.team_id || null,
      };
      await updateEmployee.mutateAsync({ id: employee.id, ...updateData });
    } else {
      // Adding mode
      const submissionData: CreateEmployeeData = {
        name: data.name,
        role: initialRole!,
        leader_id: data.leader_id || null,
        team_id: selectedLeader?.team_id || null,
      };
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
            {isEditing
              ? "Chỉnh sửa Nhân sự"
              : initialRole === "leader"
              ? "Thêm Leader mới"
              : "Thêm Nhân sự mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="leader_id">Leader quản lý</Label>
            <Controller
              name="leader_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "null-option"}
                  disabled={employeesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-option">Không có</SelectItem>
                    {leaderOptions.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {employee ? "Lưu thay đổi" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;