import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { MenuItem } from '@/types';

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: Omit<MenuItem, 'id' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MenuItemForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading,
  disabled
}: MenuItemFormProps) {
  const [formData, setFormData] = useState<Omit<MenuItem, 'id' | 'createdAt'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'drinks',
    imageUrl: initialData?.imageUrl || '',
    isAvailable: initialData?.isAvailable ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const categories = [
    { value: 'drinks', label: 'Drinks' },
    { value: 'food', label: 'Food' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'desserts', label: 'Desserts' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading || disabled}
            className="rounded-lg border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            disabled={isLoading || disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={isLoading || disabled}
            className="rounded-lg border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
            step={0.01}
            required
            disabled={isLoading || disabled}
            className="rounded-lg border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            disabled={isLoading || disabled}
            className="rounded-lg border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2 w-full"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              disabled={isLoading || disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Available</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || disabled}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          isLoading={isLoading} 
          disabled={isLoading || disabled}
        >
          {initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
} 