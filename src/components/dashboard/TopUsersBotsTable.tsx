import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Bot, MessageSquare } from "lucide-react";
import { TopUser, TopBot } from "@/hooks/useChatAnalytics";

interface TopUsersBotsTableProps {
  topUsers: TopUser[];
  topBots: TopBot[];
  isLoading: boolean;
}

const TopUsersBotsTable: React.FC<TopUsersBotsTableProps> = ({ topUsers, topBots, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Top Người dùng & Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Top Người dùng & Bot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Users */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" /> Top Người dùng
                    </div>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>Tên người dùng</TableHead>
                  <TableHead className="text-right">Số tin nhắn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell className="text-right">{user.message_count.toLocaleString('vi-VN')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Top Bots */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Bot className="h-4 w-4" /> Top Bot
                    </div>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>Loại Bot</TableHead>
                  <TableHead className="text-right">Số tin nhắn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBots.length > 0 ? (
                  topBots.map((bot, index) => (
                    <TableRow key={bot.bot_type}>
                      <TableCell className="font-medium">{bot.bot_type === 'seo' ? 'SEO' : 'General'}</TableCell>
                      <TableCell className="text-right">{bot.message_count.toLocaleString('vi-VN')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopUsersBotsTable;