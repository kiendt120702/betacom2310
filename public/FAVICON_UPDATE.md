# Favicon Update Instructions

## Cách xóa cache favicon trên các trình duyệt

Nếu bạn vẫn thấy logo cũ thay vì logo Betacom mới, hãy thực hiện các bước sau:

### Chrome/Edge:
1. Mở Developer Tools (F12)
2. Right-click vào nút Refresh và chọn "Empty Cache and Hard Reload"
3. Hoặc: Ctrl+Shift+Delete → Clear browsing data → Check "Cached images and files"

### Firefox:
1. Ctrl+Shift+Delete
2. Chọn "Cache" và "Cookies"
3. Click "Clear Now"

### Safari:
1. Cmd+Option+E (Develop menu phải được enable)
2. Hoặc: Safari → Preferences → Privacy → Manage Website Data → Remove All

### Force Refresh Favicon:
- Thêm `?v=2025` vào cuối favicon URL nếu cần test
- Ví dụ: `yoursite.com/favicon.ico?v=2025`

### PWA Cache:
- Nếu site được cài như PWA, uninstall và reinstall app
- Hoặc clear site data trong browser settings

## Files đã được cập nhật:
- `/favicon.ico` (16x16)
- `/favicon-16x16.png`
- `/favicon-32x32.png`
- `/apple-touch-icon.png` (iOS)
- `/android-chrome-192x192.png` (Android)
- `/android-chrome-512x512.png` (Android High-res)
- `/og-image.png` (Social Media)
- `/site.webmanifest` (PWA manifest)

Tất cả đều sử dụng logo Betacom màu đỏ với cache-busting `?v=2025`.