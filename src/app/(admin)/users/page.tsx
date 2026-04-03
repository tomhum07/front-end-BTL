"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LockIcon, UnlockIcon, ShieldAlertIcon, SearchIcon } from "lucide-react";

// Định nghĩa kiểu dữ liệu người dùng
type User = {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Editor" | "Staff" | "LanhDao" | "Viewer";
  isLocked: boolean;
};

// Dữ liệu mẫu (có thể thay bằng fetch API sau này)
const initialUsers: User[] = [
  {
    id: "1",
    fullName: "Quản trị viên",
    email: "admin@example.com",
    role: "Admin",
    isLocked: false,
  },
  {
    id: "2",
    fullName: "Người chỉnh sửa",
    email: "editor@example.com",
    role: "Editor",
    isLocked: false,
  },
  {
    id: "3",
    fullName: "Cán bộ nhân viên",
    email: "staff@example.com",
    role: "Staff",
    isLocked: false,
  },
  {
    id: "4",
    fullName: "Lãnh đạo",
    email: "lanhdao@example.com",
    role: "LanhDao",
    isLocked: false,
  },
  {
    id: "5",
    fullName: "Người dùng khách",
    email: "guest@example.com",
    role: "Viewer",
    isLocked: true,
  },
];

export default function UserManagementPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: User["role"]; userName: string } | null>(null);
  
  // States for filtering
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getAuthToken = () => {
    return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  };

  // Lấy dữ liệu người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = getAuthToken();
        const response = await fetch(`${apiBaseUrl}/api/admin/users`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (!response.ok) {
          throw new Error("Lỗi khi tải danh sách người dùng.");
        }
        
        const data = await response.json();
        // Lấy danh sách từ API (thường nằm ở data, data.items, hoặc là mảng)
        const rawUsers = Array.isArray(data) ? data : (data.items || data.value || []);
        
        // Chuẩn hóa dữ liệu API về kiểu User để ID không bị lặp hoặc undefined
        const normalizedUsers = rawUsers.map((u: any, index: number) => {
          // Xử lý các dạng trả về danh sách vai trò từ backend (VD: chuỗi, mảng chuỗi, hoặc mảng object)
          let extractedRole = u.role || u.Role || u.roleName || u.RoleName;
          if (!extractedRole && Array.isArray(u.roles) && u.roles.length > 0) {
            const firstRole = u.roles[0];
            extractedRole = typeof firstRole === 'object' 
              ? (firstRole.name || firstRole.Name || firstRole.roleName || firstRole.RoleName) 
              : firstRole;
          }
          let roleRaw = String(extractedRole || "Viewer");
          
          // Format lại role cho trùng khớp với db case
          if (roleRaw.toLowerCase() === "admin") roleRaw = "Admin";
          else if (roleRaw.toLowerCase() === "editor") roleRaw = "Editor";
          else if (roleRaw.toLowerCase() === "staff") roleRaw = "Staff";
          else if (roleRaw.toLowerCase() === "lanhdao") roleRaw = "LanhDao";
          else if (roleRaw.toLowerCase() === "viewer") roleRaw = "Viewer";
          else roleRaw = "Viewer"; // Fallback nếu không khớp vai trò nào

          // Fallback cho ID
          const finalId = u.id || u.userId || u.Id || u.UserId || `fallback-id-${index}`;
          
          return {
            id: String(finalId),
            fullName: u.fullName || u.fullname || u.FullName || u.name || u.username || u.userName || "Không rõ",
            email: u.email || u.Email || "",
            role: roleRaw as User["role"],
            isLocked: u.isLocked ?? u.IsLocked ?? u.lockoutEnabled ?? u.LockoutEnabled ?? (u.lockoutEnd !== null && u.lockoutEnd !== undefined) ?? false,
          };
        });

        setUsers(normalizedUsers.length > 0 ? normalizedUsers : initialUsers);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
        // Fallback to initialUsers in case API doesn't work yet during dev
        setUsers(initialUsers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [apiBaseUrl]);

  // Lọc dữ liệu
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const uName = user.fullName || "";
      const uEmail = user.email || "";

      const matchSearch =
        uName.toLowerCase().includes(search.toLowerCase()) ||
        uEmail.toLowerCase().includes(search.toLowerCase());
      
      const matchRole = roleFilter === "all" || user.role === roleFilter;
      
      const matchStatus = 
        statusFilter === "all" || 
        (statusFilter === "locked" && user.isLocked) ||
        (statusFilter === "active" && !user.isLocked);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Xử lý đổi vai trò
  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    // Lưu lại state cũ để rollback nếu gọi API thất bại
    const previousUsers = [...users];

    try {
      const token = getAuthToken();
      // Optimistic update - cập nhật giao diện ngay lập tức
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      
      // Ánh xạ RoleName sang RoleId dựa trên DB (nếu API cần ID thay vì Tên)
      const roleMap: Record<string, number> = {
        "Admin": 1,
        "Editor": 2,
        "Staff": 3,
        "LanhDao": 4,
        "Viewer": 5
      };
      const mappedRoleId = roleMap[newRole] || 5;

      // Gửi role mới qua cả tham số URL (query) và Body JSON để đề phòng cấu hình [FromBody] hay [FromQuery] trong API .NET
      // Support các kiểu models: chuỗi, đối tượng { role }, đối tượng { roleId }
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/role?role=${newRole}&roleName=${newRole}&roleId=${mappedRoleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ role: newRole, roleName: newRole, Name: newRole, Role: newRole, roleId: mappedRoleId, RoleId: mappedRoleId }), 
      });

      if (!res.ok) {
        // Gửi thử payload là chuỗi JSON thuần (nếu C# expect [FromBody] string)
        const retryRes = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/role?roleId=${mappedRoleId}&role=${newRole}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(newRole),
        });

        if (!retryRes.ok) {
          // Thử gửi ID thẳng số thuần nếu backend lấy [FromBody] int roleId
          const finalRetry = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/role`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(mappedRoleId),
          });

          if (!finalRetry.ok) {
            const errorText = await finalRetry.text();
            let errorMessage = "Chưa thể cập nhật vai trò từ máy chủ.";
            try {
               const errorData = JSON.parse(errorText);
               errorMessage = errorData?.message || errorData?.title || errorData?.detail || Object.values(errorData?.errors || {}).flat()[0] || errorMessage;
            } catch {
               errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }
        }
      }

      toast.success(`Thay đổi vai trò thành ${newRole} thành công!`);
    } catch (error) {
      // Rollback nếu thất bại
      setUsers(previousUsers);
      toast.error(error instanceof Error ? error.message : "Thay đổi vai trò thất bại. Đã khôi phục trạng thái cũ.");
    }
  };

  // Xử lý khóa/mở khóa tài khoản
  const handleToggleLock = async (userId: string, isLocked: boolean) => {
    // Lưu lại state cũ để rollback nếu gọi API thất bại
    const previousUsers = [...users];

    try {
      const token = getAuthToken();
      // Endpoint tương ứng với tính năng lock hay unlock
      const endpoint = isLocked ? "unlock" : "lock";
      
      // Optimistic update
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isLocked: !isLocked } : u));
      
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || err?.title || "Phản hồi API có lỗi.");
      }
      
      toast.success(!isLocked ? "Đã khóa hệ thống thành công!" : "Đã mở khóa hệ thống thành công!");
    } catch (error) {
      // Rollback
      setUsers(previousUsers);
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại. Đã khôi phục.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlertIcon className="h-6 w-6" /> Quản lý người dùng
        </h1>
      </div>

      <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm bằng tên hoặc email..."
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-span-1">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="LanhDao">Lãnh Đạo</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Đang tải danh sách người dùng...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(val: User["role"]) => {
                        if (val !== user.role) {
                          setPendingRoleChange({
                            userId: user.id,
                            newRole: val,
                            userName: user.fullName,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="LanhDao">Lãnh đạo</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isLocked ? "destructive" : "default"}
                      className={
                        !user.isLocked
                          ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                          : ""
                      }
                    >
                      {user.isLocked ? "Đã khóa" : "Hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={user.isLocked ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleLock(user.id, user.isLocked)}
                      className="flex items-center gap-2"
                    >
                      {user.isLocked ? (
                        <>
                          <UnlockIcon className="h-4 w-4" /> Mở khóa
                        </>
                      ) : (
                        <>
                          <LockIcon className="h-4 w-4" /> Khóa
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal xác nhận đổi vai trò */}
      {pendingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card rounded-lg border shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Xác nhận thay đổi vai trò</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bạn có chắc chắn muốn thay đổi vai trò của người dùng{" "}
                <span className="font-semibold text-foreground">{pendingRoleChange.userName}</span> thành{" "}
                <span className="font-semibold text-primary">{pendingRoleChange.newRole}</span>?
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingRoleChange(null);
                    toast.info("Đã hủy thay đổi vai trò.");
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() => {
                    const { userId, newRole } = pendingRoleChange;
                    setPendingRoleChange(null);
                    handleRoleChange(userId, newRole);
                  }}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
