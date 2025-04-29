import { Card } from '@/components/ui';

export interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
    allergens?: string[];
    dietary?: {
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
    };
  };
  showImage?: boolean;
  className?: string;
}

export function MenuItemCard({ item, showImage = true, className = '' }: MenuItemCardProps) {
  return (
    <Card className={`flex ${className}`}>
      {showImage && item.imageUrl && (
        <div className="w-1/3 min-w-[120px]">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {item.dietary && (
              <div className="flex gap-2 mt-1">
                {item.dietary.isVegetarian && (
                  <span className="text-green-600 text-xs">Vegetarian</span>
                )}
                {item.dietary.isVegan && (
                  <span className="text-green-600 text-xs">Vegan</span>
                )}
                {item.dietary.isGlutenFree && (
                  <span className="text-amber-600 text-xs">Gluten-free</span>
                )}
              </div>
            )}
          </div>
          <span className="text-amber-600 font-semibold whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2">{item.description}</p>
        
        {item.allergens && item.allergens.length > 0 && (
          <p className="text-gray-500 text-sm mt-2">
            Contains: {item.allergens.join(', ')}
          </p>
        )}
        
        {!item.isAvailable && (
          <span className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            Currently unavailable
          </span>
        )}
      </div>
    </Card>
  );
} 