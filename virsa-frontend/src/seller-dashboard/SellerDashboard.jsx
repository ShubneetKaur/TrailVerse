import { useRef, useState } from "react";
import "./SellerDashboard.css";

const initialProducts = [
  { id: 1, name: "Phulkari Heritage Dupatta", category: "Textiles", price: "₹2,450", stock: 8, status: "Published" },
  { id: 2, name: "Hand-painted Terracotta Vase", category: "Pottery", price: "₹1,200", stock: 4, status: "Published" },
  { id: 3, name: "Brass Lotus Diya Set", category: "Metal craft", price: "₹850", stock: 0, status: "Draft" },
];

const initialOrders = [
  { id: "VR-2048", item: "Phulkari Heritage Dupatta", buyer: "Aarav S.", date: "22 Oct 2026", amount: "₹2,450", status: "Ready to ship" },
  { id: "VR-2047", item: "Brass Lotus Diya Set", buyer: "Meera K.", date: "21 Oct 2026", amount: "₹1,700", status: "In progress" },
  { id: "VR-2046", item: "Terracotta Vase", buyer: "Ishita R.", date: "20 Oct 2026", amount: "₹1,200", status: "Delivered" },
];

const navItems = [
  { id: "overview", label: "Overview", icon: "✦" },
  { id: "profile", label: "Artisan profile", icon: "♧" },
  { id: "products", label: "My products", icon: "◇" },
  { id: "stories", label: "My stories", icon: "▷" },
  { id: "orders", label: "Orders & earnings", icon: "↗" },
  { id: "requests", label: "Custom requests", icon: "✉" },
];

function MetricCard({ label, value, note, icon }) {
  return <article className="vd-metric"><div className="vd-metric-top"><span>{label}</span><span className="vd-metric-icon" aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}

