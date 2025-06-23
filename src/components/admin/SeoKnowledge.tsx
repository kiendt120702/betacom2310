
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useSeoKnowledge, useCreateSeoKnowledge, useUpdateSeoKnowledge, useDeleteSeoKnowledge } from '@/hooks/useSeoKnowledge';

const SeoKnowledge = () => {
  const { data: seoKnowledge, isLoading } = useSeoKnowledge();
  const createMutation = useCreateSeoKnowledge();
  const updateMutation = useUpdateSeoKnowledge();
  const deleteMutation = useDeleteSeoKnowledge();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      });
      
      toast({
        title: "Thành công",
        description: "Đã tạo tài liệu SEO mới",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo tài liệu SEO",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !formData.title || !formData.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật tài liệu SEO",
      });
      
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tài liệu SEO",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu SEO",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu SEO",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || '',
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setIsEditDialogOpen(true);
  };

  const filteredKnowledge = seoKnowledge?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý kiến thức SEO</h2>
          <p className="text-gray-600">Quản lý cơ sở dữ liệu kiến thức cho chatbot SEO Shopee</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài liệu SEO
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm tài liệu SEO mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Tiêu đề tài liệu SEO"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="VD: Tên sản phẩm, Mô tả, Từ khóa..."
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (phân cách bởi dấu phẩy)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="seo, shopee, tối ưu, từ khóa"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Nội dung chi tiết về kiến thức SEO..."
                  rows={8}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài liệu'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm tài liệu SEO..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Knowledge List */}
      <div className="grid gap-4">
        {filteredKnowledge.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Chưa có tài liệu SEO nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredKnowledge.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.category && (
                      <Badge variant="secondary" className="mt-2">
                        {item.category}
                      </Badge>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{item.content}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Tạo: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài liệu SEO</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Tiêu đề *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Tiêu đề tài liệu SEO"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">Danh mục</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="VD: Tên sản phẩm, Mô tả, Từ khóa..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-tags">Tags (phân cách bởi dấu phẩy)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="seo, shopee, tối ưu, từ khóa"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Nội dung *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Nội dung chi tiết về kiến thức SEO..."
                rows={8}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeoKnowledge;
