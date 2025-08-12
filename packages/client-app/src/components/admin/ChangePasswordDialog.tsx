import React, { useState, useEffect } from "react";
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
import { useToast } from "@shared/hooks/use-toast";
import { useUpdateUser } from "@shared/hooks/useUsers";
import { UserProfile } from "@shared/hooks/useUserProfile";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { validatePassword, secureLog } from "@shared/lib/utils";

interface ChangePasswordDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);
      setPasswordStrength("weak");
      setIsSubmitting(false);
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const calculatePasswordStrength = (
    password: string,
  ): "weak" | "medium" | "strong" => {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Complexity bonus
    if (password.length >= 16) score += 1;
    if (/[^A-Za-z0-9\s]/.test(password)) score += 1;

    if (score >= 6) return "strong";
    if (score >= 4) return "medium";
    return "weak";
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);

    const validation = validatePassword(value);
    setPasswordErrors(validation.errors);

    if (value.length > 0) {
      setPasswordStrength(calculatePasswordStrength(value));
    } else {
      setPasswordStrength("weak");
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!oldPassword.trim()) {
      errors.push("Vui lòng nhập mật khẩu cũ.");
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    if (newPassword !== confirmPassword) {
      errors.push("Mật khẩu xác nhận không khớp.");
    }

    if (oldPassword === newPassword) {
      errors.push("Mật khẩu mới phải khác mật khẩu cũ.");
    }

    // Check for common password patterns
    if (
      newPassword.toLowerCase().includes(user?.full_name?.toLowerCase() || "")
    ) {
      errors.push("Mật khẩu không được chứa tên của bạn.");
    }

    if (
      newPassword
        .toLowerCase()
        .includes(user?.email?.split("@")[0].toLowerCase() || "")
    ) {
      errors.push("Mật khẩu không được chứa email của bạn.");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    secureLog("Password change attempt initiated");

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        oldPassword: oldPassword,
        password: newPassword,
      });

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được cập nhật thành công.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      secureLog("Password changed successfully");
      onOpenChange(false);
    } catch (error: unknown) {
      secureLog("Password change failed:", { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể đổi mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "strong":
        return "text-green-600 bg-green-100";
    }
  };

  const getStrengthText = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak":
        return "Yếu";
      case "medium":
        return "Trung bình";
      case "strong":
        return "Mạnh";
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Đổi mật khẩu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="old-password">Mật khẩu hiện tại *</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới *</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Độ mạnh:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(passwordStrength)}`}
                >
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới *</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Yêu cầu mật khẩu:
              </span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ít nhất 8 ký tự</li>
              <li>• Chứa chữ hoa và chữ thường</li>
              <li>• Chứa ít nhất 1 số</li>
              <li>• Chứa ít nhất 1 ký tự đặc biệt</li>
              <li>• Không chứa thông tin cá nhân</li>
            </ul>
          </div>

          {/* Validation Errors */}
          {passwordErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Lỗi xác thực:
                </span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Indicator */}
          {newPassword &&
            confirmPassword &&
            newPassword === confirmPassword &&
            passwordErrors.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Mật khẩu hợp lệ!
                  </span>
                </div>
              </div>
            )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                passwordErrors.length > 0 ||
                !newPassword ||
                !confirmPassword
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;