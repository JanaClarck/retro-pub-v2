// import Image from 'next/image'; // Remove unused import

const drinks = [
  {
    category: 'Craft Beers',
    items: [
      { name: 'Retro IPA', price: '£6.50', description: 'Our signature IPA with citrus notes' },
      { name: 'Classic Lager', price: '£5.50', description: 'Crisp and refreshing' },
      { name: 'Amber Ale', price: '£6.00', description: 'Rich and malty' },
    ],
  },
  {
    category: 'Cocktails',
    items: [
      { name: 'Old Fashioned', price: '£9.50', description: 'Bourbon, bitters, sugar' },
      { name: 'Mojito', price: '£8.50', description: 'White rum, mint, lime' },
      { name: 'Espresso Martini', price: '£9.00', description: 'Vodka, coffee liqueur, espresso' },
    ],
  },
  {
    category: 'Wines',
    items: [
      { name: 'House Red', price: '£6.00/glass', description: 'Medium-bodied red blend' },
      { name: 'House White', price: '£6.00/glass', description: 'Crisp and fruity' },
      { name: 'Prosecco', price: '£7.50/glass', description: 'Italian sparkling wine' },
    ],
  },
];

const food = [
  {
    category: 'Starters',
    items: [
      { name: 'Loaded Nachos', price: '£8.50', description: 'Tortilla chips, cheese, salsa, guacamole' },
      { name: 'Garlic Bread', price: '£5.00', description: 'Freshly baked with garlic butter' },
      { name: 'Chicken Wings', price: '£7.50', description: 'BBQ or buffalo sauce' },
    ],
  },
  {
    category: 'Mains',
    items: [
      { name: 'Classic Burger', price: '£12.50', description: 'Beef patty, cheese, lettuce, tomato' },
      { name: 'Fish & Chips', price: '£14.00', description: 'Beer-battered cod, chips, mushy peas' },
      { name: 'Vegan Bowl', price: '£11.50', description: 'Quinoa, roasted vegetables, tahini dressing' },
    ],
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Chocolate Brownie', price: '£6.50', description: 'Warm with vanilla ice cream' },
      { name: 'Apple Crumble', price: '£6.00', description: 'With custard' },
      { name: 'Cheesecake', price: '£6.50', description: 'New York style with berry compote' },
    ],
  },
];

export default function Menu() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Our Menu</h1>

        {/* Drinks Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Drinks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {drinks.map((category) => (
              <div key={category.category} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
                <ul className="space-y-4">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <span className="font-semibold">{item.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Food Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Food</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {food.map((category) => (
              <div key={category.category} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
                <ul className="space-y-4">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <span className="font-semibold">{item.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Menu Note */}
        <div className="mt-12 text-center text-gray-600">
          <p>All prices include VAT. Menu items may vary seasonally.</p>
          <p className="mt-2">Please inform staff of any allergies or dietary requirements.</p>
        </div>
      </div>
    </div>
  );
} 