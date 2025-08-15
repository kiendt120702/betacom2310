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
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
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
  const roleForLogic = isEditing ? employee?.role : initialRole;

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
    if (isEditing && employee) {
      const updateData: UpdateEmployeeData = {
        name: data.name,
        leader_id: roleForLogic === "personnel" ? data.leader_id || null : null,
      };
      await updateEmployee.mutateAsync({ id: employee.id, ...updateData });
    } else {
      // Adding mode
      let submissionData: CreateEmployeeData;
      if (initialRole === "personnel") {
        const selectedLeader = employees.find((e) => e.id === data.leader_id);
        submissionData = {
          name: data.name,
          role: "personnel",
          leader_id: data.leader_id || null,
          team_id: selectedLeader?.team_id || null,
        };
      } else {
        // Adding leader
        submissionData = {
          name: data.name,
          role: "leader",
          leader_id: null,
          team_id: null, // Leaders are not assigned to teams via this form
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

          {roleForLogic === "personnel" && (
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
          )}

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