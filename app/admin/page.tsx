"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/admin/login");
      } else {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (user === null) {
    // This should not render, as the hook will redirect, but for type safety:
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 mb-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome, Admin!</h1>
            <p className="text-gray-600 text-sm">Logged in as <span className="font-semibold">{user.email}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <a
            href="/admin/events"
            className="block bg-amber-100 hover:bg-amber-200 rounded-lg shadow p-6 text-center transition duration-300 cursor-pointer"
          >
            <h2 className="text-lg font-bold mb-2 text-amber-700">Manage Events</h2>
            <p className="text-gray-600 text-sm">Create, edit, and delete events.</p>
          </a>
          <a
            href="/admin/menu"
            className="block bg-amber-100 hover:bg-amber-200 rounded-lg shadow p-6 text-center transition duration-300 cursor-pointer"
          >
            <h2 className="text-lg font-bold mb-2 text-amber-700">Manage Menu</h2>
            <p className="text-gray-600 text-sm">Update food and drink offerings.</p>
          </a>
          <a
            href="/admin/gallery"
            className="block bg-amber-100 hover:bg-amber-200 rounded-lg shadow p-6 text-center transition duration-300 cursor-pointer"
          >
            <h2 className="text-lg font-bold mb-2 text-amber-700">Manage Gallery</h2>
            <p className="text-gray-600 text-sm">Add or remove gallery images.</p>
          </a>
        </div>
      </div>
    </div>
  );
} 