import { Link } from "react-router-dom";
import { Package, MapPin } from "lucide-react";

export default function Orders() {
  // Sample orders (replace with real data)
  const orders = [
    {
      id: "1",
      orderNumber: "BH-2025-001234",
      item: "iPhone 13 Pro Max",
      status: "In Transit",
      total: 463500,
    },
    {
      id: "2",
      orderNumber: "BH-2025-001233",
      item: 'Samsung TV 55"',
      status: "Delivered",
      total: 515000,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Package className="w-10 h-10 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-lg">{order.item}</h3>
                    <p className="text-sm text-gray-600">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {order.total.toLocaleString()} XAF
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      order.status === "In Transit"
                        ? "bg-orange-100 text-orange-700"
                        : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    to={`/track/${order.id}`}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
                  >
                    <MapPin className="w-4 h-4" />
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
