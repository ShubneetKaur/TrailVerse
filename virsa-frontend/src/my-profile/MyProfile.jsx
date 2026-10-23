
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Heart,
  Home,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import "./MyProfile.css";
import { readOrders } from "../orders/orderStorage";

const starterProducts = [
  {
    id: 1,
    name: "Royal Blue Pottery",
    category: "Jaipur, Rajasthan",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=85",
    tag: "Artisan favourite",
  },
  {
    id: 2,
    name: "Phulkari Embroidery",
    category: "Punjab",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=700&q=85",
    tag: "Handcrafted",
  },
  {
    id: 3,
    name: "Traditional Brassware",
    category: "Moradabad, Uttar Pradesh",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=85",
    tag: "Timeless craft",
  },
];

const starterOrders = [
  {
    id: "VR-1024",
    name: "Handcrafted Blue Pottery",
    artisan: "Neelam Crafts",
    price: 1299,
    date: "12 Oct 2026",
    status: "Delivered",
    image: starterProducts[0].image,
  },
  {
    id: "VR-1025",
    name: "Phulkari Dupatta",
    artisan: "Punjab Heritage Studio",
    price: 1899,
    date: "18 Oct 2026",
    status: "In transit",
    image: starterProducts[1].image,
  },
];

const initialProfile = {
  name: "Your Name",
  username: "virsa_explorer",
  email: "",
  phone: "",
  memberSince: "October 2026",
};

