import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tactic } from "@/hooks/useTactics"; // Updated import path

interface TacticTableProps {
  tactics: Tactic[];
  loading: boolean;
  onEdit: (tactic: Tactic) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  pageSize: number;
  isAdmin: boolean;
}

export function TacticTable({
  tactics,
  loading,
  onEdit,
  onDelete,
  currentPage,
  pageSize,
  isAdmin,
}: TacticTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (tactics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          Chưa có chiến thuật nào
        </div>
        <p className="text-sm text-muted-foreground">
          Hãy thêm chiến thuật đầu tiên của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">STT</TableHead>
            <TableHead className="min-w-[200px]">Chiến thuật</TableHead>
            <TableHead className="w-full">Mô tả</TableHead>{" "}
            {/* Removed min-w to allow it to take full available width */}
            {isAdmin && (
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tactics.map((tactic, index) => (
            <TableRow key={tactic.id}>
              <TableCell className="font-medium align-top py-4">
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell className="font-medium align-top py-4">
                <div className="whitespace-normal break-words">
                  {tactic.tactic}
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <div className="whitespace-pre-wrap break-words">
                  {" "}
                  {/* Changed to whitespace-pre-wrap */}
                  {tactic.description}
                </div>
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right align-top py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tactic)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(tactic.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}