"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">회원가입</CardTitle>
          <CardDescription>DomainPulse 계정을 만드세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">이름</label>
              <Input id="name" type="text" placeholder="홍길동" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">이메일</label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <Input id="password" type="password" placeholder="8자 이상" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">비밀번호 확인</label>
              <Input id="confirm" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">가입하기</Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">Google로 가입</Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              로그인
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
