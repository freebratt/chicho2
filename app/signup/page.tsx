"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
    const { signIn } = useAuthActions();
    const [email, setEmail] = useState("admin@chicho.tech");
    const [password, setPassword] = useState("Chicho123");
    const [name, setName] = useState("Admin User");
    const [result, setResult] = useState("");

    const handleSignUp = async () => {
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("name", name);
            formData.append("flow", "signUp");

            await signIn("password", formData);
            setResult("✅ User created successfully!");
        } catch (error: any) {
            setResult("❌ Error: " + error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Admin Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button onClick={handleSignUp} className="w-full">
                        Create Admin Account
                    </Button>
                    {result && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                            {result}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
