import React, { useCallback } from "react";
import { Search, Loader2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useBannerTypes } from "@/hooks/useBanners";
import { useUserProfile } from "@/hooks/useUserProfile";

interface BannerFiltersProps {
  inputSearchTerm: string;
  setInputSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedSort?: string;
  setSelectedSort?: (sort: string) => void;
  isSearching?: boolean;
}

const BannerFilters = React.memo(
  ({
    inputSearchTerm,
    setInputSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedSort = "created_desc",
    setSelectedSort,
    isSearching = false,
  }: BannerFiltersProps) => {
    const { data: categories = [] } = useCategories();
    const { data: bannerTypes = [] } = useBannerTypes();
    const { data: userProfile } = useUserProfile();

    const isAdmin = userProfile?.role === "admin";

    // No longer need handleKeyPress as search is debounced automatically

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputSearchTerm(e.target.value);
      },
      [setInputSearchTerm],
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            )}
            <Input
              placeholder="Tìm kiếm thumbnail..."
              value={inputSearchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Chọn ngành hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngành hàng</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Chọn loại thumbnail" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {bannerTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          )}

          {setSelectedSort && (
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" />
                    Mới nhất
                  </div>
                </SelectItem>
                <SelectItem value="created_asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" />
                    Cũ nhất
                  </div>
                </SelectItem>
                <SelectItem value="name_asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" />
                    Tên A-Z
                  </div>
                </SelectItem>
                <SelectItem value="name_desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" />
                    Tên Z-A
                  </div>
                </SelectItem>
                <SelectItem value="status_asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" />
                    Trạng thái
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  },
);

BannerFilters.displayName = "BannerFilters";

export default BannerFilters;
