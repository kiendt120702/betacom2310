import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

export const useThumbnailFilters = () => {
  const [inputSearchTerm, setInputSearchTerm] = useState(
    () => localStorage.getItem("thumbnailSearchTerm") || ""
  );
  const debouncedSearchTerm = useDebounce(inputSearchTerm, 300);

  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem("thumbnailCategoryFilter") || "all"
  );
  const [selectedType, setSelectedType] = useState(
    () => localStorage.getItem("thumbnailTypeFilter") || "all"
  );
  const [selectedSort, setSelectedSort] = useState(
    () => localStorage.getItem("thumbnailSortFilter") || "created_desc"
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => parseInt(localStorage.getItem("thumbnailItemsPerPage") || "18")
  );
  const [currentPage, setCurrentPage] = useState(1);

  const persistFilters = useCallback(() => {
    localStorage.setItem("thumbnailSearchTerm", debouncedSearchTerm);
    localStorage.setItem("thumbnailCategoryFilter", selectedCategory);
    localStorage.setItem("thumbnailTypeFilter", selectedType);
    localStorage.setItem("thumbnailSortFilter", selectedSort);
    localStorage.setItem("thumbnailItemsPerPage", itemsPerPage.toString());
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedSort, itemsPerPage]);

  useEffect(() => {
    persistFilters();
  }, [persistFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedSort, itemsPerPage]);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(parseInt(value));
  }, []);

  return {
    inputSearchTerm,
    setInputSearchTerm,
    debouncedSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    selectedSort,
    setSelectedSort,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    currentPage,
    setCurrentPage,
  };
};