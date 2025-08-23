# Video Upload Refactor

## Vấn đề đã sửa

Trước đây có 3 hooks khác nhau để upload video:
- `useVideoUpload` - giới hạn 5GB, logic phức tạp
- `useOptimizedVideoUpload` - giới hạn 2GB, chunked upload không hoàn chỉnh
- `useLargeVideoUpload` - giới hạn 1GB, logic retry không consistent

Điều này gây ra:
- Inconsistency trong file size limits
- Logic error handling khác nhau
- Progress tracking không đồng nhất
- Khó maintain và debug

## Giải pháp

Tạo **unified hook** `useUnifiedVideoUpload` với:

### ✅ Features chính:
- **Unified file size limit**: 2GB cho tất cả uploads
- **Robust retry mechanism**: 3 lần retry với exponential backoff
- **Consistent error handling**: Thông báo lỗi dễ hiểu
- **Progress tracking**: Hiển thị progress chính xác
- **File validation**: Kiểm tra type và extension đầy đủ
- **Configurable**: Có thể customize limits và settings

### ✅ Error handling:
- File size exceeded
- Network timeouts
- Connection issues
- Invalid file types
- Upload failures

### ✅ User experience:
- Progress bar chính xác
- Thông báo lỗi bằng tiếng Việt
- Warning cho file lớn
- Prevent page close during upload

## Files đã cập nhật

### Hooks:
- ✅ **NEW**: `src/hooks/useUnifiedVideoUpload.ts`
- ⚠️ **DEPRECATED**: `src/hooks/useVideoUpload.ts`
- ⚠️ **DEPRECATED**: `src/hooks/useOptimizedVideoUpload.ts` 
- ⚠️ **DEPRECATED**: `src/hooks/useLargeVideoUpload.ts`

### Components updated:
- ✅ `src/components/admin/CreateExerciseDialog.tsx`
- ✅ `src/components/admin/CreateGeneralTrainingDialog.tsx`
- ✅ `src/components/admin/EditGeneralTrainingDialog.tsx`
- ✅ `src/components/admin/EditExerciseDialog.tsx`
- ✅ `src/components/admin/ExerciseVideoUploadDialog.tsx`
- ✅ `src/components/VideoUpload.tsx` (updated size limit display)

## Migration Guide

### Old code:
```typescript
import { useLargeVideoUpload } from "@/hooks/useLargeVideoUpload";

const { uploadVideo, uploading, progress } = useLargeVideoUpload();
```

### New code:
```typescript
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";

const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();

// With custom config:
const { uploadVideo, uploading, progress } = useUnifiedVideoUpload({
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxRetries: 5
});
```

## Testing

- ✅ TypeScript compilation passes
- ✅ Build successful
- ✅ All components use unified hook
- ✅ Consistent 2GB file size limit across all components

## Recommend Next Steps

1. **Test với các file size khác nhau** (< 100MB, 100-500MB, 500MB-2GB)
2. **Test error scenarios** (network issues, timeout, file quá lớn)
3. **Remove deprecated hooks** sau khi confirm stable
4. **Update Supabase bucket settings** để match 2GB limit

## Configuration

Hook mới có thể configure:

```typescript
const uploadConfig = {
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedExtensions: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'],
  maxRetries: 3,
  retryDelay: 2000 // milliseconds
};

const { uploadVideo } = useUnifiedVideoUpload(uploadConfig);
```