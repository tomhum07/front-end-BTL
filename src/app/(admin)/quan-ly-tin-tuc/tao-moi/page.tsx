"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Import Trình soạn thảo văn bản WYSIWYG
// Tránh lỗi Server-Side Rendering (SSR) khi load React Quill
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-64 flex items-center justify-center border rounded-md">Đang tải trình soạn thảo...</div>
});
import "react-quill-new/dist/quill.snow.css";

export default function CreateNewsArticlePage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";
  
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tin-tuc-chung");
  const [status, setStatus] = useState("draft");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Tạm thời hiển thị ảnh preview cục bộ
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);

      // Nếu backend có API upload riêng (ví dụ: /api/Gallery/upload), bạn có thể thêm logic 
      // tự động gọi fetch method "POST" multipart/form-data ở đây để lấy đường dẫn file (imageUrl) gán vào state.
      // VD: setThumbnailUrl(responseJson.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Đổi tên trường sang PascalCase (đặc trưng của C# / .NET API)
      // Dựa theo form UploadGallery đang dùng Title, Section, UploaderId
      const payload = {
        Title: title,
        Summary: summary,
        Content: content,
        Category: category,
        Status: status,
        ThumbnailUrl: thumbnailUrl || "",
      };

      const token = localStorage.getItem("auth_token");
      
      // Gọi API thực tế
      const response = await fetch(`${apiBaseUrl}/api/Article`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Chi tiết lỗi Backend trả về:", errorData);
        
        let errorMessage = `Lỗi API: ${response.status} ${response.statusText}`;
        if (errorData && (errorData.message || errorData.title)) {
           errorMessage = errorData.message || errorData.title;
        }
        
        toast.error(`Cập nhật thất bại: ${errorMessage}. (Xem chi tiết ở F12 Console)`);
        return; // Dừng lại ở trang hiện tại để người dùng sửa form
      }
      
      toast.success("Tạo bài viết thành công!");
      router.push("/quan-ly-tin-tuc");
      
    } catch (error) {
      toast.error("Lỗi khi kết nối hoặc dữ liệu gửi không hợp lệ với API.");
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Viết bài viết tin tức mới</CardTitle>
          <CardDescription>Điền các thông tin dưới đây để tạo bài viết trên hệ thống</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề bài viết</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tin-tuc-chung">Tin tức chung</SelectItem>
                    <SelectItem value="thong-bao">Thông báo</SelectItem>
                    <SelectItem value="su-kien">Sự kiện</SelectItem>
                    <SelectItem value="chinh-sach">Chính sách</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái xuất bản</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Xuất bản ngay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Ảnh đại diện (Thumbnail)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailUrl && (
                <div className="mt-4 relative h-48 w-full max-w-sm rounded-md overflow-hidden border">
                  <Image
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt nội dung</Label>
              <Textarea
                id="summary"
                placeholder="Đoạn mô tả ngắn về bài viết..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung bài viết</Label>
              <div className="bg-background rounded-md mb-12">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  placeholder="Soạn thảo nội dung bài viết tin tức tại đây..."
                  style={{ height: '400px' }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['link', 'image', 'video'],
                      ['clean']
                    ],
                  }}
                />
              </div>
              <input type="hidden" name="content" value={content} required />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-4 border-t pt-10">
            <Button variant="outline" type="button" onClick={() => router.push("/quan-ly-tin-tuc")}>Hủy</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Lưu bài viết"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
