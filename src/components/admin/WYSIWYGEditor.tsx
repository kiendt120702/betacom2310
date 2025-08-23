import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Edit,
  Type,
  Palette
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import "@/styles/theory-content.css";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết...",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const editorRef = useRef<HTMLDivElement>(null);

  // This effect syncs external changes to the editor's content.
  // It compares the prop `value` with the editor's current `innerHTML`
  // to avoid resetting the content (and cursor) during user input.
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // This handler is called when the user types or pastes content.
  const handleInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
    const newContent = event.currentTarget.innerHTML;
    if (value !== newContent) {
      onChange(newContent);
    }
  }, [onChange, value]);

  // A wrapper for document.execCommand to format text.
  const execCmd = useCallback((command: string, valueArg?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, valueArg);
      // After a command, we manually trigger the input handler to sync state.
      const newContent = editorRef.current.innerHTML;
      if (value !== newContent) {
        onChange(newContent);
      }
    }
  }, [onChange, value]);

  // Toolbar actions
  const formatBold = () => execCmd('bold');
  const formatItalic = () => execCmd('italic');
  const formatUnderline = () => execCmd('underline');
  const formatHeading = (level: string) => execCmd('formatBlock', `h${level}`);
  const insertOrderedList = () => execCmd('insertOrderedList');
  const insertUnorderedList = () => execCmd('insertUnorderedList');
  const alignLeft = () => execCmd('justifyLeft');
  const alignCenter = () => execCmd('justifyCenter');
  const alignRight = () => execCmd('justifyRight');
  const formatQuote = () => execCmd('formatBlock', 'blockquote');

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) execCmd('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    if (url) execCmd('insertImage', url);
  };

  const changeTextColor = (color: string) => execCmd('foreColor', color);
  const changeBackgroundColor = (color: string) => execCmd('hiliteColor', color);
  const changeFontSize = (size: string) => execCmd('fontSize', size);

  const insertSpecialBox = (className: string, defaultText: string) => {
    const selectedText = window.getSelection()?.toString() || defaultText;
    const html = `<div class="${className}">${selectedText}</div><p><br></p>`;
    execCmd('insertHTML', html);
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Tiêu đề 1</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Tiêu đề 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">Dữ liệu 1</td>
            <td style="border: 1px solid #ccc; padding: 8px;">Dữ liệu 2</td>
          </tr>
        </tbody>
      </table><p><br></p>`;
    execCmd('insertHTML', tableHTML);
  };

  const toolbarButtons = [
    { icon: Bold, action: formatBold, title: 'Đậm (Ctrl+B)' },
    { icon: Italic, action: formatItalic, title: 'Nghiêng (Ctrl+I)' },
    { icon: Underline, action: formatUnderline, title: 'Gạch dưới (Ctrl+U)' },
    { icon: List, action: insertUnorderedList, title: 'Danh sách chấm' },
    { icon: ListOrdered, action: insertOrderedList, title: 'Danh sách số' },
    { icon: Quote, action: formatQuote, title: 'Trích dẫn' },
    { icon: Link, action: insertLink, title: 'Thêm liên kết' },
    { icon: Image, action: insertImage, title: 'Thêm hình ảnh' },
    { icon: AlignLeft, action: alignLeft, title: 'Căn trái' },
    { icon: AlignCenter, action: alignCenter, title: 'Căn giữa' },
    { icon: AlignRight, action: alignRight, title: 'Căn phải' },
  ];

  const colors = [
    { name: 'Đen', value: '#000000' }, { name: 'Đỏ', value: '#dc2626' },
    { name: 'Xanh lá', value: '#16a34a' }, { name: 'Xanh dương', value: '#2563eb' },
    { name: 'Vàng', value: '#ca8a04' }, { name: 'Tím', value: '#9333ea' },
    { name: 'Xám', value: '#6b7280' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Soạn thảo nội dung</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit" className="flex items-center gap-2"><Edit className="h-4 w-4" />Soạn thảo</TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2"><Eye className="h-4 w-4" />Xem trước</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
              <div className="flex flex-wrap gap-1">
                <Select onValueChange={formatHeading}>
                  <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Tiêu đề" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tiêu đề 1</SelectItem>
                    <SelectItem value="2">Tiêu đề 2</SelectItem>
                    <SelectItem value="3">Tiêu đề 3</SelectItem>
                    <SelectItem value="p">Đoạn văn</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={changeFontSize}>
                  <SelectTrigger className="w-20 h-8"><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nhỏ</SelectItem>
                    <SelectItem value="3">Bình thường</SelectItem>
                    <SelectItem value="4">Lớn</SelectItem>
                    <SelectItem value="6">Rất lớn</SelectItem>
                  </SelectContent>
                </Select>
                {toolbarButtons.map((button, index) => (
                  <Button key={index} variant="ghost" size="sm" onClick={button.action} title={button.title} className="h-8 w-8 p-0">
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                <div className="flex items-center gap-1 mr-2"><Type className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Màu chữ:</span></div>
                {colors.map((color) => <button key={color.value} onClick={() => changeTextColor(color.value)} className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500" style={{ backgroundColor: color.value }} title={color.name} />)}
                <div className="flex items-center gap-1 ml-4 mr-2"><Palette className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Nền:</span></div>
                {colors.slice(1).map((color) => <button key={`bg-${color.value}`} onClick={() => changeBackgroundColor(color.value)} className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500" style={{ backgroundColor: color.value }} title={`Nền ${color.name}`} />)}
              </div>
              <div className="flex gap-1 pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => insertSpecialBox('info-box', 'Nội dung thông tin')} title="Hộp thông tin" className="text-xs px-3 h-7 bg-blue-50 text-blue-700 hover:bg-blue-100">💡 Thông tin</Button>
                <Button variant="ghost" size="sm" onClick={() => insertSpecialBox('warning-box', 'Nội dung cảnh báo')} title="Hộp cảnh báo" className="text-xs px-3 h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100">⚠️ Cảnh báo</Button>
                <Button variant="ghost" size="sm" onClick={() => insertSpecialBox('success-box', 'Nội dung thành công')} title="Hộp thành công" className="text-xs px-3 h-7 bg-green-50 text-green-700 hover:bg-green-100">✅ Thành công</Button>
                <Button variant="ghost" size="sm" onClick={insertTable} title="Chèn bảng" className="text-xs px-3 h-7">📊 Bảng</Button>
              </div>
            </div>
            <div className="border rounded-lg min-h-[400px] overflow-hidden">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                className="w-full min-h-[400px] p-4 prose prose-lg max-w-none focus:outline-none"
                style={{ lineHeight: '1.6', fontSize: '16px' }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <Card>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">Xem trước nội dung</CardTitle></CardHeader>
              <CardContent className="p-0">
                <article className="theory-content">
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert px-8 py-6"
                    dangerouslySetInnerHTML={{ __html: value || `<p class="text-muted-foreground">${placeholder}</p>` }}
                  />
                </article>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WYSIWYGEditor;