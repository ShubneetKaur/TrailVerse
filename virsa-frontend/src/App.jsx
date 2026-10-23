
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./App.css";
import brideImage from "./assets/bride.png";
import handi1 from "./assets/handi 1.jpg";
import handi2 from "./assets/handi 2.jpg";
import handi3 from "./assets/handi 3.jpg";
import punjabImage from "./assets/punjab.jpg";
import rajasthanImage from "./assets/rajasthan.jfif";
import kashmirImage from "./assets/kashmir.jfif";
import gujaratImage from "./assets/gujarat.jfif";
import phukariImage from "./assets/phukari.png";
import bluePotteryImage from "./assets/blue pottery.png";
import pashminaImage from "./assets/pashmina.png";
import SellerDashboard from "./seller-dashboard/SellerDashboard";
import MyProfile from "./my-profile/MyProfile";
import AdminPanel from "./admin-panel/AdminPanel";
import States from "./states/states";
import Product from "./product/product";
import {
  CHECKOUT_DRAFT_KEY,
  createOrderReference,
  findOrder,
  normalizeProduct,
  saveOrder,
} from "./orders/orderStorage";
import {
  CheckoutPage,
  ConfirmationPage,
  TrackingPage,
} from "./orders/OrderExperience";

const CustomArtStudio = lazy(() => import("./virsa-custom-art-studio/src/App"));

function readOrderRoute() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("checkout")) return { type: "checkout" };
  if (params.has("confirmation")) return { type: "confirmation", reference: params.get("confirmation") };
  if (params.has("track")) return { type: "tracking", reference: params.get("track") };
  if (params.has("product")) return { type: "product" };
  return { type: "marketplace" };
}

