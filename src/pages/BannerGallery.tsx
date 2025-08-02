import React, { useState, useEffect } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [approvingBanner, setApprovingBanner] = useState<Banner | null>(null);
  const itemsPerPage = 18;

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

  // Effect to save search term to localStorage when debounced value changes
  useEffect(() => {
    localStorage.setItem("bannerSearchTerm", debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    localStorage.setItem("bannerCategoryFilter", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("bannerTypeFilter", selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem("bannerStatusFilter", selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    localStorage.setItem("bannerSortFilter", selectedSort);
  }, [selectedSort]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedStatus, selectedSort]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleEditBanner = (banner: Banner) => {
    if (isAdmin) {
      setEditingBanner(banner);
    }
  };

  const handleApproveBanner = (banner: Banner) => {
    if (isAdmin) {
      setApprovingBanner(banner);
    }
  };


  const handleCanvaOpen = (canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, "_blank");
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    deleteBannerMutation.mutate(bannerId);
  };

  // No longer need manual search submit - debounced search handles this automatically

  // Handle category filter change immediately
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle type filter change immediately
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  // Handle status filter change immediately
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  // Handle sort change immediately
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
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
  ]);

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

        <div className="mb-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            Hiển thị{" "}
            {banners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
            {Math.min(currentPage * itemsPerPage, totalCount)} trong tổng số{" "}
            {totalCount} thumbnail
            {totalPages > 1 && (
              <span className="block sm:float-right mt-1 sm:mt-0">
                Trang {currentPage} / {totalPages}
              </span>
            )}
          </p>
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                      onClick={() => setCurrentPage(pageNumber as number)}
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
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
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
