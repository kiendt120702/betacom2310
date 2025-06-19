
import React, { useState } from 'react';
import { Search, Filter, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';

interface Banner {
  id: number;
  title: string;
  brand: string;
  category: string;
  type: string;
  image: string;
  active: boolean;
  createdAt: string;
}

const mockBanners: Banner[] = [
  {
    id: 1,
    title: 'LAVENDY Fashion Collection',
    brand: 'Lavendy',
    category: 'Thời Trang Trẻ Em',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'LAVENDY White Collection',
    brand: 'Lavendy',
    category: 'Thời Trang Trẻ Em',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    title: 'LAVENDY Black Series',
    brand: 'Lavendy',
    category: 'Thời Trang Trẻ Em',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    title: 'Hibena Fashion Banner',
    brand: 'Hibena',
    category: 'Thời Trang Nữ',
    type: 'Banner',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-12'
  },
  {
    id: 5,
    title: 'Hibena Denim Collection',
    brand: 'Hibena',
    category: 'Thời Trang Nữ',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1494783367664-8817c40ee343?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-11'
  },
  {
    id: 6,
    title: 'Hibena Style Guide',
    brand: 'Hibena',
    category: 'Thời Trang Nữ',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-10'
  },
  {
    id: 7,
    title: 'Hibena Casual Wear',
    brand: 'Hibena',
    category: 'Thời Trang Nữ',
    type: 'Ảnh bìa',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-09'
  },
  {
    id: 8,
    title: 'Hibena Special Offer',
    brand: 'Hibena',
    category: 'Thời Trang Nữ',
    type: 'Banner',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
    active: true,
    createdAt: '2024-01-08'
  }
];

const BannerGallery = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter banners based on search and filters
  const filteredBanners = mockBanners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || banner.category === selectedCategory;
    const matchesType = selectedType === '' || banner.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(mockBanners.map(banner => banner.category))];
  const types = [...new Set(mockBanners.map(banner => banner.type))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Banner Gallery
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Trang chủ
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Đăng nhập Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Nhập tên banner để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tất cả ngành hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả ngành hàng</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả loại</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBanners.length)} trong tổng số {filteredBanners.length} banner
            <span className="float-right">Trang {currentPage} / {totalPages}</span>
          </p>
        </div>

        {/* Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-[4/3] relative">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{banner.brand}</h3>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Ngành:</span>
                    <span>{banner.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loại:</span>
                    <span>{banner.type}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default BannerGallery;
