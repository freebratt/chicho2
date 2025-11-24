"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function SetupAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("boris.cicman@gmail.com");
  const [name, setName] = useState("Boris Čičman");
  const [setupToken, setSetupToken] = useState("");

  const createAdmin = useMutation(api.admin.createInitialAdmin);

  const handleCreateAdmin = async () => {
    if (!email || !name || !setupToken) {
      setStatus("error");
      setMessage("Vyplňte všetky polia vrátane setup tokenu");
      return;
    }

    setStatus("loading");
    setMessage("Vytváram prvého admin používateľa...");

    try {
      await createAdmin({
        email,
        name,
        setupToken
      });

      setStatus("success");
      setMessage(`Admin účet úspešne vytvorený! Teraz sa môžete prihlásiť pomocou hesla.`);
    } catch (error: any) {
      setStatus("error");
      setMessage(`Chyba: ${error.message}`);
      console.error("Admin creation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Vytvorenie prvého Admin účtu</CardTitle>
          <CardDescription>
            Vytvorte prvého administrátora systému pomocou setup tokenu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Bezpečnostná poznámka:</strong> Setup token nájdete v Macaly → Settings → Secrets pod názvom <code className="bg-blue-100 px-1 rounded">ADMIN_SETUP_TOKEN</code>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="name">Meno</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaše meno"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas.email@priklad.sk"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Setup Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={setupToken}
                  onChange={(e) => setSetupToken(e.target.value)}
                  placeholder="Zadajte setup token"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tento účet bude mať plné administrátorské oprávnenia.
                </AlertDescription>
              </Alert>

              <Button onClick={handleCreateAdmin} className="w-full" size="lg">
                Vytvoriť admin účet
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center justify-center py-8 space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-gray-700">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800 font-medium">Ďalšie kroky:</p>
                <ol className="text-sm text-amber-700 list-decimal ml-4 space-y-1">
                  <li>Prejdite na <strong>/setup-worker</strong> a vytvorte heslo pre tohto admina</li>
                  <li>Použite rovnaký email: <code className="bg-amber-100 px-1 rounded">{email}</code></li>
                  <li>Po nastavení hesla sa prihláste na hlavnej stránke</li>
                </ol>
              </div>

              <Button onClick={() => window.location.href = "/setup-worker"} className="w-full">
                Pokračovať → Nastavenie hesla
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <Button onClick={() => setStatus("idle")} variant="outline" className="w-full">
                Skúsiť znova
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
