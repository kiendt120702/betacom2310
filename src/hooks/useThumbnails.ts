// Re-export all hooks from the split files for backward compatibility
export { useThumbnailData as useThumbnails, type Thumbnail } from "./useThumbnailData";
export { useThumbnailTypes, type ThumbnailType } from "./useThumbnailTypes";
export { useCategories, type Category } from "./useCategories";
export {
  useDeleteThumbnail,
  useCreateThumbnail,
  useUpdateThumbnail,
  useApproveThumbnail,
} from "./useThumbnailMutations";
export {
  useThumbnailLikes,
  useToggleThumbnailLike,
  useUserLikes,
  useTopLikedThumbnails,
  type ThumbnailLike,
  type ThumbnailLikeStatus,
} from "./useThumbnailLikes";