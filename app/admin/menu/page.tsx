"use client";

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthStateWrapper } from '@/components/auth/AuthStateWrapper';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { MenuItemForm } from '@/components/admin/menu/MenuItemForm';
import { MenuTable } from '@/components/admin/menu/MenuTable';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/services/menu';
import type { MenuItem } from '@/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getPaginatedCollection } from '@/lib/firestore/pagination';
import { COLLECTIONS } from '@/constants/collections';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function MenuPage() {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch menu items with pagination
  const fetchItems = async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPaginatedCollection<MenuItem>(COLLECTIONS.MENU, {
        orderByField: 'category',
        startAfterDoc: startAfterDoc,
        pageSize: 10
      });
      
      if (startAfterDoc) {
        setItems(prev => [...prev, ...result.items]);
      } else {
        setItems(result.items);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more items
  const handleLoadMore = () => {
    if (lastDoc) {
      fetchItems(lastDoc);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  // Add new item
  const handleAdd = async (data: Omit<MenuItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await addMenuItem(data);
      await fetchItems();
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add menu item');
      console.error('Error adding menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing item
  const handleUpdate = async (data: Omit<MenuItem, 'id' | 'createdAt'>) => {
    if (!user || !editingItem?.id) return;
    setIsSubmitting(true);
    try {
      await updateMenuItem(editingItem.id, data);
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
    if (!user || !item.id) return;
    setDeletingId(item.id);
    try {
      await deleteMenuItem(item.id);
      await fetchItems();
    } catch (err) {
      setError('Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <AuthStateWrapper requireAuth requireAdmin>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Add, edit, or remove items from your pub's menu.
                </p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                disabled={!user}
              >
                Add Menu Item
              </Button>
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
                  disabled={!user}
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
                  disabled={!user}
                />
              </Card>
            )}

            {/* Menu Items Table */}
            <Card className="p-6">
              {isLoading && items.length === 0 ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MenuTable
                    items={items}
                    onEdit={setEditingItem}
                    onDelete={handleDelete}
                    isDeleting={deletingId}
                    disabled={!user}
                  />
                  
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        isLoading={isLoading}
                      >
                        Load More Items
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </AdminLayout>
      </AuthStateWrapper>
    </ErrorBoundary>
  );
}

export default MenuPage; 