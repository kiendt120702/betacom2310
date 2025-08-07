import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBanners, useDeleteBanner } from "@/hooks/useBanners";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Banner } from "@/hooks/useBanners";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddBannerDialog from "@/components/AddBannerDialog";
import BulkUploadDialog from "@/components/BulkUploadDialog";
import EditBannerDialog from "@/components/EditBannerDialog";
import BannerFilters from "@/components/banner/BannerFilters";
import BannerCard from "@/components/banner/BannerCard";
import ApprovalDialog from "@/components/banner/ApprovalDialog";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";

const BannerGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // States for input and debounced search term
  const [inputSearchTerm, setInputSearchTerm] = useState(
    () => localStorage.getItem("bannerSearchTerm") || "",
  );
  
  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(inputSearchTerm, 300);

  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem("bannerCategoryFilter") || "all",
  );
  const [selectedType, setSelectedType] = useState(
    () => localStorage.getItem("bannerTypeFilter") || "all",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    () => localStorage.getItem("bannerStatusFilter") || "all",
  );
  const [selectedSort, setSelectedSort] = useState(
    () => localStorage.getItem("bannerSortFilter") || "created_desc",
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => parseInt(localStorage.getItem("bannerItemsPerPage") || "18")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [approvingBanner, setApprovingBanner] = useState<Banner | null>(null);

  // Use the optimized useBanners hook with debounced search
  const { data: bannersData, isLoading: bannersLoading } = useBanners({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    selectedCategory,
    selectedType,
    selectedStatus,
    sortBy: selectedSort,
  });

  const banners = bannersData?.banners || [];
  const totalCount = bannersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { data: userProfile } = useUserProfile();
  const deleteBannerMutation = useDeleteBanner();

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Optimized: Single useCallback to persist all filters to localStorage
  const persistFilters = useCallback(() => {
    const filterUpdates = {
      bannerSearchTerm: debouncedSearchTerm,
      bannerCategoryFilter: selectedCategory,
      bannerTypeFilter: selectedType,
      bannerStatusFilter: selectedStatus,
      bannerSortFilter: selectedSort,
      bannerItemsPerPage: itemsPerPage.toString(),
    };

    // Batch localStorage updates to reduce DOM access
    Object.entries(filterUpdates).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedStatus, selectedSort, itemsPerPage]);

  // Single useEffect to persist filters when any filter changes
  useEffect(() => {
    persistFilters();
  }, [persistFilters]);

  // Reset to first page when filters change (including items per page)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedStatus, selectedSort, itemsPerPage]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  // Optimized: Use useCallback to prevent re-creation of event handlers
  const handleEditBanner = useCallback((banner: Banner) => {
    if (isAdmin) {
      setEditingBanner(banner);
    }
  }, [isAdmin]);

  const handleApproveBanner = useCallback((banner: Banner) => {
    if (isAdmin) {
      setApprovingBanner(banner);
    }
  }, [isAdmin]);

  const handleCanvaOpen = useCallback((canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, "_blank");
    }
  }, []);

  const handleDeleteBanner = useCallback((bannerId: string) => {
    deleteBannerMutation.mutate(bannerId);
  }, [deleteBannerMutation]);

  // No longer need manual search submit - debounced search handles this automatically

  // Optimized: Use useCallback for filter handlers to prevent re-creation
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSelectedSort(sort);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(parseInt(value));
  }, []);

  // Optimized: Use useCallback for keyboard shortcut handlers
  const keyboardShortcuts = useCallback(() => [
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search input'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        const addButton = document.querySelector('[role="dialog"] button, button:has([data-lucide="plus"])') as HTMLButtonElement;
        addButton?.click();
      },
      description: 'Add new banner'
    },
    {
      key: 'ArrowLeft',
      action: () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      },
      description: 'Previous page'
    },
    {
      key: 'ArrowRight', 
      action: () => {
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        }
      },
      description: 'Next page'
    },
    {
      key: 'Home',
      action: () => setCurrentPage(1),
      description: 'Go to first page'
    },
    {
      key: 'End',
      action: () => setCurrentPage(totalPages),
      description: 'Go to last page'
    },
    {
      key: '?',
      action: () => {
        const helpButton = document.querySelector('[title*="Phím tắt"]') as HTMLButtonElement;
        helpButton?.click();
      },
      description: 'Show keyboard shortcuts help'
    }
  ], [currentPage, totalPages]);

  // Use the memoized shortcuts
  useKeyboardShortcuts(keyboardShortcuts());

  // Optimized: Pagination handlers with useCallback
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(Math.max(1, currentPage - 1));
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages]);

  const handlePageClick = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border">
          <BannerFilters
            inputSearchTerm={inputSearchTerm}
            setInputSearchTerm={setInputSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            selectedType={selectedType}
            setSelectedType={handleTypeChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleStatusChange}
            selectedSort={selectedSort}
            setSelectedSort={handleSortChange}
            isSearching={inputSearchTerm !== debouncedSearchTerm}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <AddBannerDialog />
              {isAdmin && <BulkUploadDialog />}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-muted-foreground text-sm sm:text-base">
              Hiển thị{" "}
              {banners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, totalCount)} trong tổng số{" "}
              {totalCount} thumbnail
            </p>
            {totalPages > 1 && (
              <span className="text-muted-foreground text-sm">
                • Trang {currentPage} / {totalPages}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Hiển thị:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="18">18</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              / trang
            </span>
          </div>
        </div>

        {bannersLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tải thumbnail...</p>
          </div>
        )}

        {!bannersLoading && banners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {totalCount === 0
                ? "Chưa có thumbnail nào."
                : "Không tìm thấy thumbnail phù hợp với bộ lọc."}
            </p>
            {totalCount === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <AddBannerDialog />
                {isAdmin && <BulkUploadDialog />}
              </div>
            )}
          </div>
        )}

        {!bannersLoading && banners.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 mb-8">
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                isAdmin={isAdmin}
                onEdit={handleEditBanner}
                onDelete={handleDeleteBanner}
                onCanvaOpen={handleCanvaOpen}
                onApprove={handleApproveBanner}
                isDeleting={deleteBannerMutation.isPending}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {paginationRange?.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                  return (
                    <PaginationItem key={`dots-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageClick(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {isAdmin && editingBanner && (
        <EditBannerDialog
          banner={editingBanner}
          open={!!editingBanner}
          onOpenChange={(open) => !open && setEditingBanner(null)}
        />
      )}

      {isAdmin && approvingBanner && (
        <ApprovalDialog
          banner={approvingBanner}
          open={!!approvingBanner}
          onOpenChange={(open) => !open && setApprovingBanner(null)}
        />
      )}


      <KeyboardShortcutsHelp />
    </div>
  );
};

export default BannerGallery;
