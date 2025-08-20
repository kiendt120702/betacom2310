
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";

interface FilterState {
  selectedMonth: string;
  selectedLeader: string;
  selectedPersonnel: string;
  searchTerm: string;
}

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>({
    selectedMonth: searchParams.get("month") || format(new Date(), "yyyy-MM"),
    selectedLeader: searchParams.get("leader") || "all",
    selectedPersonnel: searchParams.get("personnel") || "all",
    searchTerm: searchParams.get("search") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.selectedMonth !== format(new Date(), "yyyy-MM")) {
      params.set("month", filters.selectedMonth);
    }
    if (filters.selectedLeader !== "all") {
      params.set("leader", filters.selectedLeader);
    }
    if (filters.selectedPersonnel !== "all") {
      params.set("personnel", filters.selectedPersonnel);
    }
    if (filters.searchTerm) {
      params.set("search", filters.searchTerm);
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      selectedMonth: format(new Date(), "yyyy-MM"),
      selectedLeader: "all",
      selectedPersonnel: "all",
      searchTerm: "",
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
  };
};
