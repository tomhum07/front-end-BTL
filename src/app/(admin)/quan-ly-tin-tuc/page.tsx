"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LoaderIcon, PenSquareIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed

// Giả định kiểu dữ liệu tin tức từ API
// Cho phép cả camelCase (Express/Next) và PascalCase (.NET mặc định)
export type NewsArticle = {
  id?: number;
  Id?: number;
  title?: string;
  Title?: string;
  category?: string;
  Category?: string;
  status?: string;
  Status?: string;
  createdAt?: string;
  CreatedAt?: string;
  author?: string;
  Author?: string;
};

export default function ManageNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  useEffect(() => {
    // Hàm gọi API lấy danh sách tin tức
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // FIXME: Thay đổi "/api/Article" bằng endpoint thực tế của API backend
        const response = await fetch(`${apiBaseUrl}/api/Article`);
        
        if (!response.ok) {
          console.warn("Không thể lấy dữ liệu từ API.");
          throw new Error("API_ERROR"); // Chuyển xuống catch block bằng một lỗi đánh dấu để tải Mock Data
        }
        
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.warn("Lỗi khi tải tin tức:", error);
        toast.error("Lỗi kết nối API. Hiển thị dữ liệu mẫu...");
        
        // Dữ liệu mẫu (Mock data fallback) để giao diện không trống trơn khi API chưa hoàn thiện
        setNews([
          {
            id: 1,
            title: "UBND Tỉnh ban hành quy định mới về an toàn giao thông",
            category: "Thơng báo",
            status: "published",
            createdAt: new Date().toISOString(),
            author: "Admin1",
          },
          {
            id: 2,
            title: "Khai mạc đại hội Thể dục thể thao cấp tỉnh năm 2024",
            category: "Sự kiện",
            status: "published",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            author: "User2",
          },
          {
            id: 3,
            title: "Báo cáo tiến độ thu ngân sách Quý III",
            category: "Tin tức chung",
            status: "draft",
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            author: "Admin1",
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [apiBaseUrl]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý tin tức</h1>
        <Link href="/quan-ly-tin-tuc/tao-moi">
          <Button>+ Viết bài mới</Button>
        </Link>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người đăng</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex justify-center items-center gap-2">
                    <LoaderIcon className="animate-spin w-5 h-5" /> Đang tải dữ liệu API...
                  </div>
                </TableCell>
              </TableRow>
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Không có tin tức nào.
                </TableCell>
              </TableRow>
            ) : (
              news.map((item, index) => (
                <TableRow key={item.id || item.Id || `article-${index}`}>
                  <TableCell className="font-medium">{item.id || item.Id || "N/A"}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={item.title || item.Title}>
                    {item.title || item.Title || "Không có tiêu đề"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category || item.Category || "Chung"}</Badge>
                  </TableCell>
                  <TableCell>
                    {(item.status || item.Status) === "published" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Đã xuất bản</Badge>
                    ) : (
                      <Badge variant="secondary">Bản nháp</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.author || item.Author || "N/A"}</TableCell>
                  <TableCell>{(item.createdAt || item.CreatedAt) ? format(new Date(item.createdAt || item.CreatedAt), "dd/MM/yyyy HH:mm") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Sửa bài viết">
                        <PenSquareIcon className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Xóa bài viết">
                        <Trash2Icon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
