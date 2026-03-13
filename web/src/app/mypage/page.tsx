import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyInfoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>내 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">이름</label>
            <Input id="name" defaultValue="홍길동" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">이메일</label>
            <Input id="email" type="email" defaultValue="user@example.com" disabled />
          </div>
          <Button>저장</Button>
        </form>
      </CardContent>
    </Card>
  );
}
