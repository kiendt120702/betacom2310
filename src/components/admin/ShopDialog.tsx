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
import { useCreateShop, useUpdateShop, Shop } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams"; // Import useTeams
import { Loader2 } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
  team_id: z.string().nullable().optional(), // Add team_id to schema
  personnel_id: z.string().nullable().optional(),
  leader_id: z.string().nullable().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop?: Shop | null;
}

const ShopDialog: React.FC<ShopDialogProps> = ({ open, onOpenChange, shop }) => {
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: teams = [], isLoading: teamsLoading } = useTeams(); // Fetch teams

  const { register, handleSubmit, reset, control, formState: { errors }, watch, setValue } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  const watchedPersonnelId = watch("personnel_id");
  const watchedTeamId = watch("team_id"); // Watch the selected team

  // Filter personnel based on selected team
  const personnelList = useMemo(() => {
    const allPersonnel = employees.filter(e => e.role === 'personnel');
    if (!watchedTeamId) return []; // Don't show any personnel until a team is selected
    if (watchedTeamId === "null-option") {
      return allPersonnel.filter(p => !p.team_id);
    }
    return allPersonnel.filter(p => p.team_id === watchedTeamId);
  }, [employees, watchedTeamId]);

  // Reset personnel_id if the selected personnel is no longer in the filtered list
  useEffect(() => {
    if (watchedPersonnelId && !personnelList.some(p => p.id === watchedPersonnelId)) {
      setValue("personnel_id", null);
      setValue("leader_id", null); // Also clear leader if personnel is cleared
    }
  }, [watchedPersonnelId, personnelList, setValue]);

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        team_id: shop.team_id || "null-option", // Initialize team_id
        personnel_id: shop.personnel_id,
        leader_id: shop.leader_id,
      });
    } else {
      reset({ name: "", team_id: null, personnel_id: null, leader_id: null });
    }
  }, [shop, open, reset]);

  // Effect to update leader_id when personnel_id changes
  useEffect(() => {
    if (watchedPersonnelId) {
      const selectedPersonnel = employees.find(p => p.id === watchedPersonnelId);
      if (selectedPersonnel?.leader_id) {
        setValue("leader_id", selectedPersonnel.leader_id);
      } else {
        setValue("leader_id", null); // Clear leader if personnel has no assigned leader
      }
    } else {
      setValue("leader_id", null); // Clear leader if no personnel is selected
    }
  }, [watchedPersonnelId, employees, setValue]);

  const onSubmit = async (data: ShopFormData) => {
    const shopData = {
      name: data.name,
      team_id: data.team_id === "null-option" ? null : data.team_id, // Save null if "Không có" is selected
      personnel_id: data.personnel_id || null,
      leader_id: data.leader_id || null,
    };

    if (shop) {
      await updateShop.mutateAsync({
        id: shop.id,
        ...shopData,
      });
    } else {
      await createShop.mutateAsync(shopData);
    }
    onOpenChange(false);
  };

  const isSubmitting = createShop.isPending || updateShop.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shop ? "Chỉnh sửa Shop" : "Thêm Shop mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Tên Shop</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          {/* Team Selection */}
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
                    {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Personnel Selection (filtered by team) */}
          <div>
            <Label htmlFor="personnel_id">Nhân sự</Label>
            <Controller
              name="personnel_id"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || "null-option"} 
                  disabled={employeesLoading || !watchedTeamId}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !watchedTeamId 
                          ? "Vui lòng chọn team trước" 
                          : personnelList.length === 0
                            ? "Không có nhân sự trong team này"
                            : "Chọn nhân sự..."
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-option">Không có</SelectItem>
                    {personnelList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {shop ? "Lưu thay đổi" : "Tạo Shop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShopDialog;