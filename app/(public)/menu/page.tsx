import { getDocuments } from '@/firebase/firestore';
import { Card } from '@/components/ui';
import { FirestoreDocument } from '@/firebase/firestore';

interface MenuItem extends FirestoreDocument {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export const metadata = {
  title: 'Menu - Retro Pub',
  description: 'Explore our delicious food and drink offerings.',
};

export default async function MenuPage() {
  const menuItems = await getDocuments<MenuItem>('menu', []);

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Menu</h1>

      {Object.entries(itemsByCategory).map(([category, items]) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-amber-600">
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="flex">
                {item.imageUrl && (
                  <div className="w-1/3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className="text-amber-600 font-semibold">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{item.description}</p>
                  {!item.isAvailable && (
                    <span className="mt-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Currently unavailable
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 