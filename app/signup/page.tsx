"use client"
import AuthForm from "@/components/AuthForm";
import { Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Suspense } from "react";
export const dynamic = 'force-dynamic';

function AuthFormFallback() {
  return (
    <CardContent className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </CardContent>
  );
}

function SignUpPage() {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Sign Up</CardTitle>
        </CardHeader>

        <Suspense fallback={<AuthFormFallback />}>
          <AuthForm type="signUp" />
        </Suspense>
      </Card>
    </div>
  );
}

export default SignUpPage;