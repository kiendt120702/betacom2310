import React, { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateShop, useUpdateShop, Shop } from "@/hooks/useShops";
import { Loader2 } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
  personnel_name: z.string().optional(),
  leader_name: z.string().optional(),
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        personnel_name: shop.personnel_name || "",
        leader_name: shop.leader_name || "",
      });
    } else {
      reset({ name: "", personnel_name: "", leader_name: "" });
    }
  }, [shop, open, reset]);

  const onSubmit = async (data: ShopFormData) => {
    const shopData = {
      name: data.name,
      personnel_name: data.personnel_name || null,
      leader_name: data.leader_name || null,
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
            <Label htmlFor="personnel_name">Nhân sự</Label>
            <Input id="personnel_name" {...register("personnel_name")} placeholder="Nhập tên nhân sự..." />
          </div>
          <div>
            <Label htmlFor="leader_name">Leader</Label>
            <Input id="leader_name" {...register("leader_name")} placeholder="Nhập tên leader..." />
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