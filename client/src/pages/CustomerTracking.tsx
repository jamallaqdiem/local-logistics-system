import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api } from "../api/axios";
import { OrderData } from "../types/order";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// default Leaflet marker icon pathing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const CustomerTracking: React.FC = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Example coordinates for delivery destination
  const deliveryPosition: [number, number] = [50.7898, -1.0772];

  useEffect(() => {
    if (!trackingToken) return;

    // Initial HTTP GET of order details using Axios instance
    api
      .get<OrderData>(`/orders/track/${trackingToken}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.error ||
          "Invalid tracking link or order not found";
        setError(errorMessage);
        setLoading(false);
      });

    // Establish Socket.io connection
    const socket: Socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log(
        "Connected to WebSocket server, joining room:",
        trackingToken,
      );
      socket.emit("join_tracking", trackingToken);
    });

    //Listen for order updates and force functional state update
    socket.on("order_updated", (updatedOrder: OrderData) => {
      console.log("Real-time update received:", updatedOrder);
      if (updatedOrder.trackingToken === trackingToken) {
        setOrder(() => ({ ...updatedOrder }));
      }
    });

    return () => {
      socket.off("order_updated");
      socket.disconnect();
    };
  }, [trackingToken]);

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading delivery details...</div>;
  if (error || !order)
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        Error: {error || "Order not found"}
      </div>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
      <h2>Live Delivery Tracker</h2>

      {/* Order Summary Details */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Customer:</strong> {order.customer}
        </p>
        <p>
          <strong>Destination:</strong> {order.address}
        </p>
        <p>
          <strong>Status: </strong>
          <span
            style={{
              fontWeight: "bold",
              color:
                order.status === "in_transit"
                  ? "#d97706"
                  : order.status === "delivered"
                    ? "#059669"
                    : "#2563eb",
            }}
          >
            {order.status.toUpperCase().replace("_", " ")}
          </span>
        </p>
        <p>
          <strong>Est. Delivery:</strong>{" "}
          {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Interactive Leaflet Map */}
      <div
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={deliveryPosition}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={deliveryPosition}>
            <Popup>
              <strong>{order.customer}</strong>
              <br />
              {order.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
