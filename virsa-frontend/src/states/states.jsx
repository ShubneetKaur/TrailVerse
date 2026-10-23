
import React, { useEffect, useMemo, useState } from "react";
import phulkariStoreImage from "../assets/phulkari-store.jpeg";
import "./states.css";

// Images and sample product data are demo content.
// Replace with backend API data when it becomes available.

const STATES = [
  {
    name: "Andhra Pradesh",
    craft: "Kalamkari and Kondapalli toys",
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Arunachal Pradesh",
    craft: "Tribal weaving and bamboo crafts",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Assam",
    craft: "Muga silk and bamboo crafts",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bihar",
    craft: "Madhubani painting",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Chhattisgarh",
    craft: "Dhokra metal craft",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Goa",
    craft: "Traditional pottery and shell craft",
    image:
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gujarat",
    craft: "Bandhani and embroidered textiles",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Haryana",
    craft: "Handwoven textiles and pottery",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Himachal Pradesh",
    craft: "Kullu shawls and traditional weaving",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Jharkhand",
    craft: "Sohrai painting and tribal art",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Karnataka",
    craft: "Mysore silk and sandalwood craft",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Kerala",
    craft: "Coir craft and traditional mural art",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Madhya Pradesh",
    craft: "Gond art and Chanderi textiles",
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Maharashtra",
    craft: "Warli art and Paithani textiles",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Manipur",
    craft: "Handloom textiles and bamboo craft",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Meghalaya",
    craft: "Bamboo and cane handicrafts",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Mizoram",
    craft: "Puan textiles and bamboo craft",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Nagaland",
    craft: "Traditional Naga weaving",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Odisha",
    craft: "Pattachitra and silver filigree",
    image:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Punjab",
    craft: "Phulkari embroidery",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Rajasthan",
    craft: "Blue pottery and block printing",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sikkim",
    craft: "Handwoven carpets and textiles",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tamil Nadu",
    craft: "Tanjore painting and bronze craft",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Telangana",
    craft: "Pochampally ikat and Cheriyal art",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tripura",
    craft: "Bamboo and cane handicrafts",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Uttar Pradesh",
    craft: "Chikankari and brassware",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Uttarakhand",
    craft: "Wool weaving and ringaal crafts",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "West Bengal",
    craft: "Terracotta and Kantha embroidery",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
];

const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const UT_CRAFTS = {
  "Andaman and Nicobar Islands": "Shell and coconut crafts",
  Chandigarh: "Regional art and handmade decor",
  "Dadra and Nagar Haveli and Daman and Diu":
    "Warli-inspired art and bamboo craft",
  Delhi: "Traditional crafts from across India",
  "Jammu and Kashmir": "Pashmina shawls and papier-mache",
  Ladakh: "Wool weaving and traditional crafts",
  Lakshadweep: "Coir and coconut crafts",
  Puducherry: "Handmade pottery and textile crafts",
};

// Demo products for the first working version.
// Later, replace these with products fetched from your backend.
const PRODUCTS = [
  {
    id: "punjab-phulkari",
    name: "Traditional Phulkari Dupatta",
    state: "Punjab",
    category: "Embroidered textile",
    price: 2499,
    badge: "Bestseller",
    badgeType: "bestseller",
    description:
      "A colourful Phulkari-inspired dupatta celebrating Punjabi embroidery.",
    image: phulkariStoreImage,
  },
  {
    id: "punjab-embroidered",
    name: "Punjabi Embroidered Craft",
    state: "Punjab",
    category: "Traditional craft",
    price: 1499,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "A decorative craft inspired by Punjab's rich textile heritage.",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rajasthan-blue-pottery",
    name: "Jaipur Blue Pottery Bowl",
    state: "Rajasthan",
    category: "Pottery",
    price: 1899,
    badge: "Bestseller",
    badgeType: "bestseller",
    description:
      "A decorative blue-pottery-inspired piece from Rajasthan's craft tradition.",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rajasthan-block-print",
    name: "Rajasthani Block Print Textile",
    state: "Rajasthan",
    category: "Textile",
    price: 1299,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "A textile design inspired by Rajasthan's block-printing heritage.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "himachal-shawl",
    name: "Himachali Woven Shawl",
    state: "Himachal Pradesh",
    category: "Woven textile",
    price: 3299,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "A shawl inspired by the traditional weaving of Himachal Pradesh.",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "maharashtra-warli",
    name: "Warli-Inspired Art",
    state: "Maharashtra",
    category: "Wall art",
    price: 1799,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "Artwork inspired by Maharashtra's distinctive Warli art tradition.",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "west-bengal-terracotta",
    name: "Terracotta Decorative Art",
    state: "West Bengal",
    category: "Terracotta",
    price: 999,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "A decorative piece inspired by Bengal's terracotta craft.",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "jammu-pashmina",
    name: "Kashmir-Inspired Shawl",
    state: "Jammu and Kashmir",
    category: "Woven textile",
    price: 3999,
    badge: "Popular Craft",
    badgeType: "popular",
    description: "A shawl inspired by Kashmir's renowned textile heritage.",
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function ArrowLeft() {
  return (
    <svg
      aria-hidden="true"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function StateCard({ state, onSelect }) {
  return (
    <button
      type="button"
      className="state-card"
      onClick={() => onSelect(state.name)}
      aria-label={`Explore handicrafts from ${state.name}`}
    >
      <div className="state-card-image-wrapper">
        <img
          className="state-card-image"
          src={state.image}
          alt={`${state.name} traditional handicrafts`}
          loading="lazy"
        />
      </div>

      <div className="state-card-content">
        <h2 className="state-card-name">{state.name}</h2>
        <p className="state-card-craft">{state.craft}</p>
        <span className="state-card-action">
          Explore crafts <ArrowRight />
        </span>
      </div>
    </button>
  );
}

function ProductCard({ product, onSelect }) {
  return (
    <button
      type="button"
      className="state-product-card"
      onClick={() => onSelect(product)}
      aria-label={`View ${product.name} details`}
    >
      <div className="state-product-image-wrapper">
        <img
          className="state-product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        {product.badge && (
          <span
            className={`state-product-badge ${
              product.badgeType === "bestseller"
                ? "state-product-badge--bestseller"
                : "state-product-badge--popular"
            }`}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="state-product-content">
        <h3 className="state-product-name">{product.name}</h3>
        <p className="state-product-artisan">
          {product.category} · {product.state}
        </p>

        <div className="state-product-bottom">
          <span className="state-product-price">
            {formatPrice(product.price)}
          </span>
          <span className="state-product-view">
            View details <ArrowRight />
          </span>
        </div>
      </div>
    </button>
  );
}

export default function States({ onProductSelect, initialState, onBackToHome }) {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState(initialState ?? null);

  useEffect(() => {
    setSelectedState(initialState ?? null);
  }, [initialState]);

  const allStates = useMemo(
    () => [
      ...STATES,
      ...UNION_TERRITORIES.map((name) => ({
        name,
        craft: UT_CRAFTS[name],
        image:
          "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=80",
      })),
    ],
    []
  );

  const filteredStates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return allStates;

    return allStates.filter(
      (state) =>
        state.name.toLowerCase().includes(query) ||
        state.craft.toLowerCase().includes(query)
    );
  }, [allStates, search]);

  const stateProducts = useMemo(
    () =>
      selectedState
        ? PRODUCTS.filter((product) => product.state === selectedState)
        : [],
    [selectedState]
  );

  function handleBackToAllStates() {
    if (onBackToHome) {
      onBackToHome();
      return;
    }

    setSelectedState(null);
  }

  function handleProductSelect(product) {
    // If the parent provides navigation, use it.
    if (onProductSelect) {
      onProductSelect(product);
      return;
    }

    // Fallback for standalone demo: pass product details in the URL.
    // Connect this to your actual product route when integrating the app.
    const params = new URLSearchParams({
      id: product.id,
      name: product.name,
      state: product.state,
      price: String(product.price),
      image: product.image,
      description: product.description,
    });

    window.location.href = `/product?${params.toString()}`;
  }

  return (
    <main className="states-page">
      {!selectedState ? (
        <>
          <header className="states-header">
            <span className="states-eyebrow">The Art of India</span>
            <h1 className="states-title">Explore by State</h1>
            <p className="states-description">
              Discover India's rich heritage of handmade crafts, traditional
              art, and the artisans who keep these traditions alive.
            </p>
          </header>

          <div className="states-search-wrapper">
            <input
              className="states-search"
              type="search"
              placeholder="Search a state or traditional craft..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search states and crafts"
            />
          </div>

          <section className="states-grid" aria-label="Indian states">
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <StateCard
                  key={state.name}
                  state={state}
                  onSelect={setSelectedState}
                />
              ))
            ) : (
              <div className="states-empty">
                No states or crafts match your search.
                <br />
                Try searching for Punjab, pottery, or weaving.
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="state-products-section">
          <div className="state-products-topbar">
            <button
              type="button"
              className="states-back-button"
              onClick={handleBackToAllStates}
            >
              <ArrowLeft /> {onBackToHome ? "Back to marketplace" : "All states"}
            </button>
          </div>

          <header className="states-header" style={{ textAlign: "left" }}>
            <span className="states-eyebrow">Regional Collection</span>
            <h1 className="state-products-heading">{selectedState}</h1>
            <p className="state-products-description">
              Explore traditional crafts and handmade products from{" "}
              {selectedState}.
            </p>
          </header>

          <div className="state-products-grid">
            {stateProducts.length > 0 ? (
              stateProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))
            ) : (
              <div className="states-empty">
                Products for {selectedState} haven't been added yet.
                <br />
                We can connect this section to your backend when its
                state-wise product data is available.
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
