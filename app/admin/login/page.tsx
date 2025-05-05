"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase-config/client";
import { createUserDocument } from "@/services/user";
import { Card, CardBody, Input, Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user && role === 'admin') {
      router.replace('/admin');
    }
  }, [user, role, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Sign in with Firebase Auth
      const { user } = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create or update user document in Firestore
      await createUserDocument(user.uid, user.email!);

      // The router.replace will happen automatically through the useEffect above
      // once the auth state changes
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.code === 'auth/invalid-credential' 
          ? "Invalid email or password."
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user && role === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={isSubmitting}
                placeholder="admin@example.com"
              />

              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                placeholder="••••••••"
              />

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 