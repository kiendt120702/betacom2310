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
import { useShopAssignableUsers, useCreateShop, useUpdateShop, Shop } from "@/hooks/useShops";
import { Loader2 } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
  user_id: z.string().optional(),
  leader_id: z.string().optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop?: Shop | null;
}

const ShopDialog: React.FC<ShopDialogProps> = ({ open, onOpenChange, shop }) => {
  const { data: assignableUsers = [], isLoading: usersLoading } = useShopAssignableUsers();
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();

  // Filter users by role
  const users = assignableUsers.filter(user => user.role === "chuyên viên" || user.role === "học việc/thử việc");
  const leaders = assignableUsers.filter(user => user.role === "leader");

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        user_id: shop.user_id || "none",
        leader_id: shop.leader_id || "none",
      });
    } else {
      reset({ name: "", user_id: "none", leader_id: "none" });
    }
  }, [shop, open, reset]);

  const onSubmit = async (data: ShopFormData) => {
    const shopData = {
      name: data.name,
      user_id: data.user_id === "none" ? null : data.user_id,
      leader_id: data.leader_id === "none" ? null : data.leader_id,
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
            <Label>Nhân sự</Label>
            <Controller
              name="user_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân sự..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không gán</SelectItem>
                    {usersLoading ? <SelectItem value="loading" disabled>Đang tải...</SelectItem> :
                      users.map(user => <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id.message}</p>}
          </div>
          <div>
            <Label>Leader</Label>
            <Controller
              name="leader_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không gán</SelectItem>
                    {usersLoading ? <SelectItem value="loading" disabled>Đang tải...</SelectItem> :
                      leaders.map(leader => <SelectItem key={leader.id} value={leader.id}>{leader.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leader_id && <p className="text-red-500 text-sm mt-1">{errors.leader_id.message}</p>}
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