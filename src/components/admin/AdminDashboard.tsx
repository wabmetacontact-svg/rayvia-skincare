"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Users,
  Star,
  Mail,
  RefreshCw,
  Lock,
  Truck,
  Pencil,
  Eye,
  EyeOff,
  UserRound,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR, ORDER_STATUSES } from "@/lib/utils";

type AdminTab = "overview" | "products" | "orders" | "coupons" | "reviews" | "newsletter";

type OrderRow = {
  id: number;
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  total: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
  items: unknown;
};

type CouponRow = {
  id: number;
  code: string;
  type: string;
  value: string;
  minOrder: string;
  active: boolean;
};

type ReviewRow = {
  id: number;
  name: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
};

type SubscriberRow = {
  id: number;
  email: string;
  createdAt: string;
};

type ProductForm = {
  id?: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  mrp: string;
  size: string;
  image: string;
  gallery: string;
  rating: string;
  reviewCount: string;
  benefits: string;
  ingredients: string;
  usage: string;
  faqs: string;
  shippingCharge: string;
  inStock: boolean;
  featured: boolean;
};

type CouponForm = {
  id?: number;
  code: string;
  type: string;
  value: string;
  minOrder: string;
  active: boolean;
};

const emptyProduct: ProductForm = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: "499",
  mrp: "799",
  size: "100g",
  image: "/images/products/glow-renew-de-tan-scrub.png",
  gallery: "/images/products/glow-renew-de-tan-scrub.png",
  rating: "4.8",
  reviewCount: "0",
  benefits: "Removes tan\nBrightens skin\nSmoothens texture",
  ingredients: JSON.stringify([{ name: "Niacinamide", desc: "Brightens and supports skin barrier." }], null, 2),
  usage: "Apply on clean skin\nMassage gently\nRinse thoroughly",
  faqs: JSON.stringify([{ q: "Is it suitable for all skin types?", a: "Yes, patch test recommended." }], null, 2),
  shippingCharge: "0",
  inStock: true,
  featured: false,
};

const emptyCoupon: CouponForm = {
  code: "",
  type: "percent",
  value: "10",
  minOrder: "0",
  active: true,
};

function withAuth(token: string, path: string): {
  url: string;
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!token) return { url: path, headers };
  const sep = path.includes("?") ? "&" : "?";
  return {
    url: `${path}${sep}admin_token=${encodeURIComponent(token)}`,
    headers,
  };
}

function productToForm(product: Product): ProductForm {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    price: String(product.price),
    mrp: String(product.mrp),
    size: product.size,
    image: product.image,
    gallery: product.gallery.join("\n"),
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    benefits: product.benefits.join("\n"),
    ingredients: JSON.stringify(product.ingredients, null, 2),
    usage: product.usage.join("\n"),
    faqs: JSON.stringify(product.faqs, null, 2),
    shippingCharge: String(product.shippingCharge ?? 0),
    inStock: product.inStock,
    featured: product.featured,
  };
}

function couponToForm(coupon: CouponRow): CouponForm {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrder: coupon.minOrder,
    active: coupon.active,
  };
}

const tabs: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "products", label: "Products", icon: Boxes },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "coupons", label: "Coupons", icon: Tag },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "newsletter", label: "Newsletter", icon: Mail },
];

