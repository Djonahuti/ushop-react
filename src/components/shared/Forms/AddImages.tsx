// src/pages/Choice.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: string;
  rating: number;
  orders: string;
  image: string;
};

const under199: Product[] = [
  {
    id: 1,
    name: 'USB 3.0 to Type C',
    price: 'US $0.70',
    rating: 4.8,
    orders: '439',
    image: '/images/usb-c.png', // replace with actual path
  },
  {
    id: 2,
    name: 'Foldable Stand',
    price: 'US $0.94',
    rating: 4.5,
    orders: '5000+',
    image: '/images/stand.png',
  },
  {
    id: 3,
    name: 'USB 3.0 Adapter',
    price: 'US $1.47',
    rating: 4.7,
    orders: '4000+',
    image: '/images/usb.png',
  },
];

const clearance: Product[] = [
  {
    id: 4,
    name: '120W Fast Charger',
    price: 'US $3.37',
    rating: 3.8,
    orders: '2000+',
    image: '/images/charger.png',
  },
  {
    id: 5,
    name: 'X15 TWS Bluetooth',
    price: 'US $4.49',
    rating: 4.4,
    orders: '2000+',
    image: '/images/x15.png',
  },
];

const AddImages: React.FC = () => {
  return (
    <div className="bg-yellow-50 min-h-screen p-4 pt-20 font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 flex flex-col z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Choice</h1>
          <input
            type="text"
            placeholder="free delivery shipping items"
            className="ml-4 p-2 w-full max-w-md rounded border"
          />
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-700">
          <span>Free shipping over $10</span>
          <span>Free returns</span>
        </div>
      </div>

      {/* Under $1.99 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-3">Under $1.99</h2>
        <div className="grid grid-cols-3 gap-4">
          {under199.map((item) => (
            <div key={item.id} className="bg-white p-2 rounded shadow-sm relative">
              <img src={item.image} alt={item.name} className="h-20 mx-auto mb-2" />
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-yellow-600 text-sm">
                {item.rating} stars • {item.orders} orders
              </div>
              <div className="mt-1 font-bold">{item.price}</div>
              <button className="absolute bottom-2 right-2 bg-black text-white p-1 rounded-full">
                <ShoppingCart size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 text-sm font-medium">
        <span className="border-b-2 border-black">Clearance</span>
        <span className="text-gray-500">Games & Accessories</span>
        <span className="text-gray-500">For You</span>
      </div>

      {/* Clearance */}
      <section className="mt-4 grid grid-cols-2 gap-4">
        {clearance.map((item) => (
          <div key={item.id} className="bg-white p-2 rounded shadow-sm relative">
            <img src={item.image} alt={item.name} className="h-24 mx-auto mb-2" />
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-yellow-600 text-sm">
              {item.rating} stars • {item.orders} orders
            </div>
            <div className="mt-1 font-bold">{item.price}</div>
            <button className="absolute bottom-2 right-2 bg-black text-white p-1 rounded-full">
              <ShoppingCart size={16} />
            </button>
          </div>
        ))}
      </section>

      {/* Cart Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-700">US $14.84 <span className="text-green-600">Free shipping</span></div>
          <div className="text-xs text-red-500">Free shipping available</div>
        </div>
        <button className="bg-yellow-400 px-4 py-2 rounded-full text-black font-bold">Checkout</button>
      </div>
    </div>
  );
};

export default AddImages;
