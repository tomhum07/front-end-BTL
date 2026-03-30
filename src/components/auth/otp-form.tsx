import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import Link from "next/link";

type OTPFormProps = {
  email?: string;
};

export function OTPForm({ email = "m@example.com" }: OTPFormProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Khôi phục mật khẩu</CardTitle>
        <CardAction>
          <Link href="/dang-nhap">
            <Button variant="link">Trở về đăng nhập</Button>
          </Link>
        </CardAction>
        <CardDescription>
          Nhập vào mã OTP mà chúng tôi đã gửi đến email của bạn:{" "}
          <span className="font-medium">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">Mã xác minh</FieldLabel>
            <Button variant="outline" size="xs">
              <RefreshCwIcon />
              Gửi lại mã
            </Button>
          </div>

          <InputOTP
            maxLength={6}
            id="otp-verification"
            required
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-11 text-xl" />
              <InputOTPSlot index={1} className="h-12 w-11 text-xl" />
              <InputOTPSlot index={2} className="h-12 w-11 text-xl" />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2" />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="h-12 w-11 text-xl" />
              <InputOTPSlot index={4} className="h-12 w-11 text-xl" />
              <InputOTPSlot index={5} className="h-12 w-11 text-xl" />
            </InputOTPGroup>
          </InputOTP>

          <FieldDescription>
            <a href="#">
              Tôi không còn truy cập được vào địa chỉ email này nữa.
            </a>
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" className="w-full">
            Xác minh
          </Button>
          <div className="text-sm text-muted-foreground">
            Bạn gặp sự cố khi đăng nhập?{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              Liên hệ bộ phận hỗ trợ
            </a>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
