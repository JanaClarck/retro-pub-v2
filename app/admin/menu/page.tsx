"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "@/lib/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
} from "firebase/firestore";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export default function AdminMenuPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Drink",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Drink",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // Auth check
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

  // Fetch menu items
  useEffect(() => {
    if (!user) return;
    setLoading(true);
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
      .catch(() => setFormError("Failed to fetch menu items."))
      .finally(() => setLoading(false));
  }, [user, db, formSuccess, editSuccess, deleteSuccess]);

  // Add new menu item
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);
    try {
      await addDoc(collection(db, "menuItems"), {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
      });
      setFormSuccess("Menu item added!");
      setForm({ title: "", description: "", price: "", category: "Drink" });
    } catch {
      setFormError("Failed to add menu item.");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit menu item
  const handleEdit = (item: MenuItem) => {
    setEditId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      category: item.category,
    });
    setEditError("");
    setEditSuccess("");
  };

  const handleEditSave = async (id: string) => {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      await updateDoc(doc(db, "menuItems", id), {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        category: editForm.category,
      });
      setEditSuccess("Menu item updated!");
      setEditId(null);
    } catch {
      setEditError("Failed to update menu item.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete menu item
  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      await deleteDoc(doc(db, "menuItems", id));
      setDeleteSuccess("Menu item deleted!");
    } catch {
      setDeleteError("Failed to delete menu item.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }
  if (user === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 mb-8 mt-8">
        <h1 className="text-2xl font-bold mb-6">Manage Menu</h1>
        {/* Add New Item Form */}
        <form onSubmit={handleAdd} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Drink">Drink</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 disabled:opacity-50"
            >
              {formLoading ? "Adding..." : "Add Item"}
            </button>
          </div>
          {formError && <div className="md:col-span-2 text-red-600 text-sm mt-2">{formError}</div>}
          {formSuccess && <div className="md:col-span-2 text-green-600 text-sm mt-2">{formSuccess}</div>}
        </form>
        {/* Menu Items List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Loading menu items...</td>
                </tr>
              ) : menuItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No menu items found.</td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-2 font-semibold">
                      {editId === item.id ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item.title
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === item.id ? (
                        <select
                          value={editForm.category}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        >
                          <option value="Drink">Drink</option>
                          <option value="Food">Food</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === item.id ? (
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === item.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item.price.toFixed(2)
                      )}
                    </td>
                    <td className="px-4 py-2 flex flex-col gap-2 min-w-[120px]">
                      {editId === item.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(item.id)}
                            disabled={editLoading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-xs mb-1 disabled:opacity-50"
                          >
                            {editLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                          {editError && <div className="text-red-600 text-xs mt-1">{editError}</div>}
                          {editSuccess && <div className="text-green-600 text-xs mt-1">{editSuccess}</div>}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md text-xs mb-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteLoading === item.id}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-xs"
                          >
                            {deleteLoading === item.id ? "Deleting..." : "Delete"}
                          </button>
                          {deleteError && <div className="text-red-600 text-xs mt-1">{deleteError}</div>}
                          {deleteSuccess && <div className="text-green-600 text-xs mt-1">{deleteSuccess}</div>}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 