export default function SellerDashboard({ onBack, onSignOut }) {
  const [active, setActive] = useState("overview");
  const [products, setProducts] = useState(initialProducts);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Textiles");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("1");
  const [productDescription, setProductDescription] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [storeName, setStoreName] = useState("The Heritage Loom");
  const [artisanName, setArtisanName] = useState("");
  const [region, setRegion] = useState("Punjab, India");
  const [bio, setBio] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyFile, setStoryFile] = useState(null);
  const [stories, setStories] = useState([]);
  const [verificationFile, setVerificationFile] = useState(null);
  const [notice, setNotice] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");
  const storyFileRef = useRef(null);
  const verificationRef = useRef(null);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const addProduct = (event) => {
    event.preventDefault();
    if (!productName.trim() || !productPrice.trim()) {
      showNotice("Add a product name and price to continue.");
      return;
    }
    setProducts((current) => [{ id: Date.now(), name: productName.trim(), category: productCategory, price: `₹${Number(productPrice).toLocaleString("en-IN")}`, stock: Math.max(0, Number(productStock) || 0), status: "Draft" }, ...current]);
    setProductName(""); setProductPrice(""); setProductStock("1"); setProductDescription(""); setProductFormOpen(false);
    showNotice("Product added to this session. Backend integration is needed to publish it.");
  };

  const addStory = (event) => {
    event.preventDefault();
    if (!storyTitle.trim() || !storyFile) { showNotice("Choose a video and give your story a title."); return; }
    setStories((current) => [{ id: Date.now(), title: storyTitle.trim(), fileName: storyFile.name, url: URL.createObjectURL(storyFile) }, ...current]);
    setStoryTitle(""); setStoryFile(null);
    if (storyFileRef.current) storyFileRef.current.value = "";
    showNotice("Story added for this session. Connect storage to keep it after refresh.");
  };

  const pageTitles = { overview: "Overview", profile: "Artisan profile", products: "My products", stories: "My stories", orders: "Orders & earnings", requests: "Custom requests" };

  return (
    <div className="vd-shell">
      <aside className="vd-sidebar">
        <button className="vd-brand" onClick={onBack} aria-label="Return to VIRSA home"><span className="vd-brand-mark">V</span><span><strong>VIRSA</strong><small>THE ARTISAN COLLECTIVE</small></span></button>
        <div className="vd-sidebar-label">YOUR STUDIO</div>
        <nav className="vd-nav" aria-label="Seller dashboard navigation">{navItems.map((item) => <button key={item.id} className={`vd-nav-item ${active === item.id ? "is-active" : ""}`} onClick={() => setActive(item.id)}><span className="vd-nav-icon">{item.icon}</span>{item.label}{active === item.id && <span className="vd-nav-active-dot" />}</button>)}</nav>
        <div className="vd-sidebar-bottom"><div className="vd-help-card"><span>✦ A LITTLE GUIDANCE</span><p>Your craft has a story worth sharing. Let the world discover it.</p><button onClick={() => showNotice("Seller support can be connected here.")}>Seller support ↗</button></div><button className="vd-back-home" onClick={onBack}>← Back to marketplace</button><button className="vd-signout" onClick={onSignOut}>↗ Sign out</button></div>
      </aside>
      <main className="vd-main">
        <header className="vd-topbar"><div className="vd-breadcrumb">VIRSA <span>/</span> SELLER STUDIO <span>/</span> <strong>{pageTitles[active]}</strong></div><div className="vd-topbar-right"><span className="vd-live-dot" /> Artisan workspace <span className="vd-avatar">{(artisanName || "A").trim().slice(0, 1).toUpperCase()}</span></div></header>
        <div className="vd-content">
          <section className="vd-welcome"><div className="vd-welcome-copy"><span className="vd-eyebrow">YOUR CRAFT. YOUR LEGACY.</span><h2>Every creation tells <em>a story.</em></h2><p>Welcome to your studio. Keep your craft thriving, one thoughtful creation at a time.</p><button className="vd-button vd-button-gold" onClick={() => { setActive("products"); setProductFormOpen(true); }}>＋ Add a new product</button></div><div className="vd-welcome-art" aria-hidden="true"><span className="vd-art-sun" /><span className="vd-art-arch" /><span className="vd-art-stem">❧</span><span className="vd-art-caption">HANDMADE<br />WITH HERITAGE</span></div></section>

          {active === "overview" && <>
            <div className="vd-section-heading"><div><span className="vd-eyebrow">AT A GLANCE</span><h3>Your studio overview</h3></div><span className="vd-updated">Demo dashboard · Sample figures</span></div>
            <section className="vd-metrics"><MetricCard label="Listed products" value={products.length} note="Across your collections" icon="◇" /><MetricCard label="Active orders" value="02" note="1 ready to dispatch" icon="↗" /><MetricCard label="Earnings" value="₹8,420" note="Illustrative total" icon="₹" /><MetricCard label="Store status" value="In review" note="Complete verification" icon="✦" /></section>
            <section className="vd-overview-grid"><article className="vd-panel"><div className="vd-panel-heading"><div><span className="vd-eyebrow">YOUR CREDENTIALS</span><h3>Build buyer trust</h3></div><span className="vd-status vd-status-pending">Pending</span></div><p className="vd-muted">Complete your artisan profile and submit the documents required for verification.</p><div className="vd-progress"><span style={{ width: profileSaved ? "75%" : "35%" }} /></div><div className="vd-progress-caption"><span>Profile completion</span><strong>{profileSaved ? "75%" : "35%"}</strong></div><button className="vd-text-button" onClick={() => setActive("profile")}>Complete your profile <span>↗</span></button></article>
            <article className="vd-panel"><div className="vd-panel-heading"><div><span className="vd-eyebrow">NEEDS YOUR ATTENTION</span><h3>Studio checklist</h3></div><span className="vd-check-icon">✦</span></div><ul className="vd-checklist"><li><span className="vd-check-empty" /> Add your artisan story <button onClick={() => setActive("profile")}>Start</button></li><li><span className="vd-check-empty" /> Submit verification documents <button onClick={() => setActive("profile")}>Upload</button></li><li><span className="vd-check-empty" /> Review orders ready to ship <button onClick={() => setActive("orders")}>View</button></li></ul></article></section>
            <section className="vd-panel vd-recent-panel"><div className="vd-panel-heading"><div><span className="vd-eyebrow">THE LATEST</span><h3>Recent orders</h3></div><button className="vd-text-button" onClick={() => setActive("orders")}>View all orders ↗</button></div><OrderTable orders={initialOrders.slice(0, 2)} /></section>
          </>}

          {active === "profile" && <section className="vd-panel vd-form-panel"><div className="vd-page-intro"><span className="vd-eyebrow">THE HAND BEHIND THE CRAFT</span><h2>Artisan profile</h2><p>Introduce the person, place, and traditions behind your creations.</p></div><form className="vd-form" onSubmit={(e) => { e.preventDefault(); setProfileSaved(true); showNotice("Profile details saved in this session."); }}><div className="vd-form-grid"><label>Artisan / owner name<input value={artisanName} onChange={(e) => setArtisanName(e.target.value)} placeholder="Your full name" /></label><label>Store name<input value={storeName} onChange={(e) => setStoreName(e.target.value)} required placeholder="Name of your studio" /></label><label>Region / state<input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Punjab, India" /></label><label>Craft category<select defaultValue="Textiles"><option>Textiles</option><option>Pottery</option><option>Metal craft</option><option>Woodwork</option><option>Jewellery</option><option>Painting</option><option>Other</option></select></label><label className="vd-full-field">Your story<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="4" placeholder="Share how you learned this craft, what makes it special, and the traditions you carry forward…" /></label></div><div className="vd-upload-box"><div className="vd-upload-symbol">↥</div><div><strong>Verification documents</strong><p>Upload relevant artisan, identity, or GI-related documents where required.</p>{verificationFile && <small className="vd-file-name">{verificationFile.name}</small>}</div><input ref={verificationRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setVerificationFile(e.target.files?.[0] || null)} hidden /><button type="button" className="vd-button vd-button-outline" onClick={() => verificationRef.current?.click()}>Choose file</button></div><p className="vd-helper">Prototype only: files and profile details are not sent to a server or permanently stored.</p><button className="vd-button vd-button-primary" type="submit">Save profile ↗</button></form></section>}

          {active === "products" && <><div className="vd-page-intro vd-page-intro-row"><div><span className="vd-eyebrow">MADE BY YOUR HANDS</span><h2>My products</h2><p>Curate the pieces that carry your tradition forward.</p></div><button className="vd-button vd-button-primary" onClick={() => setProductFormOpen((open) => !open)}>{productFormOpen ? "− Close form" : "＋ Add product"}</button></div>
            {productFormOpen && <section className="vd-panel vd-form-panel"><h3>Add a new creation</h3><form className="vd-form" onSubmit={addProduct}><div className="vd-form-grid"><label>Product name<input value={productName} onChange={(e) => setProductName(e.target.value)} required placeholder="e.g. Hand-embroidered dupatta" /></label><label>Category<select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}><option>Textiles</option><option>Pottery</option><option>Metal craft</option><option>Woodwork</option><option>Jewellery</option><option>Painting</option><option>Other</option></select></label><label>Price (₹)<input type="number" min="1" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required placeholder="1200" /></label><label>Available stock<input type="number" min="0" value={productStock} onChange={(e) => setProductStock(e.target.value)} /></label><label className="vd-full-field">Description<textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows="3" placeholder="Materials, process, regional significance…" /></label></div><p className="vd-helper">New products are saved in this browser session only; marketplace publishing needs backend integration.</p><button className="vd-button vd-button-primary" type="submit">Save product ↗</button></form></section>}
            <section className="vd-panel vd-table-panel"><div className="vd-panel-heading"><div><span className="vd-eyebrow">YOUR COLLECTION</span><h3>Product catalogue <span className="vd-count">{products.length}</span></h3></div></div><div className="vd-product-list">{products.map((product, index) => <article className="vd-product-row" key={product.id}><div className={`vd-product-monogram vd-monogram-${index % 3}`}>{product.name.slice(0, 1).toUpperCase()}</div><div className="vd-product-details"><strong>{product.name}</strong><small>{product.category} · {product.stock} in stock</small></div><strong className="vd-product-price">{product.price}</strong><span className={`vd-status ${product.status === "Published" ? "vd-status-live" : "vd-status-draft"}`}>{product.status}</span><button className="vd-icon-button" title="Remove product" aria-label={`Remove ${product.name}`} onClick={() => { setProducts((current) => current.filter((item) => item.id !== product.id)); showNotice("Product removed from this session."); }}>×</button></article>)}</div></section>
          </>}

          {active === "stories" && <><div className="vd-page-intro"><span className="vd-eyebrow">BEHIND EVERY MASTERPIECE</span><h2>My stories</h2><p>Let customers see the hands, heart, and heritage behind your craft.</p></div><section className="vd-panel vd-form-panel"><h3>Share a studio story</h3><form className="vd-form" onSubmit={addStory}><label>Story title<input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} required placeholder="e.g. A morning in our weaving studio" /></label><input ref={storyFileRef} type="file" accept="video/*" onChange={(e) => setStoryFile(e.target.files?.[0] || null)} hidden /><button type="button" className="vd-video-drop" onClick={() => storyFileRef.current?.click()}><span className="vd-play-circle">▷</span><strong>{storyFile ? storyFile.name : "Choose a short video"}</strong><small>MP4, MOV or other browser-supported video</small></button><p className="vd-helper">Videos are previewed locally for this prototype. Permanent uploads need secure backend storage.</p><button type="submit" className="vd-button vd-button-primary">Add story ↗</button></form></section><div className="vd-story-grid">{stories.map((story) => <article className="vd-panel vd-story-card" key={story.id}><video src={story.url} controls /><div><span className="vd-eyebrow">YOUR STORY</span><h3>{story.title}</h3><p>{story.fileName}</p></div></article>)}</div></>}

          {active === "orders" && <><div className="vd-page-intro vd-page-intro-row"><div><span className="vd-eyebrow">FROM YOUR STUDIO TO THEIR HOME</span><h2>Orders & earnings</h2><p>Keep each creation moving smoothly towards its new home.</p></div><select className="vd-filter-select" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}><option>All</option><option>Ready to ship</option><option>In progress</option><option>Delivered</option></select></div><section className="vd-metrics vd-order-metrics"><MetricCard label="Orders this month" value="12" note="Illustrative sample" icon="↗" /><MetricCard label="Awaiting dispatch" value="01" note="Prepare for shipment" icon="◇" /><MetricCard label="Gross sales" value="₹18,650" note="Sample dashboard data" icon="₹" /><MetricCard label="Commission" value="₹1,865" note="Illustrative 10% estimate" icon="✦" /></section><section className="vd-panel vd-table-panel"><div className="vd-panel-heading"><div><span className="vd-eyebrow">ORDER BOOK</span><h3>Recent customer orders</h3></div></div><OrderTable orders={initialOrders.filter((order) => orderFilter === "All" || order.status === orderFilter)} /></section><p className="vd-helper vd-outside-helper">Order and earnings figures are sample data. Connect your backend to show real transactions, commissions, and delivery updates.</p></>}

          {active === "requests" && <><div className="vd-page-intro"><span className="vd-eyebrow">MADE JUST FOR THEM</span><h2>Custom requests</h2><p>Explore bespoke commissions and buyer requests that celebrate your craft.</p></div><section className="vd-panel vd-request-card"><span className="vd-request-icon">✉</span><div><span className="vd-status vd-status-pending">Awaiting response</span><h3>Personalised Phulkari wall hanging</h3><p>A sample customer request for a custom colour palette and a larger size for a family celebration.</p><div className="vd-request-meta"><span>Example request</span><strong>Budget: ₹3,000–₹4,000</strong></div><div className="vd-request-actions"><button className="vd-button vd-button-primary" onClick={() => showNotice("Connect the custom-request API to submit a quote.")}>Prepare a quote ↗</button><button className="vd-button vd-button-outline" onClick={() => showNotice("Request messaging will be available after backend integration.")}>Message buyer</button></div></div></section><p className="vd-helper vd-outside-helper">This is a sample request. Live requests, messages, and competitive bids require backend integration.</p></>}
          <footer className="vd-footer"><span>VIRSA <i>—</i> Where heritage finds a home.</span><span>Made with respect for every tradition <b>✦</b></span></footer>
        </div>
      </main>
      {notice && <div className="vd-toast" role="status"><span>✦</span>{notice}</div>}
    </div>
  );
}

function OrderTable({ orders }) {
  if (!orders.length) return <div className="vd-empty-state">No orders match this filter just yet.</div>;
  return <div className="vd-order-table-wrap"><table className="vd-order-table"><thead><tr><th>Order</th><th>Creation</th><th>Buyer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.date}</small></td><td>{order.item}</td><td>{order.buyer}</td><td className="vd-table-amount">{order.amount}</td><td><span className={`vd-status ${order.status === "Delivered" ? "vd-status-live" : "vd-status-pending"}`}>{order.status}</span></td></tr>)}</tbody></table></div>;
}
