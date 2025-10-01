import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useThumbnails, useDeleteThumbnail } from "@/hooks/useThumbnails";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { Thumbnail } from "@/hooks/useThumbnails";
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
import AddThumbnailDialog from "@/components/AddThumbnailDialog";
import EditThumbnailDialog from "@/components/EditThumbnailDialog";
import ThumbnailFilters from "@/components/thumbnail/ThumbnailFilters";
import ThumbnailCard from "@/components/thumbnail/ThumbnailCard";
import ApprovalDialog from "@/components/thumbnail/ApprovalDialog";
import ThumbnailLikesStats from "@/components/thumbnail/ThumbnailLikesStats";
import ThumbnailCardSkeleton from "@/components/thumbnail/ThumbnailCardSkeleton"; // Import skeleton component
import AnimatedPage from "@/components/layouts/AnimatedPage";

const ThumbnailGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // States for input and debounced search term
  const [inputSearchTerm, setInputSearchTerm] = useState(
    () => localStorage.getItem("thumbnailSearchTerm") || "",
  );
  
  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(inputSearchTerm, 300);

  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem("thumbnailCategoryFilter") || "all",
  );
  const [selectedType, setSelectedType] = useState(
    () => localStorage.getItem("thumbnailTypeFilter") || "all",
  ); // New state for thumbnail type
  const [selectedSort, setSelectedSort] = useState(
    () => localStorage.getItem("thumbnailSortFilter") || "created_desc",
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => parseInt(localStorage.getItem("thumbnailItemsPerPage") || "18")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [editingThumbnail, setEditingThumbnail] = useState<Thumbnail | null>(null);
  const [approvingThumbnail, setApprovingThumbnail] = useState<Thumbnail | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "stats">("gallery");

  // Use the optimized useThumbnails hook with debounced search
  const { data: thumbnailsData, isLoading: thumbnailsLoading } = useThumbnails({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    selectedCategory,
    selectedType, // Pass new selectedType
    sortBy: selectedSort,
  });

  const thumbnails = thumbnailsData?.thumbnails || [];
  const totalCount = thumbnailsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  const { data: userProfile } = useUserProfile();
  const deleteThumbnailMutation = useDeleteThumbnail();

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Optimized: Single useCallback to persist all filters to localStorage
  const persistFilters = useCallback(() => {
    const filterUpdates = {
      thumbnailSearchTerm: debouncedSearchTerm,
      thumbnailCategoryFilter: selectedCategory,
      thumbnailTypeFilter: selectedType, // Persist new filter
      thumbnailSortFilter: selectedSort,
      thumbnailItemsPerPage: itemsPerPage.toString(),
    };

    // Batch localStorage updates to reduce DOM access
    Object.entries(filterUpdates).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedSort, itemsPerPage]);

  // Single useEffect to persist filters when any filter changes
  useEffect(() => {
    persistFilters();
  }, [persistFilters]);

  // Reset to first page when filters change (including items per page)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedSort, itemsPerPage]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  // Optimized: Use useCallback to prevent re-creation of event handlers
  const handleEditThumbnail = useCallback((thumbnail: Thumbnail) => {
    if (isAdmin) {
      setEditingThumbnail(thumbnail);
    }
  }, [isAdmin]);

  const handleApproveThumbnail = useCallback((thumbnail: Thumbnail) => {
    if (isAdmin) {
      setApprovingThumbnail(thumbnail);
    }
  }, [isAdmin]);

  const handleCanvaOpen = useCallback((canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, "_blank");
    }
  }, []);

  const handleDeleteThumbnail = useCallback((thumbnailId: string) => {
    deleteThumbnailMutation.mutate(thumbnailId);
  }, [deleteThumbnailMutation]);

  // Optimized: Use useCallback for filter handlers to prevent re-creation
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
  }, []); // New handler for type filter

  const handleSortChange = useCallback((sort: string) => {
    setSelectedSort(sort);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(parseInt(value));
  }, []);

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
    <AnimatedPage>
      <div>
        <div className="bg-card rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border">
          <ThumbnailFilters
            inputSearchTerm={inputSearchTerm}
            setInputSearchTerm={setInputSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            selectedType={selectedType} // Pass new selectedType
            setSelectedType={handleTypeChange} // Pass new setSelectedType
            selectedSort={selectedSort}
            setSelectedSort={handleSortChange}
            isSearching={inputSearchTerm !== debouncedSearchTerm}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
            {/* Always show AddThumbnailDialog for any logged-in user */}
            <div className="flex flex-col sm:flex-row gap-2">
              <AddThumbnailDialog />
            </div>
            
            {/* Tab Navigation for all users */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "gallery"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "stats"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Thống kê
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "gallery" ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Hiển thị{" "}
                  {thumbnails.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
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

            {thumbnailsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 mb-8">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <ThumbnailCardSkeleton key={index} />
                ))}
              </div>
            )}

            {!thumbnailsLoading && thumbnails.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {totalCount === 0
                    ? "Chưa có thumbnail nào."
                    : "Không tìm thấy thumbnail phù hợp với bộ lọc."}
                </p>
                {totalCount === 0 && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <AddThumbnailDialog />
                  </div>
                )}
              </div>
            )}

            {!thumbnailsLoading && thumbnails.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 mb-8">
                {thumbnails.map((thumbnail) => (
                  <ThumbnailCard
                    key={thumbnail.id}
                    thumbnail={thumbnail}
                    isAdmin={isAdmin}
                    onEdit={handleEditThumbnail}
                    onDelete={handleDeleteThumbnail}
                    onCanvaOpen={handleCanvaOpen}
                    onApprove={handleApproveThumbnail}
                    isDeleting={deleteThumbnailMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-6">
            <ThumbnailLikesStats />
          </div>
        )}

        {activeTab === "gallery" && totalPages > 1 && (
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

        {isAdmin && editingThumbnail && (
          <EditThumbnailDialog
            thumbnail={editingThumbnail}
            open={!!editingThumbnail}
            onOpenChange={(open) => !open && setEditingThumbnail(null)}
          />
        )}

        {isAdmin && approvingThumbnail && (
          <ApprovalDialog
            thumbnail={approvingThumbnail}
            open={!!approvingThumbnail}
            onOpenChange={(open) => !open && setApprovingThumbnail(null)}
          />
        )}
      </div>
    </AnimatedPage>
  );
};

export default ThumbnailGallery;