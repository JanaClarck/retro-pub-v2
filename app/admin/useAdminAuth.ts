"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";

export function useAdminAuth() {
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
  }, [auth, router]);

  return user;
} 