export function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ products: 0, orders: 0, coupons: 0, subscribers: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [couponForm, setCouponForm] = useState<CouponForm>(emptyCoupon);
  const [orderSearch, setOrderSearch] = useState("");

  useEffect(() => {
    sessionStorage.removeItem("rayvia-admin-pin");
    sessionStorage.removeItem("rayvia-admin-username");
    sessionStorage.removeItem("rayvia-admin-password");
    const storedToken = sessionStorage.getItem("rayvia-admin-token");
    if (storedToken) {
      setToken(storedToken);
      setAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (authorized && token) void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, token]);

  async function request(path: string, init?: RequestInit) {
    const { url, headers } = withAuth(token, path);
    const res = await fetch(url, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers ?? {}),
      },
    });
    if (res.status === 401) {
      sessionStorage.removeItem("rayvia-admin-token");
      setToken("");
      setAuthorized(false);
      throw new Error("Session expired. Please login again.");
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  async function refreshAll() {
    setLoading(true);
    setMessage("");
    try {
      const [overview, productData, orderData, couponData] = await Promise.all([
        request("/api/admin/overview"),
        request("/api/admin/products"),
        request("/api/admin/orders"),
        request("/api/admin/coupons"),
      ]);
      setStats(overview.stats);
      setReviews(overview.latestReviews ?? []);
      setSubscribers(overview.subscribers ?? []);
      setProducts(productData.products ?? []);
      setOrders(orderData.orders ?? []);
      setCoupons(couponData.coupons ?? []);
      setMessage("Admin data refreshed.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to load admin data.";
      if (errorMessage.toLowerCase().includes("incorrect admin")) {
        setAuthorized(false);
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Incorrect admin ID or password.");
      const newToken = String(data.token || "");
      if (!newToken) throw new Error("Server did not return a session token.");
      sessionStorage.setItem("rayvia-admin-token", newToken);
      setToken(newToken);
      setAuthorized(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("rayvia-admin-token");
    setToken("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setAuthorized(false);
  }

  async function seedDatabase() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed.");
      await refreshAll();
      setMessage("Database seeded with default products, coupons and reviews.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Seed failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const querySep = token ? `?admin_token=${encodeURIComponent(token)}` : "";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/upload${querySep}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed.");

      setProductForm((prev) => ({
        ...prev,
        image: data.url,
        // If gallery is empty or same as default, also include this image in gallery
        gallery: prev.gallery ? prev.gallery : data.url,
      }));
      setMessage("Main image uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingMain(false);
      e.target.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    setMessage("");
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const querySep = token ? `?admin_token=${encodeURIComponent(token)}` : "";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/upload${querySep}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gallery upload failed.");

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      setProductForm((prev) => {
        const existing = prev.gallery
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        const combined = Array.from(new Set([...existing, ...newUrls]));
        return { ...prev, gallery: combined.join("\n") };
      });
      setMessage(`${newUrls.length} gallery image(s) uploaded successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gallery upload failed.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  function removeGalleryImage(urlToRemove: string) {
    setProductForm((prev) => {
      const current = prev.gallery
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const filtered = current.filter((u) => u !== urlToRemove);
      return { ...prev, gallery: filtered.join("\n") };
    });
  }

  async function saveProduct() {
    setLoading(true);
    setMessage("");
    try {
      const path = productForm.id ? `/api/admin/products/${productForm.id}` : "/api/admin/products";
      const method = productForm.id ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(productForm) });
      setProductForm(emptyProduct);
      await refreshAll();
      setTab("products");
      setMessage("Product saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    setLoading(true);
    try {
      await request(`/api/admin/products/${id}`, { method: "DELETE" });
      await refreshAll();
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCoupon() {
    setLoading(true);
    setMessage("");
    try {
      const path = couponForm.id ? `/api/admin/coupons/${couponForm.id}` : "/api/admin/coupons";
      const method = couponForm.id ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(couponForm) });
      setCouponForm(emptyCoupon);
      await refreshAll();
      setMessage("Coupon saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save coupon.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCoupon(id: number) {
    if (!confirm("Delete this coupon?")) return;
    setLoading(true);
    try {
      await request(`/api/admin/coupons/${id}`, { method: "DELETE" });
      await refreshAll();
      setMessage("Coupon deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete coupon.");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(order: OrderRow, status: string) {
    setLoading(true);
    setMessage("");
    try {
      const trackingNumber = prompt("Tracking number", order.trackingNumber ?? "") ?? order.trackingNumber;
      const courierName = prompt("Courier name", order.courierName ?? "Delhivery Express") ?? order.courierName;
      await request("/api/orders/status", {
        method: "POST",
        body: JSON.stringify({ orderId: order.orderId, status, trackingNumber, courierName }),
      });
      await refreshAll();
      setMessage(`Order ${order.orderId} updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update order.");
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.orderId, o.customerName, o.phone, o.email, o.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, orderSearch]);

  const galleryList = useMemo(() => {
    return productForm.gallery
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [productForm.gallery]);

  if (!authorized) {
    return (
      <section className="min-h-[70vh] bg-cream px-4 py-16">
        <div className="mx-auto max-w-md rounded-[24px] border border-ink/10 bg-white p-8 shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
            <Lock className="h-7 w-7 text-gold-dark" />
          </div>
          <h1 className="mt-5 text-center font-heading text-2xl font-bold">Rayvia Admin</h1>
          <p className="mt-2 text-center text-sm text-muted">
            Enter your admin ID and password to manage products, orders, coupons and customer data.
          </p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="admin-username">Admin ID</Label>
              <div className="relative mt-1.5">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin ID"
                  className="pl-11"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="px-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {message && (
              <p role="alert" className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </p>
            )}
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 rounded-[14px] bg-cream px-4 py-3 text-center text-xs text-muted">
            <p>Default ID: <span className="font-semibold text-ink">admin</span></p>
            <p className="mt-1">Default password: <span className="font-semibold text-ink">Rayvia@123</span></p>
            <p className="mt-1">Production me RAYVIA_ADMIN_USERNAME aur RAYVIA_ADMIN_PASSWORD set karein.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-ink/10 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Rayvia Admin</p>
            <h1 className="mt-1 font-heading text-3xl font-bold">Control Center</h1>
            <p className="mt-1 text-sm text-muted">Manage storefront products, orders, coupons and customer data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refreshAll} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={seedDatabase} disabled={loading}>
              <Plus className="h-4 w-4" />
              Seed DB
            </Button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-[14px] border border-ink/10 bg-white px-4 py-3 text-sm text-ink-soft">
            {message}
          </div>
        )}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key ? "bg-ink text-cream" : "bg-white text-ink-soft hover:bg-beige"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Revenue", value: formatINR(stats.revenue), icon: BarChart3 },
                { label: "Orders", value: stats.orders, icon: ClipboardList },
                { label: "Products", value: stats.products, icon: Boxes },
                { label: "Coupons", value: stats.coupons, icon: Tag },
                { label: "Subscribers", value: stats.subscribers, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[20px] border border-ink/10 bg-white p-5">
                  <Icon className="h-5 w-5 text-gold-dark" />
                  <p className="mt-3 font-heading text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[20px] border border-ink/10 bg-white p-6">
              <h2 className="font-heading text-lg font-bold">Latest Orders</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted">
                    <tr><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="border-t border-ink/10">
                        <td className="py-3 font-semibold">{o.orderId}</td>
                        <td>{o.customerName}</td>
                        <td>{formatINR(o.total)}</td>
                        <td><Badge variant="soft">{o.status}</Badge></td>
                        <td>{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[440px_1fr]">
            <div className="rounded-[20px] border border-ink/10 bg-white p-6 lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">{productForm.id ? "Edit Product" : "Add Product"}</h2>
                {productForm.id && <Button variant="ghost" size="sm" onClick={() => setProductForm(emptyProduct)}>New</Button>}
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Name"><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></Field>
                <Field label="Slug"><Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} /></Field>
                <Field label="Tagline"><Input value={productForm.tagline} onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })} /></Field>
                <Field label="Description"><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></Field>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Price (₹)"><Input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></Field>
                  <Field label="MRP (₹)"><Input value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} /></Field>
                  <Field label="Size"><Input value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} /></Field>
                  <Field label="Shipping Fee (₹)"><Input value={productForm.shippingCharge} onChange={(e) => setProductForm({ ...productForm, shippingCharge: e.target.value })} placeholder="0 for Free" /></Field>
                </div>

                {/* Main Image Upload */}
                <Field label="Main Image">
                  <div className="mt-1 space-y-2">
                    {productForm.image && (
                      <div className="relative inline-block group rounded-2xl overflow-hidden border border-ink/10 bg-beige">
                        <img
                          src={productForm.image}
                          alt="Main Product Preview"
                          className="h-28 w-28 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: "" })}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-sm font-semibold text-gold-dark hover:border-gold hover:bg-gold/10 cursor-pointer transition">
                      {uploadingMain ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-gold-dark" />
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-gold-dark" />
                          <span>Upload Main Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainImageUpload}
                        disabled={uploadingMain}
                      />
                    </label>
                    <Input
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="Or enter image URL path"
                      className="text-xs"
                    />
                  </div>
                </Field>

                {/* Gallery Images Upload */}
                <Field label="Gallery Images">
                  <div className="mt-1 space-y-2">
                    {galleryList.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {galleryList.map((gUrl, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-ink/10 bg-beige">
                            <img
                              src={gUrl}
                              alt={`Gallery ${idx + 1}`}
                              className="h-16 w-16 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(gUrl)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700 transition"
                              title="Remove from gallery"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-sm font-semibold text-gold-dark hover:border-gold hover:bg-gold/10 cursor-pointer transition">
                      {uploadingGallery ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-gold-dark" />
                          <span>Uploading Gallery...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-gold-dark" />
                          <span>Upload Gallery Images</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                    <Textarea
                      value={productForm.gallery}
                      onChange={(e) => setProductForm({ ...productForm, gallery: e.target.value })}
                      placeholder="Gallery URLs (one per line)"
                      rows={2}
                      className="text-xs font-mono"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Rating"><Input value={productForm.rating} onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })} /></Field>
                  <Field label="Review Count"><Input value={productForm.reviewCount} onChange={(e) => setProductForm({ ...productForm, reviewCount: e.target.value })} /></Field>
                </div>
                <Field label="Benefits (one per line)"><Textarea value={productForm.benefits} onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })} /></Field>
                <Field label="Ingredients JSON"><Textarea value={productForm.ingredients} onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })} className="font-mono text-xs" /></Field>
                <Field label="Usage (one per line)"><Textarea value={productForm.usage} onChange={(e) => setProductForm({ ...productForm, usage: e.target.value })} /></Field>
                <Field label="FAQs JSON"><Textarea value={productForm.faqs} onChange={(e) => setProductForm({ ...productForm, faqs: e.target.value })} className="font-mono text-xs" /></Field>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.inStock} onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })} /> In stock</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} /> Featured</label>
                </div>
                <Button onClick={saveProduct} variant="gold" className="w-full" disabled={loading || uploadingMain || uploadingGallery}>
                  <Save className="h-4 w-4" /> Save Product
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {products.map((p) => (
                <div key={p.id} className="rounded-[20px] border border-ink/10 bg-white p-4">
                  <div className="flex gap-4">
                    <img src={p.image} alt={p.name} className="h-24 w-24 rounded-2xl object-cover bg-beige" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold">{p.name}</h3>
                        {p.featured && <Badge variant="gold">Featured</Badge>}
                        <Badge variant={p.inStock ? "success" : "outline"}>{p.inStock ? "In Stock" : "Hidden"}</Badge>
                        {Boolean(p.shippingCharge && Number(p.shippingCharge) > 0) && (
                          <Badge variant="outline">Shipping: ₹{p.shippingCharge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted">/{p.slug}</p>
                      <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
                      <p className="mt-2 font-heading text-lg font-bold">{formatINR(p.price)} <span className="text-sm text-muted line-through">{formatINR(p.mrp)}</span></p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => setProductForm(productToForm(p))}><Pencil className="h-4 w-4" /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
                      <Button variant="link" size="sm" asChild><Link href={`/products/${p.slug}`}>View</Link></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="mt-6 rounded-[20px] border border-ink/10 bg-white p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="font-heading text-lg font-bold">Orders</h2>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders" className="pl-9" />
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr><th className="py-2">Order</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Payment</th><th>Tracking</th><th>Update</th></tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-t border-ink/10 align-top">
                      <td className="py-3 font-semibold">{o.orderId}<br /><span className="text-xs font-normal text-muted">{formatDate(o.createdAt)}</span></td>
                      <td>{o.customerName}<br /><span className="text-xs text-muted">{o.email}</span></td>
                      <td>{o.phone}</td>
                      <td>{formatINR(o.total)}</td>
                      <td><Badge variant="soft">{o.status}</Badge></td>
                      <td><Badge variant={o.paymentStatus === "paid" ? "success" : "outline"}>{o.paymentStatus}</Badge></td>
                      <td>{o.trackingNumber ?? "—"}<br /><span className="text-xs text-muted">{o.courierName ?? "—"}</span></td>
                      <td>
                        <select value={o.status} onChange={(e) => updateOrder(o, e.target.value)} className="rounded-[12px] border border-ink/15 bg-white px-3 py-2">
                          {ORDER_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "coupons" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="rounded-[20px] border border-ink/10 bg-white p-6 lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-heading text-lg font-bold">{couponForm.id ? "Edit Coupon" : "Add Coupon"}</h2>
              <div className="mt-4 space-y-3">
                <Field label="Code"><Input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} /></Field>
                <Field label="Type"><select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className="h-12 w-full rounded-[14px] border border-ink/15 bg-white px-4 text-sm"><option value="percent">Percent</option><option value="flat">Flat</option></select></Field>
                <Field label="Value"><Input value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} /></Field>
                <Field label="Minimum Order"><Input value={couponForm.minOrder} onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })} /></Field>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })} /> Active</label>
                <Button onClick={saveCoupon} variant="gold" className="w-full" disabled={loading}><Save className="h-4 w-4" /> Save Coupon</Button>
                {couponForm.id && <Button variant="ghost" className="w-full" onClick={() => setCouponForm(emptyCoupon)}>New Coupon</Button>}
              </div>
            </div>
            <div className="rounded-[20px] border border-ink/10 bg-white p-6">
              <h2 className="font-heading text-lg font-bold">Coupons</h2>
              <div className="mt-4 grid gap-3">
                {coupons.map((c) => (
                  <div key={c.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-cream p-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2"><p className="font-heading text-lg font-bold">{c.code}</p><Badge variant={c.active ? "success" : "outline"}>{c.active ? "Active" : "Inactive"}</Badge></div>
                      <p className="text-sm text-muted">{c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`} • Min order {formatINR(c.minOrder)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCouponForm(couponToForm(c))}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-6 rounded-[20px] border border-ink/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold">Latest Reviews</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-cream p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">{r.name}</p><Badge variant="gold">{r.rating}★</Badge></div>
                  <p className="mt-1 font-heading font-bold">{r.title ?? "Review"}</p>
                  <p className="mt-1 text-sm text-muted">{r.comment}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "newsletter" && (
          <div className="mt-6 rounded-[20px] border border-ink/10 bg-white p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="font-heading text-lg font-bold">Newsletter Subscribers</h2>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(subscribers.map((s) => s.email).join(","))}>Copy Emails</Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subscribers.map((s) => (
                <div key={s.id} className="rounded-2xl bg-cream p-4">
                  <p className="font-semibold">{s.email}</p>
                  <p className="text-xs text-muted">{formatDate(s.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
