import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import SeoProductDescriptionForm from "@/components/seo/SeoProductDescriptionForm";

const SeoProductDescriptionPage = () => {
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
    <SeoProductDescriptionForm />
  );
};

export default SeoProductDescriptionPage;