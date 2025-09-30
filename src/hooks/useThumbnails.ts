// Re-export all hooks from the split files for backward compatibility
export { useThumbnailData as useThumbnails, type Thumbnail } from "./useThumbnailData";
export { useThumbnailTypes, type ThumbnailType } from "./useThumbnailTypes";
export { useThumbnailCategories, type ThumbnailCategory } from "./useThumbnailCategories";
export {
  useDeleteThumbnail,
  useCreateThumbnail,
  useUpdateThumbnail,
  useApproveThumbnail,
} from "./useThumbnailMutations";