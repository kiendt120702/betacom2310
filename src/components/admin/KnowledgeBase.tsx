
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Upload, FileText, Loader2 } from 'lucide-react';
import { useStrategyKnowledge, StrategyKnowledge } from '@/hooks/useStrategyKnowledge';

const KnowledgeBase = () => {
  const { 
    knowledgeItems, 
    isLoading, 
    createKnowledge, 
    updateKnowledge, 
    deleteKnowledge, 
    bulkCreateKnowledge 
  } = useStrategyKnowledge();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StrategyKnowledge | null>(null);
  const [bulkData, setBulkData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    formula_a1: '',
    formula_a: '',
    industry_application: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createKnowledge.mutateAsync(formData);
    setFormData({ formula_a1: '', formula_a: '', industry_application: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: StrategyKnowledge) => {
    setEditingItem(item);
    setFormData({
      formula_a1: item.formula_a1,
      formula_a: item.formula_a,
      industry_application: item.industry_application
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await updateKnowledge.mutateAsync({
      id: editingItem.id,
      ...formData
    });
    
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    await deleteKnowledge.mutateAsync(id);
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkData.trim().split('\n');
      const newItems: Omit<StrategyKnowledge, 'id' | 'created_at' | 'updated_at' | 'created_by'>[] = [];
      
      lines.forEach((line) => {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          newItems.push({
            formula_a1: parts[0]?.trim() || '',
            formula_a: parts[1]?.trim() || '',
            industry_application: parts[2]?.trim() || ''
          });
        }
      });

      if (newItems.length > 0) {
        await bulkCreateKnowledge.mutateAsync(newItems);
        setBulkData('');
        setIsBulkDialogOpen(false);
      }
    } catch (error) {
      console.error('Bulk import error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
                <Label htmlFor="formula_a1">Công thức A1 (Chiến lược)</Label>
                <Textarea
                  id="formula_a1"
                  value={formData.formula_a1}
                  onChange={(e) => setFormData({...formData, formula_a1: e.target.value})}
                  placeholder="Mô tả chi tiết chiến lược..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="formula_a">Công thức A (Lợi ích & Cải thiện)</Label>
                <Textarea
                  id="formula_a"
                  value={formData.formula_a}
                  onChange={(e) => setFormData({...formData, formula_a: e.target.value})}
                  placeholder="Lợi ích và cải thiện cụ thể..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry_application">Ngành hàng áp dụng</Label>
                <Input
                  id="industry_application"
                  value={formData.industry_application}
                  onChange={(e) => setFormData({...formData, industry_application: e.target.value})}
                  placeholder="VD: Thời trang, F&B, Công nghệ..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createKnowledge.isPending}>
                  {createKnowledge.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Thêm
                </Button>
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
                <Button onClick={handleBulkImport} disabled={bulkCreateKnowledge.isPending}>
                  {bulkCreateKnowledge.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Import
                </Button>
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
                      <div className="truncate" title={item.formula_a1}>
                        {item.formula_a1}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={item.formula_a}>
                        {item.formula_a}
                      </div>
                    </TableCell>
                    <TableCell>{item.industry_application}</TableCell>
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
                          disabled={deleteKnowledge.isPending}
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
              <Label htmlFor="edit_formula_a1">Công thức A1 (Chiến lược)</Label>
              <Textarea
                id="edit_formula_a1"
                value={formData.formula_a1}
                onChange={(e) => setFormData({...formData, formula_a1: e.target.value})}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_formula_a">Công thức A (Lợi ích & Cải thiện)</Label>
              <Textarea
                id="edit_formula_a"
                value={formData.formula_a}
                onChange={(e) => setFormData({...formData, formula_a: e.target.value})}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_industry_application">Ngành hàng áp dụng</Label>
              <Input
                id="edit_industry_application"
                value={formData.industry_application}
                onChange={(e) => setFormData({...formData, industry_application: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateKnowledge.isPending}>
                {updateKnowledge.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Cập nhật
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
