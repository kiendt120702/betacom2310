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
import { Loader2 } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
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

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  const personnelList = useMemo(() => employees.filter(e => e.role === 'personnel'), [employees]);
  const leaderList = useMemo(() => employees.filter(e => e.role === 'leader'), [employees]);

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        personnel_id: shop.personnel_id,
        leader_id: shop.leader_id,
      });
    } else {
      reset({ name: "", personnel_id: null, leader_id: null });
    }
  }, [shop, open, reset]);

  const onSubmit = async (data: ShopFormData) => {
    const shopData = {
      name: data.name,
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
          <div>
            <Label htmlFor="personnel_id">Nhân sự</Label>
            <Controller
              name="personnel_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || "null-option"} disabled={employeesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân sự..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-option">Không có</SelectItem>
                    {personnelList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="leader_id">Leader</Label>
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
                    {leaderList.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
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