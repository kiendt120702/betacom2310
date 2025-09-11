import { useState, useMemo } from "react";
import type { TiktokShop } from "@/types/tiktokShop";

export const useTiktokShopFilters = (shops: TiktokShop[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || shop.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, selectedStatus]);

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredShops,
  };
};