
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeItem {
  id: string;
  cong_thuc_a1: string;
  cong_thuc_a: string;
  nganh_hang: string;
  created_at: string;
  updated_at: string;
}

const KnowledgeBase = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [bulkData, setBulkData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cong_thuc_a1: '',
    cong_thuc_a: '',
    nganh_hang: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save knowledge item
      const newItem: KnowledgeItem = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setKnowledgeItems([...knowledgeItems, newItem]);
      setFormData({ cong_thuc_a1: '', cong_thuc_a: '', nganh_hang: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Thành công",
        description: "Đã thêm kiến thức mới vào hệ thống",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      cong_thuc_a1: item.cong_thuc_a1,
      cong_thuc_a: item.cong_thuc_a,
      nganh_hang: item.nganh_hang
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      // TODO: Implement API call to update knowledge item
      const updatedItems = knowledgeItems.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, updated_at: new Date().toISOString() }
          : item
      );
      
      setKnowledgeItems(updatedItems);
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật kiến thức",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement API call to delete knowledge item
      setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
      
      toast({
        title: "Thành công",
        description: "Đã xóa kiến thức",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa kiến thức. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    try {
      // Parse bulk data (assuming CSV or structured text format)
      const lines = bulkData.trim().split('\n');
      const newItems: KnowledgeItem[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split('\t'); // Tab-separated values
        if (parts.length >= 3) {
          newItems.push({
            id: `bulk_${Date.now()}_${index}`,
            cong_thuc_a1: parts[0]?.trim() || '',
            cong_thuc_a: parts[1]?.trim() || '',
            nganh_hang: parts[2]?.trim() || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });

      setKnowledgeItems([...knowledgeItems, ...newItems]);
      setBulkData('');
      setIsBulkDialogOpen(false);
      
      toast({
        title: "Thành công",
        description: `Đã import ${newItems.length} mục kiến thức`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể import dữ liệu. Vui lòng kiểm tra định dạng.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Knowledge Base</h2>
        <p className="text-gray-600 mt-2">Quản lý cơ sở kiến thức cho hệ thống tư vấn chiến lược</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm kiến thức
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm kiến thức mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cong_thuc_a1">Công thức A1 (Chiến lược)</Label>
                <Textarea
                  id="cong_thuc_a1"
                  value={formData.cong_thuc_a1}
                  onChange={(e) => setFormData({...formData, cong_thuc_a1: e.target.value})}
                  placeholder="Mô tả chi tiết chiến lược..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cong_thuc_a">Công thức A (Lợi ích & Cải thiện)</Label>
                <Textarea
                  id="cong_thuc_a"
                  value={formData.cong_thuc_a}
                  onChange={(e) => setFormData({...formData, cong_thuc_a: e.target.value})}
                  placeholder="Lợi ích và cải thiện cụ thể..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nganh_hang">Ngành hàng áp dụng</Label>
                <Input
                  id="nganh_hang"
                  value={formData.nganh_hang}
                  onChange={(e) => setFormData({...formData, nganh_hang: e.target.value})}
                  placeholder="VD: Thời trang, F&B, Công nghệ..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Thêm</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import hàng loạt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Import dữ liệu hàng loạt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulkData">Dữ liệu (định dạng: Công thức A1 [TAB] Công thức A [TAB] Ngành hàng)</Label>
                <Textarea
                  id="bulkData"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="Paste dữ liệu từ Excel hoặc Google Sheets..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Hướng dẫn: Copy dữ liệu từ Excel/Google Sheets và paste vào ô trên.</p>
                <p>Mỗi dòng là một mục kiến thức, các cột cách nhau bằng Tab.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleBulkImport}>Import</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Knowledge Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Danh sách kiến thức ({knowledgeItems.length} mục)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {knowledgeItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu kiến thức. Hãy thêm mục đầu tiên!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Công thức A1</TableHead>
                  <TableHead className="w-1/3">Công thức A</TableHead>
                  <TableHead>Ngành hàng</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={item.cong_thuc_a1}>
                        {item.cong_thuc_a1}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={item.cong_thuc_a}>
                        {item.cong_thuc_a}
                      </div>
                    </TableCell>
                    <TableCell>{item.nganh_hang}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa kiến thức</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit_cong_thuc_a1">Công thức A1 (Chiến lược)</Label>
              <Textarea
                id="edit_cong_thuc_a1"
                value={formData.cong_thuc_a1}
                onChange={(e) => setFormData({...formData, cong_thuc_a1: e.target.value})}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_cong_thuc_a">Công thức A (Lợi ích & Cải thiện)</Label>
              <Textarea
                id="edit_cong_thuc_a"
                value={formData.cong_thuc_a}
                onChange={(e) => setFormData({...formData, cong_thuc_a: e.target.value})}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_nganh_hang">Ngành hàng áp dụng</Label>
              <Input
                id="edit_nganh_hang"
                value={formData.nganh_hang}
                onChange={(e) => setFormData({...formData, nganh_hang: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
