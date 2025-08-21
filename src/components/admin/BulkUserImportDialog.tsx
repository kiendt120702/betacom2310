import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBulkCreateUsers } from "@/hooks/useUsers";
import { Upload, FileText, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useTeams } from "@/hooks/useTeams";
import { useRoles } from "@/hooks/useRoles";
import { Input } from "@/components/ui/input";
import { toast as sonnerToast } from "sonner";

interface BulkUserImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BulkUserImportDialog: React.FC<BulkUserImportDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
  const bulkCreateUsers = useBulkCreateUsers();
  const { toast } = useToast();
  const { data: teams = [] } = useTeams();
  const { data: roles = [] } = useRoles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setParsedData(json);
        setImportResult(null);
      } catch (error) {
        toast({ title: "Lỗi", description: "Không thể đọc file. Vui lòng kiểm tra định dạng.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(fileToParse);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        email: "nhanvien.a@betacom.site",
        password: "Password@123",
        full_name: "Nguyễn Văn A",
        role: "chuyên viên",
        team_id: "dán team_id vào đây",
        work_type: "fulltime",
        phone: "0987654321",
      },
    ];
    const teamsData = teams.map(t => ({ "Team Name": t.name, "Team ID": t.id }));
    const rolesData = roles.map(r => ({ "Role Name": r.name }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wsTeams = XLSX.utils.json_to_sheet(teamsData);
    const wsRoles = XLSX.utils.json_to_sheet(rolesData);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.utils.book_append_sheet(wb, wsTeams, "Teams List");
    XLSX.utils.book_append_sheet(wb, wsRoles, "Roles List");
    
    XLSX.writeFile(wb, "user_import_template.xlsx");
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({ title: "Lỗi", description: "Không có dữ liệu để import.", variant: "destructive" });
      return;
    }

    const promise = bulkCreateUsers.mutateAsync(parsedData as any);

    sonnerToast.promise(promise, {
      loading: `Đang import ${parsedData.length} người dùng...`,
      success: (result) => {
        setImportResult(result);
        onSuccess();
        return `Import hoàn tất: ${result.success} thành công, ${result.failed} thất bại.`;
      },
      error: (err: any) => {
        setImportResult(null);
        return `Lỗi import: ${err.message}`;
      },
    });
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetState(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import người dùng hàng loạt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Tải file mẫu
            </Button>
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Xem trước dữ liệu ({parsedData.length} dòng):</h4>
              <div className="max-h-48 overflow-auto border rounded-md">
                <pre className="p-2 text-xs">{JSON.stringify(parsedData.slice(0, 5), null, 2)}</pre>
              </div>
            </div>
          )}

          {importResult && (
            <div className="space-y-2">
              <h4 className="font-medium">Kết quả import:</h4>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {importResult.success} thành công</div>
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> {importResult.failed} thất bại</div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-auto">
                    <h5 className="text-sm font-semibold">Chi tiết lỗi:</h5>
                    <ul className="list-disc list-inside text-xs">
                      {importResult.errors.map((err, i) => <li key={i}>{err.email}: {err.reason}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={handleImport} disabled={parsedData.length === 0 || bulkCreateUsers.isPending}>
            {bulkCreateUsers.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang import...</> : "Bắt đầu Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUserImportDialog;