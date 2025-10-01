import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PersonnelAchievement {
  personnel_name: string;
  leader_name: string;
  shop_names: string[];
}

interface PersonnelAchievementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  personnelData: PersonnelAchievement[];
}

const PersonnelAchievementModal: React.FC<PersonnelAchievementModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  personnelData
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {personnelData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Shop đạt được</TableHead>
                  <TableHead>Số lượng shop</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnelData
                  .sort((a, b) => b.shop_names.length - a.shop_names.length)
                  .map((person, index) => (
                  <TableRow key={`${person.personnel_name}-${person.leader_name}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{person.personnel_name}</TableCell>
                    <TableCell>{person.leader_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {person.shop_names.map((shop, shopIndex) => (
                          <span 
                            key={shopIndex}
                            className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs"
                          >
                            {shop}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-center">{person.shop_names.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu nhân viên đạt được.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelAchievementModal;