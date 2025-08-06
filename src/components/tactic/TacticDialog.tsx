import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tactic } from "@/hooks/useTactics"; // Updated import path

interface TacticDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: { tactic: string; description: string },
    id?: string,
  ) => Promise<any>;
  tactic?: Tactic | null;
  title: string;
}

export function TacticDialog({
  open,
  onOpenChange,
  onSubmit,
  tactic,
  title,
}: TacticDialogProps) {
  const [formData, setFormData] = useState({
    tactic: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tactic) {
      setFormData({
        tactic: tactic.tactic || "",
        description: tactic.description || "",
      });
    } else {
      setFormData({
        tactic: "",
        description: "",
      });
    }
  }, [tactic, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tactic.trim() || !formData.description.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (tactic) {
        await onSubmit(formData, tactic.id);
        toast({
          title: "Thành công",
          description: "Đã cập nhật chiến thuật thành công",
        });
      } else {
        await onSubmit(formData);
        toast({
          title: "Thành công",
          description: "Đã thêm chiến thuật mới thành công",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tactic">Chiến thuật</Label>
            <Input
              id="tactic"
              value={formData.tactic}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tactic: e.target.value }))
              }
              placeholder="Nhập chiến thuật..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Mô tả cách thực hiện chiến thuật..."
              rows={4}
              required
              className="resize-y"
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
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : tactic ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}