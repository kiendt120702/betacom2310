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
import { Strategy } from "@/hooks/useStrategies";

interface StrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: { strategy: string; implementation: string },
    id?: string,
  ) => Promise<any>;
  strategy?: Strategy | null;
  title: string;
}

export function StrategyDialog({
  open,
  onOpenChange,
  onSubmit,
  strategy,
  title,
}: StrategyDialogProps) {
  const [formData, setFormData] = useState({
    strategy: "",
    implementation: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (strategy) {
      setFormData({
        strategy: strategy.strategy || "",
        implementation: strategy.implementation || "",
      });
    } else {
      setFormData({
        strategy: "",
        implementation: "",
      });
    }
  }, [strategy, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.strategy.trim() || !formData.implementation.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (strategy) {
        await onSubmit(formData, strategy.id);
        toast({
          title: "Thành công",
          description: "Đã cập nhật chiến lược thành công",
        });
      } else {
        await onSubmit(formData);
        toast({
          title: "Thành công",
          description: "Đã thêm chiến lược mới thành công",
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
            <Label htmlFor="strategy">Chiến lược</Label>
            <Input
              id="strategy"
              value={formData.strategy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, strategy: e.target.value }))
              }
              placeholder="Nhập chiến lược..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementation">Cách thực hiện</Label>
            <Textarea
              id="implementation"
              value={formData.implementation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  implementation: e.target.value,
                }))
              }
              placeholder="Mô tả cách thực hiện chiến lược..."
              rows={4}
              required
              className="resize-y" // Added resize-y here
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
              {loading ? "Đang xử lý..." : strategy ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
