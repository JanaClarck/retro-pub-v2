"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase-config/client";
import { createUserDocument } from "@/services/user";
import { Card, CardBody, Input, Button, LoadingSpinner } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

// Debug log for component mount
console.log("[Debug] Admin login page mounting");

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            Error rendering login form: {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminLoginPage() {
  console.log("[Debug] Rendering AdminLoginPage component");
  
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Debug log for auth state
  useEffect(() => {
    console.log("[Debug] Auth state:", { isLoading, user: !!user, role });
  }, [isLoading, user, role]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user && role === 'admin') {
      console.log("[Debug] Redirecting authenticated admin to dashboard");
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
    console.log("[Debug] Attempting login submission");
    setIsSubmitting(true);
    setError(null);

    try {
      // Sign in with Firebase Auth
      const { user } = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log("[Debug] Login successful, creating user document");
      // Create or update user document in Firestore
      await createUserDocument(user.uid, user.email!);

      // The router.replace will happen automatically through the useEffect above
      // once the auth state changes
    } catch (error: any) {
      console.error("[Debug] Login error:", error);
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
    console.log("[Debug] Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading authentication state...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user && role === 'admin') {
    console.log("[Debug] User is authenticated, returning null");
    return null;
  }

  console.log("[Debug] Rendering login form");
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Debug indicator */}
        <div className="fixed top-2 right-2 text-xs text-gray-500">
          Login UI Loaded
        </div>
        
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
    </ErrorBoundary>
  );
} 