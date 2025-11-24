"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SetupWorkerPage() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuthActions();

  // Step 1: Request password setup code
  const handleRequestCode = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Zadajte e-mailovú adresu");
      return;
    }

    setStatus("loading");
    setMessage("Odosielam overovací kód...");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("flow", "reset");
      
      await signIn("password", formData);
      
      setStatus("success");
      setMessage("Overovací kód bol odoslaný na váš email");
      setStep("verify");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Chyba: ${error.message || "Nepodarilo sa odoslať kód"}`);
      console.error("Code request error:", error);
    }
  };

  // Step 2: Verify code and set password
  const handleSetPassword = async () => {
    if (!code || !password) {
      setStatus("error");
      setMessage("Vyplňte všetky polia");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Heslo musí mať aspoň 8 znakov");
      return;
    }

    setStatus("loading");
    setMessage("Nastavujem heslo...");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", code);
      formData.append("password", password);
      formData.append("flow", "reset-verification");
      
      await signIn("password", formData);
      
      setStatus("success");
      setMessage("Heslo úspešne nastavené! Môžete sa prihlásiť.");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Chyba: ${error.message || "Nesprávny kód alebo heslo"}`);
      console.error("Password setup error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === "request" ? "Nastavenie hesla" : "Overenie a nastavenie hesla"}
          </CardTitle>
          <CardDescription>
            {step === "request" 
              ? "Zadajte email, na ktorý vám admin vytvoril účet"
              : "Zadajte kód z emailu a zvoľte si heslo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Request Code */}
          {step === "request" && status !== "success" && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Po zadaní emailu vám pošleme overovací kód na nastavenie hesla.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="vas.email@priklad.sk"
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleRequestCode} 
                className="w-full" 
                size="lg"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Odosielam...
                  </span>
                ) : (
                  "Odoslať overovací kód"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Verify and Set Password */}
          {step === "verify" && status !== "success" && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Kód bol odoslaný na <strong>{email}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Overovací kód (z emailu)</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="123456"
                  disabled={status === "loading"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nové heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Minimálne 8 znakov"
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setStep("request");
                    setStatus("idle");
                    setCode("");
                    setPassword("");
                  }} 
                  variant="outline"
                  className="flex-1"
                  disabled={status === "loading"}
                >
                  Späť
                </Button>
                <Button 
                  onClick={handleSetPassword} 
                  className="flex-1"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Nastavujem...
                    </span>
                  ) : (
                    "Nastaviť heslo"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && step === "verify" && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>

              <Button onClick={() => window.location.href = "/"} className="w-full">
                Prejsť na prihlásenie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
