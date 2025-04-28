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
  const [error, setError] = useState<string | null>(null);

  // Validate menu item data
  const validateMenuItem = (data: DocumentData): MenuItem | null => {
    if (!data.title || typeof data.title !== 'string' ||
        !data.description || typeof data.description !== 'string' ||
        !data.price || typeof data.price !== 'number' ||
        !data.category || typeof data.category !== 'string') {
      return null;
    }
    return {
      id: '',  // Will be set from doc.id
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
    };
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const db = getFirestore(firebaseApp);
        const querySnapshot = await getDocs(collection(db, "menuItems"));
        const items: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const validatedItem = validateMenuItem(data);
          if (validatedItem) {
            items.push({ ...validatedItem, id: doc.id });
          }
        });
        setMenuItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) return <div className="text-center py-8">Loading menu...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Our Menu</h1>
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-200">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">£{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 