function readCheckoutDraft() {
  try {
    const stored = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readDemoSession() {
  try {
    return sessionStorage.getItem("virsa-demo-session") === "signed-in";
  } catch {
    return false;
  }
}

function writeCheckoutDraft(draft) {
  try {
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

const heroGalleryFrames = [
  {
    image: handi1,
    title: "Terracotta & Clay",
    subtitle: "Ancestral earthen artistry",
    tag: "EARTHEN CRAFT",
  },
  {
    image: handi2,
    title: "Vibrant Handlooms",
    subtitle: "Threads of generational heritage",
    tag: "SACRED WEAVES",
    featured: true,
  },
  {
    image: handi3,
    title: "Artisan Metalwork",
    subtitle: "Timeless motifs cast by hand",
    tag: "TIMELESS FORGE",
  },
];

const states = [
  {
    name: "Punjab",
    subtitle: "Phulkari · Handloom",
    symbol: "✳",
    image: punjabImage,
    accentColor: "#801d2d",
    tag: "Handloom",
  },
  {
    name: "Rajasthan",
    subtitle: "Block Prints · Pottery",
    symbol: "❋",
    image: rajasthanImage,
    accentColor: "#b84b29",
    tag: "Pottery & Print",
  },
  {
    name: "Kashmir",
    subtitle: "Embroidery · Weaving",
    symbol: "✧",
    image: kashmirImage,
    accentColor: "#5b1722",
    tag: "Fine Weaves",
  },
  {
    name: "Gujarat",
    subtitle: "Bandhani · Textiles",
    symbol: "✺",
    image: gujaratImage,
    accentColor: "#c25e36",
    tag: "Tie & Dye",
  },
  {
    name: "Uttar Pradesh",
    subtitle: "Chikankari · Zari",
    symbol: "❈",
    image: null,
    accentColor: "#6b2238",
    tag: "Zari & Thread",
  },
  {
    name: "West Bengal",
    subtitle: "Kantha · Terracotta",
    symbol: "❋",
    image: null,
    accentColor: "#a35532",
    tag: "Kantha Craft",
  },
];

const aboutStoryParagraph =
  "From the vibrant threads of Phulkari to the timeless artistry of India's craftspeople, VIRSA brings generations of tradition into the present. We connect you with the hands, hearts, and heritage behind every creation — because our culture deserves to be celebrated, our artisans deserve to be seen, and our traditions deserve a future.";

const aboutWords = aboutStoryParagraph.split(" ");

const highlightedStores = [
  {
    name: "Noor's Phulkari",
    category: "PUNJAB · HAND EMBROIDERY",
    description: "Colourful threads, generations of tradition.",
    initials: "NP",
    className: "highlight-phulkari",
    image: phukariImage,
  },
  {
    name: "The Royal Loom",
    category: "RAJASTHAN · HANDLOOM",
    description: "Timeless textiles made with care.",
    initials: "RL",
    className: "highlight-loom",
    image: bluePotteryImage,
  },
  {
    name: "Kashmir Heritage",
    category: "KASHMIR · ARTISAN CRAFT",
    description: "Craftsmanship shaped by generations.",
    initials: "KH",
    className: "highlight-kashmir",
    image: pashminaImage,
  },
];

const customOptions = [
  {
    title: "Personalised Embroidery",
    description:
      "Customise traditional embroidery, motifs, colours, and designs.",
    icon: "✦",
  },
  {
    title: "Made Just for You",
    description:
      "Explore customised handcrafted pieces tailored to your preferences.",
    icon: "❋",
  },
  {
    title: "Create Your Own",
    description:
      "Share your ideas and explore bespoke creations from skilled artisans.",
    icon: "✧",
  },
];

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(readDemoSession);
  const [formError, setFormError] = useState("");
  const [orderRoute, setOrderRoute] = useState(readOrderRoute);
  const [checkoutDraft, setCheckoutDraft] = useState(readCheckoutDraft);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setOrderRoute(readOrderRoute());
      setCheckoutDraft(readCheckoutDraft());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateOrderRoute = (route, reference) => {
    const url = new URL(window.location.href);
    url.search = "";
    if (route === "checkout") url.searchParams.set("checkout", "1");
    if (route === "product") url.searchParams.set("product", "1");
    if (route === "confirmation") url.searchParams.set("confirmation", reference);
    if (route === "tracking") url.searchParams.set("track", reference);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setOrderRoute({ type: route, reference });
  };

  const startCheckout = (product, quantity) => {
    const draft = { product: normalizeProduct(product), quantity: Math.max(1, quantity || 1) };
    try {
      sessionStorage.setItem("virsa-demo-session", "signed-in");
    } catch {
      // The active tab can still continue if session storage is unavailable.
    }
    setCheckoutDraft(draft);
    writeCheckoutDraft(draft);
    navigateOrderRoute("checkout");
  };

  const returnToMarketplace = () => {
    try {
      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    } catch {
      // Clear the in-memory draft even when browser storage is unavailable.
    }
    setCheckoutDraft(null);
    setCurrentOrder(null);
    navigateOrderRoute("marketplace");
  };

  const createDemoOrder = ({ quantity, paymentMethod }) => {
    if (!checkoutDraft?.product) return;
    const createdAt = new Date().toISOString();
    const totalCents = checkoutDraft.product.unitPriceCents * quantity;
    const order = {
      reference: createOrderReference(),
      product: checkoutDraft.product,
      quantity,
      totalCents,
      currency: "INR",
      paymentMethod,
      paymentStatus: "not_processed_demo",
      buyerApproval: "pending",
      disputeStatus: "none",
      deliveryStatus: null,
      createdAt,
      events: [{ type: "order_placed", label: "Demo order created", at: createdAt }],
    };
    if (!saveOrder(order)) {
      throw new Error("Browser storage is unavailable");
    }
    setCurrentOrder(order);
    navigateOrderRoute("confirmation", order.reference);
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setFormError("Your passwords do not match.");
      return;
    }

    // Demo navigation until backend authentication is connected.
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    try {
      sessionStorage.removeItem("virsa-demo-session");
    } catch {
      // Sign-out still clears the current app state.
    }
    setIsSignedIn(false);
    setIsLogin(true);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFormError("");
  };

  if (orderRoute.type === "checkout") {
    return (
      <CheckoutPage
        draft={checkoutDraft}
        onBackToProduct={() => navigateOrderRoute("product")}
        onReturnToMarketplace={returnToMarketplace}
        onDraftQuantityChange={(quantity) => {
          const draft = { ...checkoutDraft, quantity };
          setCheckoutDraft(draft);
          writeCheckoutDraft(draft);
        }}
        onPlaceOrder={createDemoOrder}
      />
    );
  }

  if (orderRoute.type === "product") {
    return checkoutDraft?.product ? (
      <Product
        key={checkoutDraft.product.id}
        initialProduct={{ ...checkoutDraft.product, price: checkoutDraft.product.unitPriceCents / 100 }}
        initialQuantity={checkoutDraft.quantity}
        onBuyNow={startCheckout}
        onBackToHome={returnToMarketplace}
      />
    ) : (
      <CheckoutPage onReturnToMarketplace={returnToMarketplace} />
    );
  }

  if (orderRoute.type === "confirmation") {
    const order = findOrder(orderRoute.reference) ||
      (currentOrder?.reference === orderRoute.reference ? currentOrder : null);
    return (
      <ConfirmationPage
        order={order}
        onTrackOrder={() => navigateOrderRoute("tracking", orderRoute.reference)}
        onViewProduct={() => {
          if (order) {
            const draft = { product: order.product, quantity: order.quantity };
            setCheckoutDraft(draft);
            writeCheckoutDraft(draft);
            navigateOrderRoute("product");
          }
        }}
        onReturnToMarketplace={returnToMarketplace}
      />
    );
  }

  if (orderRoute.type === "tracking") {
    return (
      <TrackingPage
        key={orderRoute.reference}
        reference={orderRoute.reference}
        onReturnToMarketplace={returnToMarketplace}
        onViewProduct={() => {
          const order = findOrder(orderRoute.reference);
          if (order) {
            const draft = { product: order.product, quantity: order.quantity };
            setCheckoutDraft(draft);
            writeCheckoutDraft(draft);
            navigateOrderRoute("product");
          }
        }}
      />
    );
  }

  if (isSignedIn) {
    return (
      <HomePage
        onSignOut={handleSignOut}
        onBuyNow={startCheckout}
        onTrackOrder={(reference) => navigateOrderRoute("tracking", reference)}
      />
    );
  }

  return (
    <main className={isLogin ? "auth-page login-page" : "auth-page create-account-page"}>
      <div className="painting painting-left" aria-hidden="true">
        <img src={brideImage} alt="" />
      </div>

      <div className="painting painting-right" aria-hidden="true">
        <img src={brideImage} alt="" />
      </div>

      <section className="auth-card">
        <a className="brand-name" href="#home">
          VIRSA
        </a>

        <p className="brand-tagline">WHERE HERITAGE FINDS A HOME</p>

        <div className="heading-block">
          <p className="eyebrow">
            {isLogin ? "YOUR JOURNEY CONTINUES" : "BECOME PART OF OUR STORY"}
          </p>

          <h1>
            {isLogin ? (
              <>
                Welcome <em>back</em>
              </>
            ) : (
              <>
                Join the <em>legacy</em>
              </>
            )}
          </h1>

          <p className="form-description">
            {isLogin
              ? "Discover stories woven into every creation"
              : "Create an account and celebrate Indian craftsmanship"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {isLogin && (
            <div className="form-options">
              <label className="remember-option">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setFormError(
                    "Password recovery will be available after backend integration."
                  )
                }
              >
                Forgot password?
              </button>
            </div>
          )}

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className="submit-button">
            {isLogin ? "Sign In" : "Create Account"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="switch-mode">
          {isLogin ? "New to Virsa?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-button switch-button"
            onClick={switchMode}
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>

        <div className="bottom-ornament" aria-hidden="true">
          <span />
          <span className="ornament-diamond">◆</span>
          <span />
        </div>
      </section>
    </main>
  );
}

function HomePage({ onSignOut, onBuyNow, onTrackOrder }) {
  const [activeMenu, setActiveMenu] = useState(false);
  const [dashboardMessage, setDashboardMessage] = useState(false);
  const [activePanel, setActivePanel] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const stateTrackRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12 }
    );

    const sections = document.querySelectorAll(".reveal-on-scroll");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const moveStates = (direction) => {
    if (stateTrackRef.current) {
      stateTrackRef.current.scrollBy({
        left: direction * 280,
        behavior: "smooth",
      });
    }
  };

  if (activePanel === "Seller Dashboard") {
    return (
      <SellerDashboard
        onBack={() => setActivePanel("")}
        onSignOut={onSignOut}
      />
    );
  }

  if (activePanel === "Admin Panel") {
    return (
      <AdminPanel
        onBack={() => setActivePanel("")}
        onSignOut={onSignOut}
      />
    );
  }

  if (dashboardMessage) {
    return (
      <MyProfile
        onBack={() => setDashboardMessage(false)}
        onSignOut={onSignOut}
        onTrackOrder={onTrackOrder}
      />
    );
  }

  if (activePanel === "Custom Art Studio") {
    return (
      <Suspense fallback={<div className="studio-loading">Loading Custom Art Studio...</div>}>
        <CustomArtStudio onBackToHome={() => setActivePanel("")} />
      </Suspense>
    );
  }

  if (selectedProduct) {
    return (
      <Product
        key={selectedProduct.id}
        initialProduct={selectedProduct}
        onBackToState={() => setSelectedProduct(null)}
        onBackToHome={() => {
          setSelectedProduct(null);
          setSelectedState(null);
        }}
        onBuyNow={onBuyNow}
      />
    );
  }

  if (selectedState) {
    return (
      <States
        initialState={selectedState}
        onBackToHome={() => setSelectedState(null)}
        onProductSelect={(product) => {
          setSelectedProduct(product);
        }}
      />
    );
  }

  return (
    <main className="home-page" id="home">
      <div className="offer-bar" aria-label="Current offers">
        <div className="offer-track">
          {[0, 1, 2, 3].map((item) => (
            <p className="offer-message" key={item}>
              <span className="offer-star">✦</span>
              DIWALI SPECIAL — ENJOY 20% OFF ON HANDCRAFTED TREASURES
              <span className="offer-code">
                USE CODE <strong>VIRSA20</strong>
              </span>
              <span className="offer-star">✦</span>
            </p>
          ))}
        </div>
      </div>

      <header className="home-navbar">
        <a className="home-brand" href="#home" aria-label="Virsa home">
          VIRSA
          <span>THE ART OF HERITAGE</span>
        </a>

        <nav className="home-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#about-us">About Us</a>
          <a href="#collections">Collections</a>
          <a href="#artisans">Artisans</a>
        </nav>

        <div className="profile-area">
          <button
            type="button"
            className="profile-button"
            onClick={() => setActiveMenu((previous) => !previous)}
            aria-expanded={activeMenu}
          >
            <span className="profile-icon">♙</span>
            My Account
            <span className="profile-chevron">⌄</span>
          </button>

          {activeMenu && (
            <div className="profile-menu">
              <button
                type="button"
                onClick={() => {
                  setDashboardMessage(true);
                  setActiveMenu(false);
                }}
              >
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePanel("Seller Dashboard");
                  setActiveMenu(false);
                }}
              >
                Seller Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePanel("Admin Panel");
                  setActiveMenu(false);
                }}
              >
                Admin Panel
              </button>

              <button type="button" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="home-hero reveal-on-scroll">
        <div className="hero-integrated-layout">
          <div className="hero-header-block">
            <p className="home-eyebrow">
              <span>✦</span> ROOTED IN CULTURE · CRAFTED WITH LOVE <span>✦</span>
            </p>

            <h1 className="hero-heritage-title">
              Where Heritage Finds a Home
            </h1>

            <p className="hero-description">
              Discover the hands, hearts, and ancestral traditions behind
              India's most extraordinary handcrafted treasures.
            </p>

            <div className="hero-actions">
              <a href="#collections" className="hero-gold-button">
                Explore Collection <span>↗</span>
              </a>
            </div>
          </div>

          <div
            className="hero-triptych-container"
            aria-label="Curated Indian handicraft heritage gallery"
          >
            <div className="triptych-rail" aria-hidden="true">
              <span className="triptych-gem">✦</span>
              <span className="triptych-line" />
              <span className="triptych-gem">✦</span>
              <span className="triptych-line" />
              <span className="triptych-gem">✦</span>
            </div>

            <div
              className="hero-carousel-viewport"
              aria-label="Continuously moving heritage gallery"
            >
              <div className="hero-carousel-track">
                {[...heroGalleryFrames, ...heroGalleryFrames].map(
                  (frame, index) => (
                    <article
                      key={`${frame.title}-${index}`}
                      className={`hero-heritage-frame hero-frame-${(index % 3) + 1} ${
                        frame.featured ? "is-featured-frame" : ""
                      }`}
                    >
                      <div className="frame-inner-wrapper">
                        <img
                          src={frame.image}
                          alt={frame.title}
                          className="frame-image"
                        />
                        <div className="frame-overlay-gradient" />
                        <div className="frame-filigree-border" aria-hidden="true" />
                        <span className="frame-star-tl" aria-hidden="true">
                          ✦
                        </span>
                        <span className="frame-star-br" aria-hidden="true">
                          ✦
                        </span>

                        <div className="frame-caption-box">
                          <span className="frame-category-pill">
                            {frame.tag}
                          </span>
                          <h3 className="frame-heading">{frame.title}</h3>
                          <p className="frame-subtext">{frame.subtitle}</p>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>

            <div className="hero-gallery-footer-note">
              <span>✧</span> A Legacy in Every Thread · Preserving Ancestral
              Craft <span>✧</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section reveal-on-scroll" id="about-us">
        <div className="about-decorative-top" aria-hidden="true">
          <span className="about-diamond">◆</span>
          <span className="about-line" />
          <span className="about-star">✦</span>
          <span className="about-line" />
          <span className="about-diamond">◆</span>
        </div>

        <div className="about-copy">
          <p className="about-eyebrow">OUR HERITAGE & PURPOSE</p>
          <h2 className="about-heading">About VIRSA</h2>

          <div className="about-story-card">
            <span className="about-accent-quote" aria-hidden="true">
              “
            </span>

            <p className="about-description">
              {aboutWords.map((word, index) => {
                const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");

                const isKeyHeritageWord = [
                  "phulkari",
                  "craftspeople",
                  "virsa",
                  "tradition",
                  "heritage",
                  "culture",
                  "artisans",
                  "traditions",
                  "future",
                ].includes(cleanWord);

                return (
                  <span
                    key={index}
                    className={`about-word-animated ${
                      isKeyHeritageWord ? "about-word-glow" : ""
                    }`}
                    style={{ "--word-index": index }}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        <div className="about-decorative-bottom" aria-hidden="true">
          <span className="about-line" />
          <span className="about-star">✦</span>
          <span className="about-line" />
        </div>
      </section>

      <section className="craft-section reveal-on-scroll" id="collections">
        <div className="section-heading">
          <div>
            <p className="home-eyebrow">A LAND OF MANY STORIES</p>
            <h2>
              Explore by <em>State</em>
            </h2>
          </div>

          <div className="carousel-controls">
            <p>Find the craft that speaks to you</p>
            <button
              type="button"
              onClick={() => moveStates(-1)}
              aria-label="Previous states"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => moveStates(1)}
              aria-label="Next states"
            >
              →
            </button>
          </div>
        </div>

        <div className="state-track" ref={stateTrackRef}>
          {states.map((state, index) => (
            <button
              type="button"
              className={`state-card state-card-${index % 3} ${
                state.image ? "has-image" : "is-placeholder"
              }`}
              key={state.name}
              onClick={() => setSelectedState(state.name)}
              aria-label={`Explore ${state.name} crafts`}
              style={{ "--state-accent": state.accentColor }}
            >
              {state.image ? (
                <>
                  <img
                    src={state.image}
                    alt={state.name}
                    className="state-circle-img"
                  />
                  <div className="state-image-overlay" />
                </>
              ) : (
                <div className="state-placeholder-bg" aria-hidden="true">
                  <div className="state-mandala-ring" />
                  <div className="state-art-symbol">{state.symbol}</div>
                </div>
              )}

              <div className="state-circle-inner">
                <div className="state-circle-ring" aria-hidden="true" />
                <span className="state-tag-badge">{state.tag}</span>
                <h3>{state.name}</h3>
                <p>{state.subtitle}</p>
                <span className="state-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="carousel-hint">
          <span>←</span> Explore more regions <span>→</span>
        </p>
      </section>

      <section className="custom-crafts-banner reveal-on-scroll" id="explore-custom">
        <div className="custom-crafts-ornament" aria-hidden="true">
          ✦
        </div>

        <div className="custom-crafts-copy">
          <p className="home-eyebrow">Explore Custom</p>
          <h2>
            Explore <em>Custom</em>
          </h2>
          <p>
            Your vision, our artisans&apos; craft. Discover handcrafted treasures made uniquely for you.
          </p>

          <div className="custom-crafts-options">
            {customOptions.map((option) => (
              <article className="custom-option-card" key={option.title}>
                <span className="custom-option-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="custom-crafts-button"
          onClick={() => setActivePanel("Custom Art Studio")}
        >
          Create Something Unique <span aria-hidden="true">↗</span>
        </button>

        <span className="custom-crafts-watermark" aria-hidden="true">
          विरसा
        </span>
      </section>

      <section className="highlights-section reveal-on-scroll" id="highlights">
        <div className="section-heading">
          <div>
            <p className="home-eyebrow">THE VIRSA SELECTION</p>
            <h2>
              Heritage <em>Highlights</em>
            </h2>
          </div>

          <p>
            Exceptional artisan stores, handpicked to bring their craft closer
            to you.
          </p>
        </div>

        <div className="highlight-grid">
          {highlightedStores.map((store, index) => (
            <article className="highlight-card" key={store.name}>
              <div className={`highlight-image ${store.className}`}>
                <img
                  src={store.image}
                  alt={store.name}
                  className="highlight-card-photo"
                />
                <div className="highlight-image-overlay" aria-hidden="true" />
                <span className="highlight-pattern" aria-hidden="true">
                  {index === 0 ? "✳" : index === 1 ? "❋" : "✧"}
                </span>
                <span className="highlight-placeholder">{store.initials}</span>
                <span className="featured-ribbon">VIRSA HIGHLIGHT</span>
              </div>

              <div className="highlight-info">
                <p className="highlight-category">{store.category}</p>
                <h3>{store.name}</h3>
                <p>{store.description}</p>

                <button
                  type="button"
                  className="highlight-link"
                  onClick={() =>
                    window.alert(
                      "This store page will be connected when your artisan portfolio pages are integrated."
                    )
                  }
                >
                  Explore Store <span>↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="highlight-note">
          Highlighted stores are reserved for participating subscription
          members. These sample listings are placeholders for your actual
          subscribed artisans.
        </p>
      </section>

      <section className="explore-artisans-section reveal-on-scroll" id="explore-artisans">
        <div className="explore-artisans-content">
          <p className="home-eyebrow">THE PEOPLE BEHIND THE CRAFT</p>
          <h2>
            Explore Our <em>Artisans</em>
          </h2>
          <p>
            Discover the talented makers behind India’s beautiful handcrafted
            traditions. Soon, artisans will be able to share short videos of
            their work and the stories behind every creation.
          </p>
          <a href="#highlights" className="explore-artisans-button">
            Explore Artisans <span aria-hidden="true">↗</span>
          </a>
        </div>
        <span className="explore-artisans-watermark" aria-hidden="true">विरसा</span>
      </section>

      <footer className="home-footer">
        <a className="home-brand" href="#home">
          VIRSA
          <span>THE ART OF HERITAGE</span>
        </a>

        <p>Preserving traditions. Empowering artisans.</p>

        <a href="#home" className="back-to-top">
          Back to top ↑
        </a>

        <span className="footer-motto">MADE WITH RESPECT FOR OUR ROOTS</span>
      </footer>

      {activePanel && (
        <div
          className="dashboard-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActivePanel("");
            }
          }}
        >
          <section
            className="dashboard-notice action-notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-panel-title"
          >
            <button
              type="button"
              className="dashboard-close"
              onClick={() => setActivePanel("")}
              aria-label="Close dialog"
            >
              ×
            </button>

            <p className="home-eyebrow">VIRSA · MADE WITH MEANING</p>
            <h2 id="action-panel-title">{activePanel}</h2>

            {activePanel === "Submit a Custom Request" ? (
              requestSubmitted ? (
                <div className="request-success">
                  <span>✦</span>
                  <h3>Your idea is ready for the next step.</h3>
                  <p>
                    This is a frontend demo: your request has not been sent to
                    an artisan yet.
                  </p>
                  <button
                    type="button"
                    className="home-primary-button"
                    onClick={() => setActivePanel("")}
                  >
                    Done <span>↗</span>
                  </button>
                </div>
              ) : (
                <form
                  className="custom-request-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setRequestSubmitted(true);
                  }}
                >
                  <label>
                    What would you like crafted?
                    <input
                      required
                      name="craftType"
                      placeholder="e.g. Phulkari dupatta"
                    />
                  </label>

                  <label>
                    Describe your idea
                    <textarea
                      required
                      name="description"
                      rows="3"
                      placeholder="Share the details, colours, or inspiration..."
                    />
                  </label>

                  <div className="request-form-row">
                    <label>
                      Preferred materials
                      <input name="materials" placeholder="e.g. cotton, silk" />
                    </label>
                    <label>
                      Budget (₹)
                      <input
                        name="budget"
                        type="number"
                        min="0"
                        placeholder="Your budget"
                      />
                    </label>
                  </div>

                  <label>
                    Preferred timeline
                    <input
                      name="timeline"
                      placeholder="e.g. within 4 weeks"
                    />
                  </label>

                  <p className="request-form-note">
                    Demo form only. It will not transmit or store your request
                    online.
                  </p>

                  <button type="submit" className="home-primary-button">
                    Review Request <span>↗</span>
                  </button>
                </form>
              )
            ) : activePanel === "Find an Artisan" ? (
              <>
                <p>
                  Artist discovery will let you explore verified makers by
                  craft, region, style, and availability.
                </p>
                <div className="panel-empty-state">
                  <span>❋</span>
                  <strong>Artisan directory coming soon</strong>
                  <p>There are no connected artist profiles to browse yet.</p>
                </div>
              </>
            ) : activePanel === "Compare Bids" ? (
              <>
                <p>
                  Compare proposals for your custom requests by price,
                  approach, and estimated completion time.
                </p>
                <div className="panel-empty-state">
                  <span>◇</span>
                  <strong>No bids to compare yet</strong>
                  <p>
                    Once custom requests and artisan bids are connected,
                    proposals will appear here. No sample bids are shown as
                    real.
                  </p>
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}

    </main>
  );
}

export default App;
