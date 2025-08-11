// Re-export all hooks from the split files for backward compatibility
export { useBannerData as useBanners, type Banner } from "./useBannerData";
export { useBannerTypes, type BannerType } from "./useBannerTypes";
export { useCategories, type Category } from "./useCategories";
export {
  useDeleteBanner,
  useCreateBanner,
  useUpdateBanner,
  useApproveBanner,
} from "./useBannerMutations";
export {
  useBannerStatistics,
  type BannerStatistics,
} from "./useBannerStatistics";
export { useRefreshBannerStats } from "./useRefreshBannerStats";