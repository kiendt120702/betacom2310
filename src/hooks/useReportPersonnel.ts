import { useMemo } from "react";
import type { Employee } from "@/types/reports";

/**
 * Hook chuyên xử lý leaders và personnel data
 */
export const useReportPersonnel = (
  allShops: any[],
  selectedLeader: string
) => {
  
  // Extract unique leaders with memoization
  const leaders = useMemo((): Employee[] => {
    if (!allShops.length) return [];
    
    const leadersMap = new Map<string, Employee>();
    
    allShops.forEach(shop => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, {
            id: manager.id,
            name: manager.full_name || manager.email,
          });
        }
      }
    });
    
    return Array.from(leadersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops]);

  // Extract personnel options based on selected leader
  const personnelOptions = useMemo((): Employee[] => {
    if (!allShops.length) return [];
    
    const personnelMap = new Map<string, Employee>();
    let shopsToConsider = allShops;

    // Filter shops by selected leader if specified
    if (selectedLeader !== 'all') {
      shopsToConsider = allShops.filter(shop => 
        shop.profile?.manager?.id === selectedLeader
      );
    }

    shopsToConsider.forEach(shop => {
      if (shop.profile) {
        const personnel = shop.profile;
        if (!personnelMap.has(personnel.id)) {
          personnelMap.set(personnel.id, {
            id: personnel.id,
            name: personnel.full_name || personnel.email,
          });
        }
      }
    });
    
    return Array.from(personnelMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops, selectedLeader]);

  return {
    leaders,
    personnelOptions
  };
};