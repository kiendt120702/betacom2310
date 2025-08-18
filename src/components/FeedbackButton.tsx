import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import FeedbackDialog from "./FeedbackDialog";
import { useAuth } from "@/hooks/useAuth";

const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null; // Only show if user is logged in

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Gửi góp ý"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </Button>
      <FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FeedbackButton;