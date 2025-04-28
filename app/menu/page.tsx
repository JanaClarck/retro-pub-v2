"use client";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, DocumentData } from "firebase/firestore";
import firebaseApp from "@/lib/firebase";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    getDocs(collection(db, "menuItems"))
      .then((querySnapshot) => {
        const items: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          items.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            price: data.price,
            category: data.category,
          });
        });
        setMenuItems(items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading menu...</div>;

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Our Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-2">{item.category}</p>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <span className="font-semibold">{typeof item.price === 'number' ? item.price.toFixed(2) : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 