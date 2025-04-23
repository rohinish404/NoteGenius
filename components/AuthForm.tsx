"use client";

import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { Button } from "./ui/button";
import { Loader2, Chrome } from "lucide-react";
import Link from "next/link";
import { loginAction, signUpAction, signInWithGoogle } from "@/actions/users";
import { Separator } from "./ui/separator";

type Props = {
  type: "login" | "signUp";
};

function AuthForm({ type }: Props) {
  const isLoginForm = type === "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
          toast.error("Error", { description: "Email and password are required." });
          return;
      }
      if (password.length < 6) {
          toast.error("Error", { description: "Password must be at least 6 characters long."});
          return;
      }
      console.log(email, password)
      let result: { errorMessage: string | null };
      if (isLoginForm) {
        result = await loginAction(email, password);
      } else {
        result = await signUpAction(email, password);
      }
      console.log(result)
      if (!result.errorMessage) {
        toast.success(isLoginForm ? "Login successful!" : "Sign up successful! Check your email if verification is needed.");

        const redirectedFrom = searchParams.get("redirectedFrom");
        const targetUrl = (isLoginForm && redirectedFrom) ? redirectedFrom : "/dashboard";

        console.log(`AuthForm: Success, redirecting to ${targetUrl}`);
        router.replace(targetUrl);
      } else {
        toast.error("Error", {
          description: result.errorMessage,
        });
      }
    });
  };
  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        toast.error("Google Sign-In Error", { description: "Failed to sign in with Google" });
      }
    });
  };

  return (
    <>
      <form action={handleSubmit}>
        <CardContent className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              type="email"
              required
              disabled={isPending || isGooglePending}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Enter your password (min. 6 characters)"
              type="password"
              required
              minLength={6}
              disabled={isPending || isGooglePending}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending || isGooglePending}>
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : isLoginForm ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
        </CardFooter>
      </form>

      <div className="flex items-center gap-4 px-6 my-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
      </div>

      <CardFooter className="flex flex-col gap-4 pt-0"> 
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isPending || isGooglePending}
        >
          {isGooglePending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Sign {isLoginForm ? "in" : "up"} with Google
        </Button>

        <p className="text-xs text-center mt-2">
          {isLoginForm
            ? "Don't have an account yet?"
            : "Already have an account?"}{" "}
          <Link
            href={isLoginForm ? "/signup" : "/login"}
            className={`text-blue-500 underline ${(isPending || isGooglePending) ? "pointer-events-none opacity-50" : ""}`}
          >
            {isLoginForm ? "Sign Up" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

export default AuthForm;