"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/dist/client/link";

export default function RecoveryForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    router.push(`/xac-minh-otp?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn bên dưới để khôi phục mật khẩu
          </CardDescription>
          <CardAction>
            <Link href="/">
              <Button variant="link">Trở về trang chủ</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <FieldError />
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  Gửi mã OTP
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <Link href="/dang-nhap" className="mx-auto">
            <Button variant="link">Quay lại đăng nhập</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
