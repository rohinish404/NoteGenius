"use client"
import AuthForm from "@/components/AuthForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';


function AuthFormFallback() {
  return (
    <CardContent className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </CardContent>
  );
}

function LoginPage() {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Login</CardTitle>
        </CardHeader>
        <Suspense fallback={<AuthFormFallback />}>
          <AuthForm type="login" />
        </Suspense>
      </Card>
    </div>
  );
}

export default LoginPage;