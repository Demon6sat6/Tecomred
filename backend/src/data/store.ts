import type { Order } from "../types/order.js";

const orders: Order[] = [];

export const store = {
  listOrders: () => orders,
  createOrder: (order: Order) => {
    orders.unshift(order);
    return order;
  },
  updateOrderStatus: (id: string, status: Order["status"]) => {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      return null;
    }
    orders[idx] = { ...orders[idx], status };
    return orders[idx];
  },
};
