
import { useMemo, useState } from "react";
import "./product.css";

const products = [
  {
    id: "phulkari-001",
    name: "Traditional Phulkari Dupatta",
    subtitle: "A celebration of Punjab's vibrant embroidery heritage.",
    category: "Phulkari",
    state: "Punjab",
    price: 2499,
    originalPrice: 3299,
    discount: "24% OFF",
    stock: 12,
    rating: 4.8,
    reviewCount: 124,
    material: "Cotton blend",
    colour: "Multicolour",
    dimensions: "Handcrafted; dimensions vary",
    craft: "Traditional Phulkari embroidery",
    description:
      "A colourful embroidered textile inspired by Punjab's rich craft traditions. Each piece celebrates the skill and creativity of its maker.",
    story:
      "Phulkari is a traditional embroidery craft associated with Punjab. Its vibrant patterns and careful stitching reflect generations of textile artistry. This product celebrates that heritage through its colours and handcrafted details.",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=85",
    ],
    artisan: "Local Craft Community",
    artisanLocation: "Punjab, India",
  },
  {
    id: "blue-pottery-001",
    name: "Jaipur Blue Pottery Bowl",
    subtitle: "Artful ceramic-inspired decor with traditional blue patterns.",
    category: "Blue Pottery",
    state: "Rajasthan",
    price: 1599,
    originalPrice: 1999,
    discount: "20% OFF",
    stock: 8,
    rating: 4.7,
    reviewCount: 86,
    material: "Pottery material; verify with seller",
    colour: "Blue and white",
    dimensions: "See seller specifications",
    craft: "Blue pottery",
    description:
      "A decorative piece inspired by Rajasthan's distinctive blue pottery tradition. A thoughtful choice for a handcrafted home collection.",
    story:
      "Rajasthan's blue pottery is known for its distinctive blue-and-white designs. This listing celebrates the visual character of the craft. Confirm the production technique and material with the seller before describing it as authentic handmade pottery.",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=85",
    ],
    artisan: "Regional Pottery Artisan",
    artisanLocation: "Rajasthan, India",
  },
  {
    id: "pashmina-001",
    name: "Classic Pashmina-Style Shawl",
    subtitle: "An elegant textile inspired by Kashmir's weaving heritage.",
    category: "Pashmina",
    state: "Jammu and Kashmir",
    price: 4999,
    originalPrice: 6499,
    discount: "23% OFF",
    stock: 5,
    rating: 4.9,
    reviewCount: 97,
    material: "Confirm fibre composition with seller",
    colour: "Ivory",
    dimensions: "See seller specifications",
    craft: "Traditional shawl weaving",
    description:
      "A refined shawl listing inspired by the timeless appeal of Kashmiri textiles. Check the seller's material and authenticity information before purchase.",
    story:
      "Kashmir has a rich tradition of fine shawls and textile craftsmanship. Genuine pashmina requires reliable information about its fibre and provenance, so the seller should provide supporting details before authenticity claims are made.",
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85",
    ],
    artisan: "Regional Textile Artisan",
    artisanLocation: "Jammu and Kashmir, India",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function Icon({ name, size = 19 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    cart: (
      <>
        <path d="M3 3h2l2.5 12h10L20 7H6" />
        <circle cx="9" cy="19" r="1.3" />
        <circle cx="17" cy="19" r="1.3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 4v3h-7" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    zoom: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5M10.5 7v7M7 10.5h7" />
      </>
    ),
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    leaf: (
      <>
        <path d="M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-6 10-16Z" />
        <path d="M4 21c3-6 7-9 12-12" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.check}</svg>;
}

function ProductStars({ rating }) {
  return (
    <span className="product-rating-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function Product({
  initialProduct,
  initialQuantity = 1,
  onBackToState,
  onBackToHome,
  onBuyNow,
}) {
  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id || products[0].id
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity));
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("Standard");
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryError, setDeliveryError] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("description");
  const [toast, setToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  const product = useMemo(
    () => {
      const catalogProduct = products.find((item) => item.id === selectedProductId);
      if (catalogProduct) return catalogProduct;
      if (!initialProduct) return products[0];

      const price = Number(initialProduct.price ?? initialProduct.unitPriceCents / 100) || 0;
      const images = initialProduct.images?.length
        ? initialProduct.images
        : [initialProduct.image || products[0].images[0]];

      return {
        ...products[0],
        ...initialProduct,
        id: selectedProductId,
        price,
        originalPrice: initialProduct.originalPrice ?? price,
        discount: initialProduct.discount || "",
        stock: initialProduct.stock ?? 99,
        stockKnown: initialProduct.stock != null,
        rating: initialProduct.rating ?? 0,
        reviewCount: initialProduct.reviewCount ?? 0,
        subtitle: initialProduct.subtitle || initialProduct.description || "",
        description: initialProduct.description || initialProduct.subtitle || "",
        craft: initialProduct.craft || initialProduct.category || "Handcrafted tradition",
        category: initialProduct.category || initialProduct.craft || "Handcrafted craft",
        state: initialProduct.state || initialProduct.origin || "India",
        artisan: initialProduct.artisan || initialProduct.storeName || "VIRSA artisan",
        artisanLocation: initialProduct.artisanLocation || initialProduct.state || initialProduct.origin || "India",
        images,
      };
    },
    [selectedProductId, initialProduct]
  );

  const isWishlisted = wishlist.includes(product.id);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => setToast(""), 2800);
  };

  const handleBack = () => {
    if (onBackToState) {
      onBackToState();
      return;
    }

    if (onBackToHome) {
      onBackToHome();
      return;
    }

    window.history.back();
  };

  const selectProduct = (nextProduct) => {
    setSelectedProductId(nextProduct.id);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedVariant("Standard");
    setPincode("");
    setDeliveryMessage("");
    setDeliveryError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeImage = (direction) => {
    setSelectedImage(
      (current) =>
        (current + direction + product.images.length) % product.images.length
    );
  };

  const addToCart = (item, amount = quantity) => {
    if (item.stockKnown !== false && item.stock < 1) {
      showToast("Sorry, this product is currently out of stock.");
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find((entry) => entry.id === item.id);

      if (existing) {
        return previousCart.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: Math.min(entry.quantity + amount, item.stockKnown === false ? 99 : item.stock),
              }
            : entry
        );
      }

      return [
        ...previousCart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.images[0],
          quantity: Math.min(amount, item.stockKnown === false ? 99 : item.stock),
        },
      ];
    });

    showToast(`${item.name} added to your cart.`);
  };

  const toggleWishlist = (item) => {
    setWishlist((previous) =>
      previous.includes(item.id)
        ? previous.filter((id) => id !== item.id)
        : [...previous, item.id]
    );

    showToast(
      isWishlisted
        ? "Removed from your wishlist."
        : "Added to your wishlist."
    );
  };

  const buyNow = () => {
    if (product.stockKnown !== false && product.stock < 1) {
      showToast("This product is currently out of stock.");
      return;
    }

    if (onBuyNow) {
      onBuyNow(product, quantity);
      return;
    }

    showToast("Checkout is unavailable until the marketplace integration is loaded.");
  };

  const checkDelivery = (event) => {
    event.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setDeliveryError(true);
      setDeliveryMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setDeliveryError(false);
    setDeliveryMessage(
      `PIN code ${pincode} entered. Live delivery estimates need a shipping API connection.`
    );
  };

  const visibleRelatedProducts = products.filter(
    (item) =>
      item.id !== product.id &&
      `${item.name} ${item.category} ${item.state}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const accordionItems = [
    {
      id: "description",
      title: "Product Description",
      content: product.description,
    },
    {
      id: "heritage",
      title: "Craft & Cultural Heritage",
      content: product.story,
    },
    {
      id: "specifications",
      title: "Product Specifications",
      content: (
        <table className="product-specifications">
          <tbody>
            <tr>
              <th>Craft</th>
              <td>{product.craft}</td>
            </tr>
            <tr>
              <th>Region</th>
              <td>{product.state}, India</td>
            </tr>
            <tr>
              <th>Material</th>
              <td>{product.material}</td>
            </tr>
            <tr>
              <th>Colour</th>
              <td>{product.colour}</td>
            </tr>
            <tr>
              <th>Dimensions</th>
              <td>{product.dimensions}</td>
            </tr>
            <tr>
              <th>Product ID</th>
              <td>{product.id}</td>
            </tr>
          </tbody>
        </table>
      ),
    },
    {
      id: "care",
      title: "Care Instructions",
      content:
        "Follow the care label and the seller's instructions. Confirm suitable cleaning and storage methods for the specific material before use.",
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content:
        "Delivery times, shipping fees, and return eligibility must be confirmed using your marketplace's actual shipping and return policies.",
    },
  ];

  return (
    <div className="product-page">
      <div className="product-announcement">
        CELEBRATING INDIA'S CRAFT HERITAGE · DISCOVER HANDCRAFTED TREASURES
      </div>

      <header className="product-header">
        <div className="product-container product-header-inner">
          <a
            className="product-brand"
            href="/"
            aria-label="VIRSA home"
          >
            <span className="product-brand-mark">V</span>
            <span>
              <span className="product-brand-name">VIRSA</span>
              <span className="product-brand-caption">
                THE ART OF INDIAN HERITAGE
              </span>
            </span>
          </a>

          <label className="product-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              placeholder="Search crafts, regions and products..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search related products"
            />
          </label>

          <div className="product-header-actions">
            <button
              className="product-header-action"
              type="button"
              onClick={() => showToast("Connect this button to your account page.")}
              aria-label="My account"
            >
              <Icon name="user" />
              <span className="product-header-action-label">Account</span>
            </button>

            <button
              className="product-header-action"
              type="button"
              onClick={() => showToast(`You have ${wishlist.length} wishlist item(s).`)}
              aria-label="Wishlist"
            >
              <Icon name="heart" />
              <span className="product-header-action-label">Wishlist</span>
            </button>

            <button
              className="product-header-action"
              type="button"
              onClick={() =>
                showToast(
                  cart.length
                    ? `Your cart has ${cartCount} item(s), total ${formatPrice(
                        cart.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                      )}.`
                    : "Your cart is empty."
                )
              }
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <Icon name="cart" />
              <span className="product-header-action-label">Cart</span>
              <span className="product-cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="product-container">
          <nav className="product-breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="product-back-link" onClick={handleBack}>
              ← Back to {onBackToState ? "state" : "marketplace"}
            </button>
            <span className="product-breadcrumb-separator">/</span>
            <a href="/">Home</a>
            <span className="product-breadcrumb-separator">/</span>
            <a href="/">Handicrafts</a>
            <span className="product-breadcrumb-separator">/</span>
            <a href="/">{product.state}</a>
            <span className="product-breadcrumb-separator">/</span>
            <span className="product-breadcrumb-current">{product.category}</span>
          </nav>

          <section className="product-main-grid">
            <div className="product-gallery">
              <div className="product-main-image-wrap">
                <span className="product-image-badge">CRAFTED WITH CARE</span>

                <img
                  className="product-main-image"
                  src={product.images[selectedImage]}
                  alt={`${product.name} - image ${selectedImage + 1}`}
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://placehold.co/800x900/f1e6d7/681f31?text=VIRSA+Handicraft";
                  }}
                />

                <button
                  className="product-image-zoom"
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="View larger product image"
                >
                  <Icon name="zoom" />
                </button>

                <button
                  className="product-image-zoom"
                  style={{ right: 60 }}
                  type="button"
                  onClick={() => changeImage(-1)}
                  aria-label="Previous image"
                >
                  <Icon name="left" />
                </button>

                <button
                  className="product-image-zoom"
                  style={{ right: 105 }}
                  type="button"
                  onClick={() => changeImage(1)}
                  aria-label="Next image"
                >
                  <Icon name="right" />
                </button>
              </div>

              <div className="product-thumbnail-list">
                {product.images.map((image, index) => (
                  <button
                    className={`product-thumbnail ${
                      selectedImage === index ? "is-active" : ""
                    }`}
                    key={`${product.id}-image-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/300x300/f1e6d7/681f31?text=VIRSA";
                      }}
                    />
                  </button>
                ))}
              </div>

              <p className="product-gallery-caption">
                Images are illustrative until replaced with verified product
                photographs from your marketplace inventory.
              </p>
            </div>

            <div className="product-info">
              <span className="product-eyebrow">
                {product.state} · {product.category}
              </span>

              <h1 className="product-title">{product.name}</h1>
              <p className="product-subtitle">{product.subtitle}</p>

              <div className="product-rating-row">
                <ProductStars rating={product.rating} />
                <span className="product-rating-text">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
                <a className="product-rating-link" href="#product-reviews">
                  Read reviews
                </a>
              </div>

              <div className="product-price-row">
                <span className="product-price">{formatPrice(product.price)}</span>
                <span className="product-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="product-discount">{product.discount}</span>
              </div>

              <p className="product-tax-note">
                Example demo price. Final taxes and shipping depend on checkout.
              </p>

              <div className="product-stock-status">
                <span className="product-stock-dot" />
                {product.stockKnown === false
                  ? "Availability has not been confirmed"
                  : product.stock > 0
                    ? `In stock · ${product.stock} available in demo inventory`
                    : "Currently out of stock"}
              </div>

              <hr className="product-divider" />

              <div className="product-option-group">
                <span className="product-option-label">
                  Craft <span>{product.category}</span>
                </span>

                <div className="product-variant-list">
                  <button
                    className="product-variant-button is-selected"
                    type="button"
                  >
                    {product.category}
                  </button>
                </div>
              </div>

              <div className="product-option-group">
                <span className="product-option-label">
                  Selection <span>{selectedVariant}</span>
                </span>

                <div className="product-variant-list">
                  {["Standard", "Gift option"].map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      className={`product-variant-button ${
                        selectedVariant === variant ? "is-selected" : ""
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
                <p className="product-tax-note">
                  Gift selection is a demo option until supported by the backend.
                </p>
              </div>

              <div className="product-option-group">
                <label className="product-purchase-label">Quantity</label>
                <div className="product-quantity-row">
                  <button
                    className="product-quantity-button"
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <Icon name="minus" size={15} />
                  </button>

                  <span className="product-quantity-value">{quantity}</span>

                  <button
                    className="product-quantity-button"
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(product.stockKnown === false ? 99 : product.stock, value + 1)
                      )
                    }
                    aria-label="Increase quantity"
                    disabled={product.stockKnown !== false && quantity >= product.stock}
                  >
                    <Icon name="plus" size={15} />
                  </button>
                </div>
              </div>

              <div className="product-purchase-actions">
                <button
                  className="product-button product-button-primary"
                  type="button"
                  disabled={product.stockKnown !== false && product.stock < 1}
                  onClick={() => addToCart(product)}
                >
                  <Icon name="cart" size={17} />
                  Add to Cart
                </button>

                <button
                  className="product-button product-button-gold"
                  type="button"
                  disabled={product.stockKnown !== false && product.stock < 1}
                  onClick={buyNow}
                >
                  Buy Now
                  <Icon name="arrow" size={16} />
                </button>
              </div>

              <button
                className={`product-wishlist-button ${
                  isWishlisted ? "is-active" : ""
                }`}
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={isWishlisted}
              >
                <Icon name="heart" size={17} />
                {isWishlisted
                  ? "Added to Wishlist"
                  : "Add to Wishlist"}
              </button>

              <div className="product-delivery-box">
                <div className="product-delivery-heading">
                  <span className="product-delivery-heading-icon">
                    <Icon name="truck" size={21} />
                  </span>
                  Check delivery availability
                </div>

                <form className="product-pincode-form" onSubmit={checkDelivery}>
                  <input
                    className="product-pincode-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(event) =>
                      setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    aria-label="Delivery PIN code"
                  />

                  <button className="product-pincode-button" type="submit">
                    Check
                  </button>
                </form>

                {deliveryMessage && (
                  <p
                    className={`product-delivery-result ${
                      deliveryError ? "is-error" : ""
                    }`}
                    role="status"
                  >
                    {deliveryMessage}
                  </p>
                )}

                <div className="product-delivery-features">
                  <div className="product-delivery-feature">
                    <span className="product-delivery-feature-icon">
                      <Icon name="truck" size={18} />
                    </span>
                    <span>
                      <strong>Shipping information</strong>
                      <br />
                      Final delivery estimate will come from the shipping
                      service connected to VIRSA.
                    </span>
                  </div>

                  <div className="product-delivery-feature">
                    <span className="product-delivery-feature-icon">
                      <Icon name="shield" size={18} />
                    </span>
                    <span>
                      <strong>Secure checkout</strong>
                      <br />
                      Payment protection depends on the integrated payment
                      provider and checkout flow.
                    </span>
                  </div>

                  <div className="product-delivery-feature">
                    <span className="product-delivery-feature-icon">
                      <Icon name="leaf" size={18} />
                    </span>
                    <span>
                      <strong>Celebrating craft heritage</strong>
                      <br />
                      Explore regional crafts and their cultural stories.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="product-trust-strip">
            <div className="product-trust-item">
              <span className="product-trust-icon">
                <Icon name="leaf" />
              </span>
              <span>
                <strong>Regional Craft Heritage</strong>
                <small>Discover India's diverse traditions</small>
              </span>
            </div>

            <div className="product-trust-item">
              <span className="product-trust-icon">
                <Icon name="shield" />
              </span>
              <span>
                <strong>Transparent Information</strong>
                <small>Check material and origin details</small>
              </span>
            </div>

            <div className="product-trust-item">
              <span className="product-trust-icon">
                <Icon name="truck" />
              </span>
              <span>
                <strong>Delivery Details</strong>
                <small>View shipping terms at checkout</small>
              </span>
            </div>
          </section>
        </div>

        <section className="product-details-section">
          <div className="product-container">
            <div className="product-section-heading">
              <span className="product-eyebrow">Know the Craft</span>
              <h2 className="product-section-title">
                More Than Just a Product
              </h2>
              <p className="product-section-description">
                Explore the details, techniques and heritage behind the
                handicraft you are discovering.
              </p>
            </div>

            <div className="product-details-layout">
              <div className="product-accordion-list">
                {accordionItems.map((item) => {
                  const isOpen = activeAccordion === item.id;

                  return (
                    <div className="product-accordion" key={item.id}>
                      <button
                        className="product-accordion-trigger"
                        type="button"
                        onClick={() =>
                          setActiveAccordion(isOpen ? "" : item.id)
                        }
                        aria-expanded={isOpen}
                      >
                        {item.title}
                        <span className="product-accordion-symbol">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="product-accordion-content">
                          {typeof item.content === "string" ? (
                            <p>{item.content}</p>
                          ) : (
                            item.content
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <span className="product-eyebrow">Product at a Glance</span>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--product-dark)",
                    fontSize: 25,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  Details That Matter
                </h3>

                <table className="product-specifications">
                  <tbody>
                    <tr>
                      <th>Product</th>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <th>Craft</th>
                      <td>{product.category}</td>
                    </tr>
                    <tr>
                      <th>Region</th>
                      <td>{product.state}</td>
                    </tr>
                    <tr>
                      <th>Material</th>
                      <td>{product.material}</td>
                    </tr>
                    <tr>
                      <th>Colour</th>
                      <td>{product.colour}</td>
                    </tr>
                    <tr>
                      <th>Price</th>
                      <td>{formatPrice(product.price)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="product-artisan-section">
          <div className="product-container product-artisan-grid">
            <div className="product-artisan-image-wrap">
              <img
                className="product-artisan-image"
                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85"
                alt="Artisan workspace"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/700x800/f0e2cf/681f31?text=Craft+Heritage";
                }}
              />
            </div>

            <div className="product-artisan-copy">
              <span className="product-eyebrow">
                Stories Behind the Craft
              </span>
              <h2>Tradition Woven Into Every Detail</h2>
              <p>{product.story}</p>
              <p>
                VIRSA aims to connect customers with India's regional craft
                traditions and the people who preserve them. Verified artisan
                profiles can be added as seller information becomes available.
              </p>

              <span className="product-artisan-location">
                <Icon name="pin" size={17} />
                {product.artisanLocation}
              </span>

              <br />

              <button
                className="product-artisan-link"
                type="button"
                onClick={() =>
                  showToast(
                    "Connect this section to the verified artisan profile page."
                  )
                }
              >
                Discover the artisan <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </section>

        <section className="product-reviews-section" id="product-reviews">
          <div className="product-container">
            <div className="product-section-heading">
              <span className="product-eyebrow">Customer Feedback</span>
              <h2 className="product-section-title">Ratings & Reviews</h2>
              <p className="product-section-description">
                Customer review information will be displayed here once
                verified review data is connected.
              </p>
            </div>

            <div className="product-reviews-summary">
              <div className="product-reviews-score">
                <span className="product-reviews-number">
                  {product.rating.toFixed(1)}
                </span>
                <ProductStars rating={product.rating} />
                <span className="product-reviews-count">
                  Demo rating · {product.reviewCount} sample reviews
                </span>
              </div>

              <div className="product-rating-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div className="product-rating-bar-row" key={stars}>
                    <span>{stars} star</span>
                    <div className="product-rating-bar">
                      <span
                        style={{
                          width:
                            stars === 5
                              ? "82%"
                              : stars === 4
                              ? "65%"
                              : stars === 3
                              ? "25%"
                              : "8%",
                        }}
                      />
                    </div>
                    <span>
                      {stars === 5
                        ? "82%"
                        : stars === 4
                        ? "65%"
                        : stars === 3
                        ? "25%"
                        : "8%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-review-list">
              <article className="product-review-card">
                <div className="product-review-header">
                  <div>
                    <div className="product-review-name">
                      Sample customer review
                    </div>
                    <div className="product-review-verified">
                      <Icon name="check" size={12} />
                      Demo content — not a verified purchase
                    </div>
                  </div>
                  <span className="product-review-date">Sample</span>
                </div>
                <ProductStars rating={5} />
                <p>
                  This is placeholder review content for the page layout.
                  Replace it with genuine customer feedback when available.
                </p>
              </article>

              <article className="product-review-card">
                <div className="product-review-header">
                  <div>
                    <div className="product-review-name">
                      Sample customer review
                    </div>
                    <div className="product-review-verified">
                      <Icon name="check" size={12} />
                      Demo content — not a verified purchase
                    </div>
                  </div>
                  <span className="product-review-date">Sample</span>
                </div>
                <ProductStars rating={4} />
                <p>
                  This sample card demonstrates where product feedback and
                  review details can appear after the reviews feature is
                  connected.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="product-related-section">
          <div className="product-container">
            <div className="product-section-heading">
              <span className="product-eyebrow">Continue Exploring</span>
              <h2 className="product-section-title">Discover More Crafts</h2>
              <p className="product-section-description">
                Explore other regional handicrafts from across India.
              </p>
            </div>

            {visibleRelatedProducts.length > 0 ? (
              <div className="product-related-grid">
                {visibleRelatedProducts.map((item) => (
                  <article className="product-card" key={item.id}>
                    <div className="product-card-image-wrap">
                      <img
                        className="product-card-image"
                        src={item.images[0]}
                        alt={item.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://placehold.co/500x600/f1e6d7/681f31?text=VIRSA";
                        }}
                      />

                      <button
                        className="product-card-wishlist"
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        aria-label={`Add ${item.name} to wishlist`}
                      >
                        <Icon name="heart" size={17} />
                      </button>
                    </div>

                    <div className="product-card-body">
                      <span className="product-card-category">
                        {item.state}
                      </span>
                      <h3 className="product-card-title">{item.name}</h3>

                      <div className="product-card-rating">
                        <ProductStars rating={item.rating} />
                        <span style={{ color: "var(--product-muted)" }}>
                          {" "}
                          ({item.reviewCount})
                        </span>
                      </div>

                      <div className="product-card-price">
                        {formatPrice(item.price)}
                      </div>

                      <button
                        className="product-card-add"
                        type="button"
                        onClick={() => selectProduct(item)}
                      >
                        VIEW PRODUCT
                      </button>

                      <button
                        className="product-card-add"
                        type="button"
                        onClick={() => addToCart(item, 1)}
                      >
                        <Icon name="cart" size={13} /> ADD TO CART
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "var(--product-muted)" }}>
                No matching related products found.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="product-footer">
        <div className="product-container">
          <div className="product-footer-main">
            <div>
              <div className="product-footer-brand">VIRSA</div>
              <p className="product-footer-description">
                A celebration of India's diverse handicrafts, regional
                identities and cultural heritage.
              </p>
            </div>

            <div>
              <h3 className="product-footer-heading">EXPLORE</h3>
              <div className="product-footer-links">
                <a href="/">All Handicrafts</a>
                <a href="/">Explore by State</a>
                <a href="/">Featured Crafts</a>
              </div>
            </div>

            <div>
              <h3 className="product-footer-heading">HELP</h3>
              <div className="product-footer-links">
                <a href="/">Contact Us</a>
                <a href="/">Shipping Policy</a>
                <a href="/">Returns Policy</a>
              </div>
            </div>

            <div>
              <h3 className="product-footer-heading">VIRSA</h3>
              <div className="product-footer-links">
                <a href="/">About Us</a>
                <a href="/">Our Mission</a>
                <a href="/">Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="product-footer-bottom">
            <span>© {new Date().getFullYear()} VIRSA. All rights reserved.</span>
            <span>Celebrating India's Craft Heritage</span>
          </div>
        </div>
      </footer>

      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          onClick={() => setZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "#1d1015eF",
          }}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close enlarged image"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "grid",
              placeItems: "center",
              width: 42,
              height: 42,
              border: "1px solid #ffffff55",
              borderRadius: "50%",
              background: "transparent",
              color: "white",
            }}
          >
            <Icon name="close" size={22} />
          </button>

          <img
            src={product.images[selectedImage]}
            alt={product.name}
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth: "min(900px, 95vw)",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 5,
            }}
          />
        </div>
      )}

      {toast && (
        <div className="product-toast" role="status">
          <span className="product-toast-icon">
            <Icon name="check" size={19} />
          </span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
