export const ORDERS_STORAGE_KEY = "virsa-marketplace-orders";
export const CHECKOUT_DRAFT_KEY = "virsa-checkout-draft";

export function readOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = readOrders().filter((item) => item.reference !== order.reference);
  orders.unshift(order);
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}

export function findOrder(reference) {
  return readOrders().find((order) => order.reference === reference) || null;
}

export function updateOrder(reference, update) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.reference === reference);
  if (index < 0) return null;
  orders[index] = update(orders[index]);
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    return null;
  }
  return orders[index];
}

export function normalizeProduct(product) {
  const unitPriceCents = Math.round(Number(product.price) * 100);
  return {
    id: String(product.id ?? ""),
    name: product.name || "Handcrafted item",
    description: product.description || product.subtitle || "",
    unitPriceCents: Number.isFinite(unitPriceCents) ? unitPriceCents : 0,
    image: product.images?.[0] || product.image || "",
    artisan: product.artisan || product.storeName || "Artisan details unavailable",
    craft: product.craft || product.category || "Handcrafted tradition",
    origin: product.artisanLocation || product.state || "India",
  };
}

export function formatINR(cents) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function createOrderReference() {
  const uniquePart = globalThis.crypto?.randomUUID?.().slice(0, 8) ||
    Math.random().toString(36).slice(2, 10);
  return `VR-${Date.now().toString(36).toUpperCase()}-${uniquePart.toUpperCase()}`;
}