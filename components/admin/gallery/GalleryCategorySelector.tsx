import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
}

interface GalleryCategorySelectorProps {
  categories: GalleryCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (category: GalleryCategory) => Promise<void>;
  isLoading?: boolean;
}

export function GalleryCategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  isLoading
}: GalleryCategorySelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddCategory(newCategoryName);
      setNewCategoryName('');
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: GalleryCategory) => {
    if (window.confirm(`Are you sure you want to delete the "${category.name}" category and all its images? This action cannot be undone.`)) {
      await onDeleteCategory(category);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || isLoading}
        >
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </form>
      )}

      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
            selectedCategory === null
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center group"
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`flex-1 text-left px-4 py-2 rounded-md transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCategory(category)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 