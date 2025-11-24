"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function MigrationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<any>(null);

  const migrateData = useMutation(api.migration.migrateFromLocalStorage);

  const handleMigration = async () => {
    setStatus("loading");
    setMessage("Načítavam dáta z localStorage...");

    try {
      // Load data from localStorage
      const navodyRaw = localStorage.getItem("chicho_navody");
      const tagsRaw = localStorage.getItem("chicho_tags");
      const usersRaw = localStorage.getItem("chicho_pouzivatelia");
      const feedbackRaw = localStorage.getItem("chicho_pripomienky");

      const navody = navodyRaw ? JSON.parse(navodyRaw) : [];
      const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const feedback = feedbackRaw ? JSON.parse(feedbackRaw) : [];

      setMessage(`Nájdených ${navody.length} návodov, ${tags.length} tagov, ${users.length} používateľov, ${feedback.length} pripomienok`);

      // Migrate to Convex
      setMessage("Prenášam dáta do Convex...");
      const result = await migrateData({
        navody,
        tags,
        users,
        feedback,
      });

      setResults(result);
      setStatus("success");
      setMessage("Migrácia úspešne dokončená!");

      // Optionally clear localStorage after successful migration
      // localStorage.removeItem("chicho_navody");
      // localStorage.removeItem("chicho_tags");
      // localStorage.removeItem("chicho_pouzivatelia");
      // localStorage.removeItem("chicho_pripomienky");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Chyba pri migrácii: ${error.message}`);
      console.error("Migration error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Migrácia dát do Convex</CardTitle>
          <CardDescription>
            Prenesie všetky dáta z localStorage do Convex databázy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Táto akcia prenesie všetky návody, tagy, používateľov a pripomienky z localStorage do Convex databázy.
                  Po úspešnej migrácii budú dáta synchronizované naprieč všetkými zariadeniami.
                </AlertDescription>
              </Alert>
              <Button onClick={handleMigration} className="w-full" size="lg">
                Spustiť migráciu
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

              {results && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-gray-900">Výsledky migrácie:</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✅ Tagy: {results.tags.length}</li>
                    <li>✅ Používatelia: {results.users.length}</li>
                    <li>✅ Návody: {results.navody.length}</li>
                    <li>✅ Pripomienky: {results.feedback.length}</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => window.location.href = "/admin"} className="flex-1">
                  Prejsť na Admin
                </Button>
                <Button onClick={() => window.location.href = "/navody"} variant="outline" className="flex-1">
                  Prejsť na Návody
                </Button>
              </div>
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
              <Button onClick={handleMigration} variant="outline" className="w-full">
                Skúsiť znova
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
