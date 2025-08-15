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
  useCreateShop,
  useUpdateShop,
  Shop,
} from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { Loader2 } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
  leader_id: z.string().nullable().optional(),
  personnel_id: z.string().nullable().optional(),
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

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  const watchedLeaderId = watch("leader_id");
  const watchedPersonnelId = watch("personnel_id");

  const leaders = useMemo(() => employees.filter(e => e.role === 'leader'), [employees]);
  const personnel = useMemo(() => employees.filter(e => e.role === 'personnel'), [employees]);

  // Filter personnel based on selected leader
  const personnelList = useMemo(() => {
    if (!watchedLeaderId || watchedLeaderId === "null-option") return [];
    return personnel.filter(p => p.leader_id === watchedLeaderId);
  }, [personnel, watchedLeaderId]);

  // Reset personnel_id if the selected personnel is no longer in the filtered list
  useEffect(() => {
    if (watchedPersonnelId && !personnelList.some(p => p.id === watchedPersonnelId)) {
      setValue("personnel_id", null);
    }
  }, [watchedPersonnelId, personnelList, setValue]);

  useEffect(() => {
    if (shop && open) {
      reset({
        name: shop.name,
        leader_id: shop.leader_id,
        personnel_id: shop.personnel_id,
      });
    } else if (open) {
      reset({ name: "", leader_id: null, personnel_id: null });
    }
  }, [shop, open, reset]);

  const onSubmit = async (data: ShopFormData) => {
    const selectedLeader = employees.find(e => e.id === data.leader_id);
    
    const shopData = {
      name: data.name,
      leader_id: data.leader_id === "null-option" ? null : data.leader_id,
      personnel_id: data.personnel_id === "null-option" ? null : data.personnel_id,
      team_id: selectedLeader?.team_id || null, // Derive team_id from leader
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
          
          {/* Leader Selection */}
          <div>
            <Label htmlFor="leader_id">Leader</Label>
            <Controller
              name="leader_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  setValue("personnel_id", null); // Reset personnel when leader changes
                }} value={field.value || "null-option"} disabled={employeesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-option">Không có leader</SelectItem>
                    {leaders.map(leader => <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Personnel Selection (filtered by leader) */}
          <div>
            <Label htmlFor="personnel_id">Nhân sự</Label>
            <Controller
              name="personnel_id"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || "null-option"} 
                  disabled={employeesLoading || !watchedLeaderId || watchedLeaderId === "null-option"}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !watchedLeaderId || watchedLeaderId === "null-option"
                          ? "Vui lòng chọn leader trước" 
                          : personnelList.length === 0
                            ? "Không có nhân sự thuộc leader này"
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