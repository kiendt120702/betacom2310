
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import SeoProductForm from "@/components/seo/SeoProductForm";

const SeoChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            SEO Shopee - Tạo Tên Sản Phẩm
          </h1>
          <p className="text-muted-foreground">
            Nhập thông tin sản phẩm để tạo tên chuẩn SEO tối ưu cho Shopee
          </p>
        </div>
        <SeoProductForm />
      </div>
    </div>
  );
};

export default SeoChatbotPage;
