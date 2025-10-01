import { useMemo } from "react";
import { generateMonthOptions } from "@/utils/revenueUtils";

/**
 * Custom hook to get a memoized list of month options for date pickers.
 */
export const useMonthOptions = () => {
  return useMemo(() => generateMonthOptions(), []);
};