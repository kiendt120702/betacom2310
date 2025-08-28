import React, { useEffect, useMemo, useState } from "react";
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
import { useUsers } from "@/hooks/useUsers"; // Import useUsers
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const shopSchema = z.object({
  name: z.string().min(1, "Tên shop là bắt buộc"),
  leader_id: z.string().nullable().optional(),
  personnel_id: z.string().nullable().optional(),
  profile_id: z.string().nullable().optional(), // Thêm profile_id
  status: z.enum(['Shop mới', 'Đang Vận Hành', 'Đã Dừng']).optional(),
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
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 1000 });
  const { data: usersData, isLoading: usersLoading } = useUsers({ page: 1, pageSize: 1000, searchTerm: "", selectedRole: "all", selectedTeam: "all", selectedManager: "all" }); // Fetch all users
  const employees = employeesData?.employees || [];
  const users = usersData?.users || [];
  const [isPersonnelPopoverOpen, setIsPersonnelPopoverOpen] = useState(false);

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

  const personnelList = useMemo(() => {
    if (!watchedLeaderId || watchedLeaderId === "null-option") return [];
    
    const selectedLeader = employees.find(l => l.id === watchedLeaderId);
    const personnelUnderLeader = employees.filter(p => p.role === 'personnel' && p.leader_id === watchedLeaderId);
    
    const combinedList = [];
    if (selectedLeader) {
        combinedList.push(selectedLeader);
    }
    combinedList.push(...personnelUnderLeader);
    
    return combinedList;
  }, [employees, watchedLeaderId]);

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
        profile_id: (shop as any).profile_id, // Thêm profile_id
        status: shop.status || 'Đang Vận Hành',
      });
    } else if (open) {
      reset({ name: "", leader_id: null, personnel_id: null, profile_id: null, status: 'Đang Vận Hành' });
    }
  }, [shop, open, reset]);

  const onSubmit = async (data: ShopFormData) => {
    const selectedLeader = employees.find(e => e.id === data.leader_id);
    
    const shopData = {
      name: data.name,
      leader_id: data.leader_id === "null-option" ? null : data.leader_id,
      personnel_id: data.personnel_id === "null-option" ? null : data.personnel_id,
      profile_id: data.profile_id,
      team_id: selectedLeader?.team_id || null,
      status: data.status,
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
            <Label htmlFor="profile_id">Nhân sự (Tài khoản)</Label>
            <Controller
              name="profile_id"
              control={control}
              render={({ field }) => (
                <Popover open={isPersonnelPopoverOpen} onOpenChange={setIsPersonnelPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPersonnelPopoverOpen}
                      className="w-full justify-between"
                      disabled={usersLoading}
                    >
                      {field.value
                        ? users.find((user) => user.id === field.value)?.full_name || users.find((user) => user.id === field.value)?.email
                        : "Chọn nhân sự..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm nhân sự..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              field.onChange(null);
                              setIsPersonnelPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Chưa gán
                          </CommandItem>
                          {users.map(user => (
                            <CommandItem
                              key={user.id}
                              value={user.full_name || user.email}
                              onSelect={() => {
                                field.onChange(user.id);
                                setIsPersonnelPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === user.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {user.full_name || user.email}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div>
            <Label htmlFor="leader_id">Leader (cũ)</Label>
            <Controller
              name="leader_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  setValue("personnel_id", null);
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

          <div>
            <Label htmlFor="personnel_id">Nhân sự (cũ)</Label>
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

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "Đang Vận Hành"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shop mới">Shop mới</SelectItem>
                    <SelectItem value="Đang Vận Hành">Đang Vận Hành</SelectItem>
                    <SelectItem value="Đã Dừng">Đã Dừng</SelectItem>
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