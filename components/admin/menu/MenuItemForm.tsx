import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { MenuItem } from '@/services/menu';

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: Omit<MenuItem, 'id'>) => Promise<void>;
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
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
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
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={disabled}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={disabled}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            type="number"
            label="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
            step={0.01}
            required
            disabled={disabled}
          />
        </div>

        <div>
          <Input
            label="Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
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
        <Button type="submit" isLoading={isLoading} disabled={disabled}>
          {initialData ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
} 