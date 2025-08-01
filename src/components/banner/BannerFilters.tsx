import React, { useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  onSearchSubmit: () => void;
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
    onSearchSubmit,
  }: BannerFiltersProps) => {
    const { data: categories = [] } = useCategories();
    const { data: bannerTypes = [] } = useBannerTypes();
    const { data: userProfile } = useUserProfile();

    const isAdmin = userProfile?.role === "admin";

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          onSearchSubmit();
        }
      },
      [onSearchSubmit],
    );

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm thumbnail..."
              value={inputSearchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button
            onClick={onSearchSubmit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Tìm kiếm
          </Button>
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
        </div>
      </div>
    );
  },
);

BannerFilters.displayName = "BannerFilters";

export default BannerFilters;
