"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">로그인</CardTitle>
          <CardDescription>DomainPulse에 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">이메일</label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">로그인</Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">Google로 로그인</Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
