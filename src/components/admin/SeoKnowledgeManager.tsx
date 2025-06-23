
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Edit, Plus, FileText, Search } from 'lucide-react';
import { useSeoKnowledge } from '@/hooks/useSeoKnowledge';
import BulkSeoImport from './BulkSeoImport';

const SeoKnowledgeManager = () => {
  const { toast } = useToast();
  const { data: seoKnowledge, isLoading, error, refetch } = useSeoKnowledge();
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chunk_type: '',
    section_number: ''
  });

  const chunkTypes = [
    { value: 'title_naming', label: 'Cách đặt tên sản phẩm' },
    { value: 'description', label: 'Mô tả sản phẩm' },
    { value: 'keyword_structure', label: 'Cấu trúc từ khóa' },
    { value: 'seo_optimization', label: 'Tối ưu SEO' },
    { value: 'shopee_rules', label: 'Quy định Shopee' },
    { value: 'best_practices', label: 'Thực tiễn tố nhất' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.chunk_type) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/seo-knowledge', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingId,
          word_count: formData.content.split(' ').length
        }),
      });

      if (!response.ok) throw new Error('Failed to save knowledge');

      toast({
        title: "Thành công",
        description: editingId ? "Cập nhật kiến thức thành công" : "Thêm kiến thức mới thành công",
      });

      setFormData({ title: '', content: '', chunk_type: '', section_number: '' });
      setIsAddingKnowledge(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      content: item.content,
      chunk_type: item.chunk_type,
      section_number: item.section_number || ''
    });
    setEditingId(item.id);
    setIsAddingKnowledge(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kiến thức này?')) return;

    try {
      const response = await fetch(`/api/admin/seo-knowledge/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete knowledge');

      toast({
        title: "Thành công",
        description: "Xóa kiến thức thành công",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredKnowledge = seoKnowledge?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Có lỗi xảy ra khi tải dữ liệu</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý kiến thức SEO</h2>
          <p className="text-gray-600 mt-2">Quản lý cơ sở kiến thức cho chatbot tư vấn SEO Shopee</p>
        </div>
        <Button onClick={() => setIsAddingKnowledge(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm kiến thức
        </Button>
      </div>

      {/* Bulk Import Section */}
      {showBulkImport && seoKnowledge && seoKnowledge.length === 0 && (
        <div className="mb-6">
          <BulkSeoImport />
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm kiến thức..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add/Edit Form */}
      {isAddingKnowledge && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Chỉnh sửa kiến thức' : 'Thêm kiến thức mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: 1.3 Cấu trúc và sắp xếp từ khóa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số mục</label>
                  <Input
                    value={formData.section_number}
                    onChange={(e) => setFormData({ ...formData, section_number: e.target.value })}
                    placeholder="Ví dụ: 1.3, 2.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Loại kiến thức *</label>
                <Select value={formData.chunk_type} onValueChange={(value) => setFormData({ ...formData, chunk_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại kiến thức" />
                  </SelectTrigger>
                  <SelectContent>
                    {chunkTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nội dung *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung chi tiết của kiến thức..."
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số từ: {formData.content.split(' ').filter(word => word.length > 0).length}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingId ? 'Cập nhật' : 'Thêm kiến thức'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingKnowledge(false);
                    setEditingId(null);
                    setFormData({ title: '', content: '', chunk_type: '', section_number: '' });
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Knowledge List */}
      <div className="grid gap-4">
        {filteredKnowledge.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.section_number && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.section_number}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-3">{item.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {chunkTypes.find(t => t.value === item.chunk_type)?.label || item.chunk_type}
                    </span>
                    <span>{item.word_count} từ</span>
                    <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKnowledge.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'Không tìm thấy kiến thức phù hợp' : 'Chưa có kiến thức nào. Hãy import tài liệu hoặc thêm kiến thức đầu tiên!'}
        </div>
      )}
    </div>
  );
};

export default SeoKnowledgeManager;
