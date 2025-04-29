"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import { Card, Button } from '@/components/ui';
import { MenuItemForm, MenuItem } from '@/components/admin/menu/MenuItemForm';
import { MenuTable } from '@/components/admin/menu/MenuTable';

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch menu items
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      const fetchedItems: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as MenuItem);
      });
      setItems(fetchedItems);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new item
  const handleAdd = async (data: Omit<MenuItem, 'id'>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'menuItems'), data);
      await fetchItems();
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add menu item');
      console.error('Error adding menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update item
  const handleUpdate = async (data: Omit<MenuItem, 'id'>) => {
    if (!editingItem?.id) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'menuItems', editingItem.id), data);
      await fetchItems();
      setEditingItem(null);
    } catch (err) {
      setError('Failed to update menu item');
      console.error('Error updating menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDelete = async (item: MenuItem) => {
    if (!item.id) return;
    setDeletingId(item.id);
    try {
      await deleteDoc(doc(db, 'menuItems', item.id));
      await fetchItems();
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add, edit, or remove items from your pub's menu.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>Add Menu Item</Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Menu Item</h2>
            <MenuItemForm
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isLoading={isSubmitting}
            />
          </Card>
        )}

        {/* Edit Form */}
        {editingItem && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Menu Item</h2>
            <MenuItemForm
              initialData={editingItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
              isLoading={isSubmitting}
            />
          </Card>
        )}

        {/* Menu Items Table */}
        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading menu items...</p>
            </div>
          ) : (
            <MenuTable
              items={items}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              isDeleting={deletingId}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(MenuPage); 