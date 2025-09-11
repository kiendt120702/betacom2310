import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
        <Select 
          value={formData.profile_id} 
          onValueChange={(value) => setFormData({ ...formData, profile_id: value })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhân sự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Không phân công</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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