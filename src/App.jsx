import { mockOrders } from "@/components/data";
import { OrderCard } from "@/components/OrderCard";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Live Order Feed
        </h1>

        <div className="flex flex-col gap-4">
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
