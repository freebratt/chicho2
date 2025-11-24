"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react";
import ChichoLogo from "@/components/ChichoLogo";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SignInWithPassword() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600 flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Načítavam...</span>
          </div>
        </div>
      </AuthLoading>
      <Authenticated>
        <AuthenticatedView />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function AuthenticatedView() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  // Redirect based on user role - check from Convex
  // For now, redirect to admin (you can add role checking later)
  if (typeof window !== 'undefined') {
    router.push('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vitajte!</CardTitle>
          <CardDescription>Úspešne ste prihlásený</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signOut()} className="w-full">
            Odhlásiť sa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataObj = new FormData();
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("flow", "signIn");

      await signIn("password", formDataObj);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Nesprávne prihlasovacie údaje");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <ChichoLogo size="lg" />
          </div>
          <h1 className="font-orbitron text-3xl font-bold text-chicho-red mb-2">
            Prihlásenie
          </h1>
          <p className="font-inter text-gray-600">
            Interný portál pre výrobné návody a školenia
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="font-russo text-xl text-center text-chicho-dark">
              Vstup do portálu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 font-inter">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-inter font-semibold">
                  E-mailová adresa
                </Label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jan@chicho.tech"
                    className="pl-10 font-inter"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-inter font-semibold">
                  Heslo
                </Label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10 font-inter"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-chicho-red hover:bg-red-700 text-white font-inter font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Prihlasuje sa...
                  </span>
                ) : (
                  "Prihlásiť sa"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 font-inter">
                © 2025 <span className="chicho-text">CHICHO</span> s.r.o. -
                Všetky práva vyhradené
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
