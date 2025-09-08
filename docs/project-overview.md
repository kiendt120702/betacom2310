# Slide Show Nexus Admin - Project Overview

## Mô tả dự án

Slide Show Nexus Admin là một hệ thống quản lý toàn diện dành cho việc điều hành và giám sát hoạt động kinh doanh trên nền tảng e-commerce. Dự án được xây dựng bằng React, TypeScript và Supabase, tập trung vào việc quản lý thumbnail, đào tạo nhân viên, báo cáo bán hàng và phân tích hiệu suất.

## Tính năng chính

### 1. Quản lý Thumbnail
- Upload và quản lý hình ảnh thumbnail sản phẩm
- Hệ thống phê duyệt và đánh giá thumbnail
- Quản lý danh mục và loại thumbnail
- Thống kê lượt thích và hiệu suất thumbnail

### 2. Hệ thống Đào tạo
- **Shopee Education**: Khóa đào tạo chuyên biệt cho nền tảng Shopee
- **General Training**: Đào tạo tổng quát cho nhân viên
- Quản lý bài tập thực hành và lý thuyết
- Hệ thống chấm điểm tự động và thủ công
- Theo dõi tiến độ học tập cá nhân

### 3. Báo cáo và Phân tích
- **Comprehensive Reports**: Báo cáo tổng hợp toàn diện
- **Daily Sales Reports**: Báo cáo bán hàng hàng ngày
- **Revenue Analytics**: Phân tích doanh thu chi tiết
- **Performance Dashboard**: Bảng điều khiển hiệu suất
- Hỗ trợ cả Shopee và TikTok Shop

### 4. Quản lý Nhân sự
- Quản lý người dùng và phân quyền
- Hệ thống vai trò đa cấp (Admin, Manager, Employee)
- Quản lý đội nhóm và cửa hàng
- Theo dõi mục tiêu và KPI cá nhân

### 5. Fast Delivery System
- Công cụ tính toán giao hàng nhanh
- Hệ thống lý thuyết và thực hành
- Tối ưu hóa quy trình logistics

## Kiến trúc hệ thống

### Frontend
- **Framework**: React 18 với TypeScript
- **UI Library**: Radix UI + Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form với Zod validation
- **Rich Text**: TipTap editor
- **Charts**: Recharts

### Backend & Database
- **Backend as a Service**: Supabase
- **Database**: PostgreSQL (thông qua Supabase)
- **Authentication**: Supabase Auth với JWT
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Edge Functions**: Supabase Functions

### Công cụ phát triển
- **Build Tool**: Vite
- **Code Quality**: ESLint + TypeScript
- **CSS**: PostCSS + Autoprefixer
- **Package Manager**: npm
- **Deployment**: Vercel (qua Lovable platform)

## Cấu trúc thư mục

```
src/
├── components/          # UI components tái sử dụng
│   ├── admin/          # Components cho admin panel
│   ├── dashboard/      # Dashboard components
│   ├── forms/          # Form components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...
├── hooks/              # Custom hooks
├── pages/              # Route pages
├── contexts/           # React contexts
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── integrations/       # External integrations (Supabase)
└── styles/             # Global styles
```

## Luồng xác thực và phân quyền

1. **Authentication**: Sử dụng Supabase Auth
2. **Role-based Access Control**: 
   - `admin`: Toàn quyền hệ thống
   - `manager`: Quản lý đội nhóm và báo cáo
   - `leader`: Quản lý nhân viên trực thuộc
   - `employee`: Truy cập cơ bản
   - `trainer`: Quản lý đào tạo
3. **Route Guards**: Bảo vệ routes dựa trên quyền user

## Tính năng nổi bật

### Performance Optimizations
- Lazy loading cho tất cả pages
- Image optimization và lazy loading
- Query caching với TanStack Query
- Code splitting tự động

### User Experience
- Responsive design cho mobile và desktop
- Dark/Light theme support
- Real-time notifications
- Progressive loading states

### Security
- JWT-based authentication
- Role-based authorization
- Secure file upload với validation
- SQL injection prevention

## Deployment và CI/CD

- **Platform**: Lovable.dev với GitHub integration
- **Auto-deployment**: Mỗi push lên main branch
- **Environment**: Production sử dụng Vercel
- **Database**: Supabase managed PostgreSQL

## Roadmap

### Upcoming Features
- Mobile app companion
- Advanced analytics dashboard
- API integration với third-party services
- Automated reporting system
- Multi-language support

### Technical Improvements
- Unit testing implementation
- End-to-end testing
- Performance monitoring
- Error tracking integration