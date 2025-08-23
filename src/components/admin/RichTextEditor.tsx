import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Edit
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import "@/styles/theory-content.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung lý thuyết...",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = 
      textarea.value.substring(0, start) + 
      before + selectedText + after + 
      textarea.value.substring(end);
    
    onChange(newText);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const heading = '#'.repeat(level) + ' ';
    insertText(heading);
  };

  const insertList = (ordered = false) => {
    const listItem = ordered ? '1. ' : '- ';
    insertText(listItem);
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      insertText(`<a href="${url}" target="_blank">`, '</a>');
    }
  };

  const insertImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    const alt = prompt('Nhập mô tả hình ảnh (tuỳ chọn):') || 'Hình ảnh';
    if (url) {
      insertText(`<figure>\n  <img src="${url}" alt="${alt}" />\n  <figcaption>${alt}</figcaption>\n</figure>\n`);
    }
  };

  const formatBold = () => insertText('<strong>', '</strong>');
  const formatItalic = () => insertText('<em>', '</em>');
  const formatUnderline = () => insertText('<u>', '</u>');
  const formatCode = () => insertText('<code>', '</code>');
  const formatQuote = () => insertText('<blockquote>\n', '\n</blockquote>');

  const insertInfoBox = () => {
    insertText('<div class="info-box">\n', '\n</div>');
  };

  const insertWarningBox = () => {
    insertText('<div class="warning-box">\n', '\n</div>');
  };

  const insertSuccessBox = () => {
    insertText('<div class="success-box">\n', '\n</div>');
  };

  const insertTable = () => {
    const tableHTML = `<table>
  <thead>
    <tr>
      <th>Tiêu đề 1</th>
      <th>Tiêu đề 2</th>
      <th>Tiêu đề 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dữ liệu 1</td>
      <td>Dữ liệu 2</td>
      <td>Dữ liệu 3</td>
    </tr>
    <tr>
      <td>Dữ liệu 4</td>
      <td>Dữ liệu 5</td>
      <td>Dữ liệu 6</td>
    </tr>
  </tbody>
</table>`;
    insertText(tableHTML);
  };

  const toolbarButtons = [
    { icon: Heading1, action: () => insertHeading(1), title: 'Tiêu đề 1' },
    { icon: Heading2, action: () => insertHeading(2), title: 'Tiêu đề 2' },
    { icon: Heading3, action: () => insertHeading(3), title: 'Tiêu đề 3' },
    { icon: Bold, action: formatBold, title: 'Đậm' },
    { icon: Italic, action: formatItalic, title: 'Nghiêng' },
    { icon: Underline, action: formatUnderline, title: 'Gạch dưới' },
    { icon: List, action: () => insertList(false), title: 'Danh sách' },
    { icon: ListOrdered, action: () => insertList(true), title: 'Danh sách số' },
    { icon: Quote, action: formatQuote, title: 'Trích dẫn' },
    { icon: Code, action: formatCode, title: 'Mã code' },
    { icon: Link, action: insertLink, title: 'Liên kết' },
    { icon: Image, action: insertImage, title: 'Hình ảnh' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trình soạn thảo nội dung</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Xem trước
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="space-y-4">
            {/* Toolbar */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-1">
                {toolbarButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    title={button.title}
                    className="h-8 w-8 p-0"
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-1 mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertInfoBox}
                  title="Hộp thông tin"
                  className="text-xs px-2 h-7 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  Info
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertWarningBox}
                  title="Hộp cảnh báo"
                  className="text-xs px-2 h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                >
                  Warning
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertSuccessBox}
                  title="Hộp thành công"
                  className="text-xs px-2 h-7 bg-green-50 text-green-700 hover:bg-green-100"
                >
                  Success
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertTable}
                  title="Chèn bảng"
                  className="text-xs px-2 h-7"
                >
                  Table
                </Button>
              </div>
            </div>

            {/* Editor */}
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[400px] font-mono text-sm resize-y"
              style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
            />

            {/* Helper Text */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="mb-2"><strong>💡 Hướng dẫn sử dụng:</strong></p>
              <ul className="space-y-1 text-xs">
                <li>• Sử dụng các nút trên thanh công cụ để định dạng văn bản</li>
                <li>• Chèn hình ảnh bằng URL (hỗ trợ JPG, PNG, GIF, WebP)</li>
                <li>• Sử dụng HTML tags để tạo nội dung phong phú</li>
                <li>• Các hộp đặc biệt: Info (thông tin), Warning (cảnh báo), Success (thành công)</li>
                <li>• Hỗ trợ bảng, danh sách, trích dẫn và mã code</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Xem trước nội dung</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <article className="theory-content">
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert px-8 py-6"
                    dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground">Chưa có nội dung để xem trước...</p>' }}
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

export default RichTextEditor;