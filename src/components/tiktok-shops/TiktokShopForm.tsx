import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TiktokShopFormData, User } from "@/types/tiktokShop";

interface TiktokShopFormProps {
  formData: TiktokShopFormData;
  setFormData: (data: TiktokShopFormData) => void;
  users: User[];
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

const statusOptions = [
  { value: "Đang Vận Hành", label: "Đang Vận Hành" },
  { value: "Shop mới", label: "Shop mới" },
  { value: "Đã Dừng", label: "Đã Dừng" }
];

const typeOptions = [
  { value: "Vận hành", label: "Vận hành" },
  { value: "Booking", label: "Booking" }
];

export const TiktokShopForm: React.FC<TiktokShopFormProps> = ({
  formData,
  setFormData,
  users,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const selectedUser = useMemo(() => {
    if (formData.profile_id === "unassigned" || !formData.profile_id) return null;
    return users.find(user => user.id === formData.profile_id);
  }, [formData.profile_id, users]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên Shop *</Label>
        <Input
          id="name"
          placeholder="Nhập tên shop"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Loại</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData({ ...formData, type: value as "Vận hành" | "Booking" })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Trạng thái</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({ ...formData, status: value })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile_id">Nhân sự phụ trách</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isSubmitting}
            >
              {selectedUser 
                ? (selectedUser.full_name || selectedUser.email)
                : formData.profile_id === "unassigned"
                ? "Không phân công"
                : "Chọn nhân sự..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Tìm kiếm nhân sự..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="unassigned"
                    onSelect={() => {
                      setFormData({ ...formData, profile_id: "unassigned" });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.profile_id === "unassigned" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Không phân công
                  </CommandItem>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.full_name || user.email}
                      onSelect={() => {
                        setFormData({ ...formData, profile_id: user.id });
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.profile_id === user.id ? "opacity-100" : "opacity-0"
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
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Đang cập nhật..." : "Đang tạo..."}
            </>
          ) : (
            isEdit ? "Cập Nhật" : "Tạo Shop"
          )}
        </Button>
      </div>
    </form>
  );
};