const initialAddress = {
  id: 1,
  name: "Home",
  recipient: "",
  phone: "",
  line: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: true,
};

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "profile", label: "Personal Profile", icon: UserRound },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "cart", label: "My Cart", icon: ShoppingCart },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "recent", label: "Recently Viewed", icon: Clock3 },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() =>
    readStorage(key, initialValue)
  );

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The page remains usable if browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mp-section-heading">
      <div>
        {eyebrow && <p className="mp-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="mp-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="mp-empty-state">
      <div className="mp-empty-icon">
        <Icon size={29} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onToggleWishlist, saved }) {
  return (
    <article className="mp-product-card">
      <div className="mp-product-image-wrap">
        <img
          className="mp-product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className="mp-product-tag">{product.tag}</span>
        <button
          className={`mp-favourite-button ${saved ? "is-saved" : ""}`}
          onClick={() => onToggleWishlist(product)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mp-product-info">
        <p className="mp-product-origin">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="mp-product-bottom">
          <strong>{money(product.price)}</strong>
          <button
            className="mp-add-button"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MyProfile({ onBack, onSignOut, onTrackOrder }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [notice, setNotice] = useState("");
  const photoInput = useRef(null);

  const [profile, setProfile] = usePersistentState(
    "virsa-my-profile",
    initialProfile
  );
  const [avatar, setAvatar] = usePersistentState(
    "virsa-profile-avatar",
    ""
  );
  const [cart, setCart] = usePersistentState("virsa-cart", []);
  const [wishlist, setWishlist] = usePersistentState(
    "virsa-wishlist",
    [starterProducts[1]]
  );
  const [addresses, setAddresses] = usePersistentState(
    "virsa-addresses",
    []
  );
  const [orders] = useState(() => {
    const marketplaceOrders = readOrders().map((order) => ({
      id: order.reference,
      reference: order.reference,
      name: order.product?.name || "Demo order",
      artisan: order.product?.artisan || "Artisan details unavailable",
      price: order.totalCents / 100,
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
        : "Date unavailable",
      status: order.disputeStatus === "under_review"
        ? "Under review · demo"
        : order.deliveryStatus === "delivered"
          ? "Delivered · demo"
          : "Demo order placed",
      image: order.product?.image || "",
    }));
    return [...marketplaceOrders, ...readStorage("virsa-demo-orders", starterOrders)];
  });
  const [recentlyViewed] = usePersistentState(
    "virsa-recently-viewed",
    starterProducts
  );
  const [notifications, setNotifications] = usePersistentState(
    "virsa-notifications",
    { orderUpdates: true, offers: false, craftStories: true }
  );

  const [profileDraft, setProfileDraft] = useState(profile);
  const [addressDraft, setAddressDraft] = useState(initialAddress);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const firstName = profile.name.trim().split(/\s+/)[0] || "Explorer";
  const initials =
    profile.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "V";

  const filteredProducts = starterProducts.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const navigateTo = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });

    showNotice(`${product.name} added to your cart`);
  };

  const changeQuantity = (id, change) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
    showNotice("Item removed from your cart");
  };

  const toggleWishlist = (product) => {
    const isSaved = wishlist.some((item) => item.id === product.id);

    setWishlist((current) =>
      isSaved
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    );

    showNotice(
      isSaved ? "Removed from your wishlist" : "Saved to your wishlist"
    );
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfile(profileDraft);
    setEditingProfile(false);
    showNotice("Your profile has been updated");
  };

  const openAddressForm = (address = null) => {
    setEditingAddressId(address?.id ?? null);
    setAddressDraft(address ? { ...address } : {
      ...initialAddress,
      id: Date.now(),
      isDefault: addresses.length === 0,
    });
    setShowAddressForm(true);
  };

  const saveAddress = (event) => {
    event.preventDefault();

    const cleanedAddress = {
      ...addressDraft,
      isDefault: addressDraft.isDefault || addresses.length === 0,
    };

    setAddresses((current) => {
      let next = editingAddressId
        ? current.map((address) =>
            address.id === editingAddressId
              ? cleanedAddress
              : address
          )
        : [...current, cleanedAddress];

      if (cleanedAddress.isDefault) {
        next = next.map((address) => ({
          ...address,
          isDefault: address.id === cleanedAddress.id,
        }));
      }

      return next;
    });

    setShowAddressForm(false);
    showNotice(editingAddressId ? "Address updated" : "Address saved");
  };

  const deleteAddress = (id) => {
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== id);

      if (!next.some((address) => address.isDefault) && next.length) {
        next[0] = { ...next[0], isDefault: true };
      }

      return [...next];
    });
    showNotice("Address removed");
  };

  const setDefaultAddress = (id) => {
    setAddresses((current) =>
      current.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
    showNotice("Default delivery address updated");
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("Please choose an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showNotice("Please choose an image smaller than 3 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      showNotice("Profile photo updated");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSignOut = () => {
    if (typeof onSignOut === "function") {
      onSignOut();
    } else {
      showNotice("Connect your existing sign-out handler in App.jsx");
    }
  };

  const renderOverview = () => (
    <>
      <div className="mp-welcome-banner">
        <div className="mp-welcome-copy">
          <span className="mp-banner-kicker">
            <Sparkles size={14} /> YOUR PERSONAL CORNER
          </span>
          <h2>
            Namaste, {firstName}<span className="mp-gold-dot">.</span>
          </h2>
          <p>
            Every craft has a story. Let's continue yours, one beautiful
            discovery at a time.
          </p>
          <button
            className="mp-banner-button"
            onClick={() => navigateTo("profile")}
          >
            Explore your profile <ArrowRight size={16} />
          </button>
        </div>
        <div className="mp-mandala" aria-hidden="true">
          <div className="mp-mandala-ring">
            <div className="mp-mandala-inner">✺</div>
          </div>
          <span className="mp-mandala-star star-one">✧</span>
          <span className="mp-mandala-star star-two">✦</span>
        </div>
      </div>

      <div className="mp-stat-grid">
        <button className="mp-stat-card" onClick={() => navigateTo("orders")}>
          <span className="mp-stat-icon mp-stat-crimson"><Package /></span>
          <span className="mp-stat-label">Total orders</span>
          <strong>{orders.length}</strong>
          <span className="mp-stat-foot">Your purchases <ArrowRight size={13} /></span>
        </button>
        <button className="mp-stat-card" onClick={() => navigateTo("cart")}>
          <span className="mp-stat-icon mp-stat-gold"><ShoppingBag /></span>
          <span className="mp-stat-label">In your cart</span>
          <strong>{cartCount}</strong>
          <span className="mp-stat-foot">Ready to explore <ArrowRight size={13} /></span>
        </button>
        <button className="mp-stat-card" onClick={() => navigateTo("wishlist")}>
          <span className="mp-stat-icon mp-stat-rose"><Heart /></span>
          <span className="mp-stat-label">Saved treasures</span>
          <strong>{wishlist.length}</strong>
          <span className="mp-stat-foot">Your favourites <ArrowRight size={13} /></span>
        </button>
      </div>

      <section className="mp-content-section">
        <SectionHeading
          eyebrow="THE JOURNEY SO FAR"
          title="Your recent orders"
          description="Little treasures finding their way to you."
          action={
            <button className="mp-text-button" onClick={() => navigateTo("orders")}>
              View all <ArrowRight size={15} />
            </button>
          }
        />

        {orders.length ? (
          <div className="mp-order-list">
            {orders.slice(0, 2).map((order) => (
              <article className="mp-order-row" key={order.id}>
                <img src={order.image} alt={order.name} />
                <div className="mp-order-details">
                  <span className="mp-order-number">ORDER #{order.id}</span>
                  <h3>{order.name}</h3>
                  <p>{order.artisan} · {order.date}</p>
                </div>
                <div className="mp-order-end">
                  <strong>{money(order.price)}</strong>
                  <span
                    className={`mp-status ${
                      order.status === "Delivered" ? "is-delivered" : "is-transit"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Your story starts here"
            description="Your orders will appear here when you shop."
            action={<button className="mp-primary-button" onClick={onBack}>Explore the marketplace</button>}
          />
        )}
      </section>

      <section className="mp-content-section">
        <SectionHeading
          eyebrow="CURATED WITH LOVE"
          title="Treasures worth discovering"
          description="Handpicked inspiration from India's incredible artisans."
          action={
            <button className="mp-text-button" onClick={onBack}>
              Explore all <ArrowRight size={15} />
            </button>
          }
        />
        <div className="mp-product-grid">
          {starterProducts.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              saved={wishlist.some((item) => item.id === product.id)}
            />
          ))}
        </div>
      </section>
    </>
  );

  const renderProfile = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="GET TO KNOW YOU"
        title="Personal profile"
        description="A few details that make your VIRSA experience yours."
        action={
          !editingProfile && (
            <button
              className="mp-outline-button"
              onClick={() => {
                setProfileDraft(profile);
                setEditingProfile(true);
              }}
            >
              <Settings size={15} /> Edit details
            </button>
          )
        }
      />

      <div className="mp-profile-identity">
        <div className="mp-avatar-wrap">
          {avatar ? (
            <img src={avatar} alt="Your profile" className="mp-avatar-image" />
          ) : (
            <div className="mp-avatar-placeholder">{initials}</div>
          )}
          <button
            className="mp-camera-button"
            onClick={() => photoInput.current?.click()}
            aria-label="Change profile photo"
            title="Change profile photo"
          >
            <Camera size={16} />
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhoto}
          />
        </div>
        <div>
          <span className="mp-member-label"><Sparkles size={13} /> A PART OF VIRSA</span>
          <h3>{profile.name || "Your Name"}</h3>
          <p>@{profile.username || "your_username"}</p>
          <span className="mp-member-date">Member since {profile.memberSince}</span>
        </div>
      </div>

      {editingProfile ? (
        <form className="mp-form" onSubmit={saveProfile}>
          <div className="mp-form-grid">
            <label>
              Full name
              <input
                value={profileDraft.name}
                onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                required
                maxLength={80}
                placeholder="Enter your full name"
              />
            </label>
            <label>
              Username
              <input
                value={profileDraft.username}
                onChange={(e) => setProfileDraft({ ...profileDraft, username: e.target.value })}
                required
                maxLength={40}
                placeholder="Choose a username"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={profileDraft.email}
                onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                placeholder="you@gmail.com"
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                value={profileDraft.phone}
                onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                maxLength={20}
                placeholder="Enter phone number"
              />
            </label>
          </div>
          <div className="mp-form-actions">
            <button type="button" className="mp-outline-button" onClick={() => setEditingProfile(false)}>
              Cancel
            </button>
            <button type="submit" className="mp-primary-button">
              <Check size={16} /> Save changes
            </button>
          </div>
        </form>
      ) : (
        <div className="mp-detail-grid">
          <div className="mp-detail-card">
            <span><UserRound size={17} /> Full name</span>
            <strong>{profile.name || "Not added yet"}</strong>
          </div>
          <div className="mp-detail-card">
            <span><Mail size={17} /> Email address</span>
            <strong>{profile.email || "Not added yet"}</strong>
          </div>
          <div className="mp-detail-card">
            <span><CreditCard size={17} /> Username</span>
            <strong>@{profile.username || "Not added yet"}</strong>
          </div>
          <div className="mp-detail-card">
            <span><ShieldCheck size={17} /> Phone number</span>
            <strong>{profile.phone || "Not added yet"}</strong>
          </div>
        </div>
      )}

      <div className="mp-info-note">
        <ShieldCheck size={19} />
        <p>Your profile information is stored in this browser for this prototype. Connect your authentication system to display and update verified account details.</p>
      </div>
    </section>
  );

  const renderOrders = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="EVERY PURCHASE HAS A STORY"
        title="My orders"
        description="Follow your handcrafted treasures from artisan to doorstep."
      />
      <div className="mp-order-filters">
        <span><Package size={16} /> {orders.length} orders</span>
        <span>Demo order history</span>
      </div>
      {orders.length ? (
        <div className="mp-order-list mp-order-list-full">
          {orders.map((order) => (
            <article className="mp-order-row" key={order.id}>
              <img src={order.image} alt={order.name} />
              <div className="mp-order-details">
                <span className="mp-order-number">ORDER #{order.id}</span>
                <h3>{order.name}</h3>
                <p>{order.artisan}</p>
                <p>Placed on {order.date}</p>
              </div>
              <div className="mp-order-end">
                <strong>{money(order.price)}</strong>
                <span className={`mp-status ${order.status === "Delivered" ? "is-delivered" : "is-transit"}`}>
                  {order.status === "Delivered" ? <Check size={12} /> : <Truck size={12} />}
                  {order.status}
                </span>
                <button
                  className="mp-small-link"
                  onClick={() => order.reference && onTrackOrder
                    ? onTrackOrder(order.reference)
                    : showNotice(`Order ${order.id}: ${order.status} (sample history)`)}
                >
                  Track order
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Package} title="No orders just yet" description="Discover a craft that speaks to you and your order history will appear here." action={<button className="mp-primary-button" onClick={onBack}>Explore VIRSA</button>} />
      )}
      <p className="mp-disclaimer">These are sample orders for the frontend prototype, not actual purchases.</p>
    </section>
  );

  const renderCart = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="ALMOST YOURS"
        title="My cart"
        description="Your chosen treasures, waiting for their next chapter."
      />
      {cart.length ? (
        <div className="mp-cart-layout">
          <div className="mp-cart-items">
            {cart.map((item) => (
              <article className="mp-cart-row" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="mp-cart-info">
                  <span className="mp-product-origin">{item.category}</span>
                  <h3>{item.name}</h3>
                  <strong>{money(item.price)}</strong>
                  <div className="mp-quantity-control">
                    <button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                  </div>
                </div>
                <button className="mp-remove-button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
          <aside className="mp-cart-summary">
            <p className="mp-eyebrow">YOUR ORDER SUMMARY</p>
            <h3>A little heritage, just for you.</h3>
            <div><span>Items ({cartCount})</span><strong>{money(cartTotal)}</strong></div>
            <div><span>Delivery</span><strong>Calculated at checkout</strong></div>
            <div className="mp-summary-total"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div>
            <button className="mp-primary-button mp-full-button" onClick={() => showNotice("Checkout will be available when payments are connected.")}>
              Proceed to checkout <ArrowRight size={16} />
            </button>
            <button className="mp-text-button mp-center-button" onClick={onBack}>
              Continue exploring
            </button>
          </aside>
        </div>
      ) : (
        <EmptyState icon={ShoppingCart} title="Your cart is waiting" description="Find something handcrafted that feels like it belongs to you." action={<button className="mp-primary-button" onClick={onBack}>Discover crafts <ArrowRight size={16} /></button>} />
      )}
    </section>
  );

  const renderWishlist = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="SAVED WITH LOVE"
        title="Your wishlist"
        description="A little collection of things that caught your eye."
      />
      {wishlist.length ? (
        <div className="mp-product-grid">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              saved
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Heart} title="Save what you love" description="Tap the heart on any craft to keep it close for later." action={<button className="mp-primary-button" onClick={onBack}>Find your favourites</button>} />
      )}
    </section>
  );

  const renderAddresses = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="A LITTLE CLOSER TO HOME"
        title="Delivery addresses"
        description="Keep your favourite delivery destinations close at hand."
        action={<button className="mp-primary-button" onClick={() => openAddressForm()}><Plus size={16} /> Add address</button>}
      />

      {showAddressForm && (
        <form className="mp-address-form mp-form" onSubmit={saveAddress}>
          <h3>{editingAddressId ? "Edit address" : "Add a new address"}</h3>
          <div className="mp-form-grid">
            <label>Address label<input required maxLength={30} value={addressDraft.name} onChange={(e) => setAddressDraft({ ...addressDraft, name: e.target.value })} placeholder="Home, Work, etc." /></label>
            <label>Recipient name<input required maxLength={80} value={addressDraft.recipient} onChange={(e) => setAddressDraft({ ...addressDraft, recipient: e.target.value })} placeholder="Full name" /></label>
            <label>Phone number<input required type="tel" maxLength={20} value={addressDraft.phone} onChange={(e) => setAddressDraft({ ...addressDraft, phone: e.target.value })} placeholder="Contact number" /></label>
            <label>Street address<input required maxLength={160} value={addressDraft.line} onChange={(e) => setAddressDraft({ ...addressDraft, line: e.target.value })} placeholder="House number, street, area" /></label>
            <label>City<input required maxLength={60} value={addressDraft.city} onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })} placeholder="City" /></label>
            <label>State<input required maxLength={60} value={addressDraft.state} onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })} placeholder="State" /></label>
            <label>PIN code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={addressDraft.pincode} onChange={(e) => setAddressDraft({ ...addressDraft, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="6-digit PIN code" /></label>
          </div>
          <label className="mp-checkbox-label">
            <input type="checkbox" checked={addressDraft.isDefault} onChange={(e) => setAddressDraft({ ...addressDraft, isDefault: e.target.checked })} />
            Set as default delivery address
          </label>
          <div className="mp-form-actions">
            <button type="button" className="mp-outline-button" onClick={() => setShowAddressForm(false)}>Cancel</button>
            <button className="mp-primary-button" type="submit"><Check size={16} /> Save address</button>
          </div>
        </form>
      )}

      {addresses.length ? (
        <div className="mp-address-grid">
          {addresses.map((address) => (
            <article className={`mp-address-card ${address.isDefault ? "is-default" : ""}`} key={address.id}>
              <div className="mp-address-card-head">
                <span className="mp-address-icon"><MapPin size={19} /></span>
                <div><h3>{address.name}</h3>{address.isDefault && <span className="mp-default-tag">DEFAULT</span>}</div>
                <button className="mp-icon-button" onClick={() => openAddressForm(address)} aria-label="Edit address"><Settings size={16} /></button>
              </div>
              <p><strong>{address.recipient}</strong></p>
              <p>{address.line}</p>
              <p>{address.city}, {address.state} — {address.pincode}</p>
              <p>{address.phone}</p>
              <div className="mp-address-actions">
                {!address.isDefault && <button className="mp-small-link" onClick={() => setDefaultAddress(address.id)}>Set as default</button>}
                <button className="mp-small-link mp-danger-link" onClick={() => deleteAddress(address.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add a delivery address to make future checkout easier." action={<button className="mp-primary-button" onClick={() => openAddressForm()}><Plus size={16} /> Add your first address</button>} />
      )}
    </section>
  );

  const renderRecent = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="PICK UP WHERE YOU LEFT OFF"
        title="Recently viewed"
        description="The crafts and creations you've been exploring."
      />
      {recentlyViewed.length ? (
        <div className="mp-product-grid">
          {recentlyViewed.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} saved={wishlist.some((item) => item.id === product.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Clock3} title="Your next discovery awaits" description="Explore the collection to find something wonderful." action={<button className="mp-primary-button" onClick={onBack}>Explore crafts</button>} />
      )}
    </section>
  );

  const renderSettings = () => (
    <section className="mp-panel">
      <SectionHeading
        eyebrow="YOUR ACCOUNT, YOUR WAY"
        title="Account settings"
        description="Fine-tune your experience with VIRSA."
      />

      <div className="mp-settings-group">
        <div className="mp-settings-heading"><Bell size={19} /><div><h3>Notifications</h3><p>Choose the updates you would like to receive.</p></div></div>
        {[
          { id: "orderUpdates", title: "Order updates", desc: "Shipping and delivery updates." },
          { id: "offers", title: "Special offers", desc: "Offers, discounts and seasonal collections." },
          { id: "craftStories", title: "Artisan stories", desc: "Discover the people and traditions behind each craft." },
        ].map((item) => (
          <label className="mp-toggle-row" key={item.id}>
            <span><strong>{item.title}</strong><small>{item.desc}</small></span>
            <input
              type="checkbox"
              checked={notifications[item.id]}
              onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
            />
          </label>
        ))}
      </div>

      <div className="mp-settings-group">
        <div className="mp-settings-heading"><ShieldCheck size={19} /><div><h3>Privacy & security</h3><p>Your account protection settings.</p></div></div>
        <button className="mp-settings-link" onClick={() => showNotice("Connect authentication to enable password changes.")}>
          <span><strong>Change password</strong><small>Manage your sign-in credentials</small></span><ChevronRight size={18} />
        </button>
        <button className="mp-settings-link" onClick={() => showNotice("Your privacy policy can be linked here.")}>
          <span><strong>Privacy policy</strong><small>Learn how your information is handled</small></span><ChevronRight size={18} />
        </button>
      </div>

      <div className="mp-signout-box">
        <div><h3>Until next time</h3><p>Ready to leave your VIRSA account?</p></div>
        <button className="mp-outline-button mp-signout-button" onClick={handleSignOut}><LogOut size={16} /> Sign out</button>
      </div>

      <p className="mp-disclaimer">Settings on this screen are a frontend prototype. Password and privacy actions need to be connected to your authentication system.</p>
    </section>
  );

  const contentBySection = {
    overview: renderOverview,
    profile: renderProfile,
    orders: renderOrders,
    cart: renderCart,
    wishlist: renderWishlist,
    addresses: renderAddresses,
    recent: renderRecent,
    settings: renderSettings,
  };

  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <div className="mp-page">
      <header className="mp-topbar">
        <button className="mp-back-button" onClick={onBack}>
          <ArrowLeft size={17} /> <span>Back to VIRSA</span>
        </button>
        <button className="mp-brand" onClick={onBack} aria-label="Return to VIRSA home">
          <span className="mp-brand-mark">✦</span>
          <span>VIRSA<small>WHERE HERITAGE FINDS A HOME</small></span>
        </button>
        <div className="mp-topbar-right">
          <button className="mp-top-icon" onClick={() => navigateTo("cart")} aria-label="Open cart">
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className="mp-cart-badge">{cartCount}</span>}
          </button>
          <button className="mp-top-avatar" onClick={() => navigateTo("profile")} aria-label="Open personal profile">
            {avatar ? <img src={avatar} alt="" /> : initials}
          </button>
        </div>
      </header>

      <div className="mp-page-intro">
        <div>
          <p className="mp-breadcrumb">HOME <ChevronRight size={12} /> MY ACCOUNT</p>
          <h1>My <em>Profile</em></h1>
          <p className="mp-intro-subtitle">Your space. Your stories. Your heritage.</p>
        </div>
        <div className="mp-intro-ornament" aria-hidden="true">❧</div>
      </div>

      <div className="mp-layout">
        <aside className={`mp-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
          <div className="mp-sidebar-profile">
            <div className="mp-sidebar-avatar">
              {avatar ? <img src={avatar} alt="" /> : initials}
              <span className="mp-online-dot" />
            </div>
            <div className="mp-sidebar-name">{profile.name || "Your Name"}</div>
            <div className="mp-sidebar-email">{profile.email || "Welcome to VIRSA"}</div>
            <span className="mp-member-pill"><Sparkles size={12} /> HERITAGE EXPLORER</span>
          </div>

          <p className="mp-nav-label">YOUR ACCOUNT</p>
          <nav className="mp-side-nav" aria-label="Profile navigation">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`mp-nav-item ${activeSection === id ? "is-active" : ""}`}
                onClick={() => navigateTo(id)}
              >
                <Icon size={18} strokeWidth={1.7} />
                <span>{label}</span>
                {id === "cart" && cartCount > 0 && <span className="mp-nav-count">{cartCount}</span>}
                {id === "wishlist" && wishlist.length > 0 && <span className="mp-nav-count">{wishlist.length}</span>}
                {activeSection === id && <ChevronRight className="mp-nav-chevron" size={16} />}
              </button>
            ))}
          </nav>

          <div className="mp-sidebar-note">
            <span className="mp-sidebar-note-icon">✧</span>
            <p>Every purchase helps keep a beautiful tradition alive.</p>
          </div>

          <button className="mp-sidebar-back" onClick={onBack}>
            <ArrowLeft size={16} /> Return to marketplace
          </button>
        </aside>

        <main className="mp-main">
          <div className="mp-mobile-nav">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={18} /> {activeItem?.label || "My Account"} <ChevronDown size={16} />
            </button>
          </div>

          <div className="mp-main-heading">
            <div>
              <p className="mp-eyebrow">NAMASTE, {firstName.toUpperCase()}</p>
              <h2>{activeItem?.label || "My Profile"}</h2>
            </div>
            <div className="mp-search-wrap">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a treasure..."
                aria-label="Search crafts"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Clear search"><X size={15} /></button>}
            </div>
          </div>

          {searchQuery ? (
            <section className="mp-panel">
              <SectionHeading eyebrow="DISCOVER SOMETHING LOVELY" title="Search results" description={`Matching crafts for “${searchQuery}”.`} />
              {filteredProducts.length ? (
                <div className="mp-product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} saved={wishlist.some((item) => item.id === product.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Search} title="No crafts found" description="Try searching for pottery, Phulkari or brassware." action={<button className="mp-outline-button" onClick={() => setSearchQuery("")}>Clear search</button>} />
              )}
            </section>
          ) : (
            (contentBySection[activeSection] || renderOverview)()
          )}

          <footer className="mp-footer">
            <span>✦</span> Made with care, rooted in heritage.
            <span className="mp-footer-right">VIRSA © 2026</span>
          </footer>
        </main>
      </div>

      {notice && (
        <div className="mp-toast" role="status">
          <span className="mp-toast-check"><Check size={15} /></span>
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}
