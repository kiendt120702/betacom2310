import { useState } from "react";
import { mockAuth } from "@/integrations/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { secureLog } from "@/lib/utils";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    secureLog("Sign in attempt", { email });

    try {
      const { data, error } = await mockAuth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        secureLog("Sign in error", { error });
        let description = "Đã có lỗi xảy ra. Vui lòng thử lại.";
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("invalid login credentials")) {
          description = "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
        } else if (errorMessage.includes("network request failed") || errorMessage.includes("failed to fetch")) {
          description = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
        } else if (errorMessage.includes("email not confirmed")) {
          description = "Vui lòng xác thực email của bạn trước khi đăng nhập.";
        } else if (errorMessage.includes("user is banned")) {
          description = "Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
        } else if (errorMessage.includes("rate limit")) {
          description = "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
        }

        toast({
          title: "Lỗi đăng nhập",
          description: description,
          variant: "destructive",
        });
      } else if (data.user) {
        secureLog("Sign in successful", { userId: data.user.id });
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
        navigate("/");
      } else {
        secureLog("Sign in anomaly: No user and no error", { data });
        toast({
          title: "Lỗi không xác định",
          description: "Không thể đăng nhập. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      secureLog("Unexpected error during sign in", { error });
      
      let errorMessage = "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi nghiêm trọng",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Logo + BETACOM in top left corner */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <img
          src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
          alt="BETACOM Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-2xl font-bold text-red-500">BETACOM</h1>
      </div>

      <div className="w-full flex flex-col items-center">
        {/* Login Form */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black mb-4">ĐĂNG NHẬP</h2>
        </div>

        <form
          onSubmit={handleSignIn}
          className="flex flex-col items-center space-y-8">
          <div>
            <Input
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-[338px] h-[50px] px-5 text-base bg-white border border-gray-300 rounded-full placeholder:text-gray-400 text-black focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-[338px] h-[50px] px-5 pr-12 text-base bg-white border border-gray-300 rounded-full placeholder:text-gray-400 text-black focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-[338px] h-[50px] text-base font-medium bg-black hover:bg-gray-800 text-white rounded-full"
              disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
