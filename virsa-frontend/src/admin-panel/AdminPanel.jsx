
import React, { useMemo, useState } from "react";
import "./AdminPanel.css";

const initialSellers = [
  {
    id: "SEL-1042",
    name: "Noor Phulkari House",
    owner: "Simran Kaur",
    state: "Punjab",
    craft: "Phulkari Embroidery",
    submitted: "21 Oct 2026",
    status: "Pending",
  },
  {
    id: "SEL-1043",
    name: "The Blue Pottery Studio",
    owner: "Meera Sharma",
    state: "Rajasthan",
    craft: "Blue Pottery",
    submitted: "20 Oct 2026",
    status: "Pending",
  },
  {
    id: "SEL-1044",
    name: "Kutch Heritage Weaves",
    owner: "Aarav Patel",
    state: "Gujarat",
    craft: "Handloom Textiles",
    submitted: "19 Oct 2026",
    status: "Approved",
  },
  {
    id: "SEL-1045",
    name: "Madhubani Rang",
    owner: "Ananya Jha",
    state: "Bihar",
    craft: "Madhubani Painting",
    submitted: "18 Oct 2026",
    status: "Needs Changes",
  },
];

const initialListings = [
  {
    id: "PRD-201",
    name: "Hand-embroidered Phulkari Dupatta",
    seller: "Noor Phulkari House",
    category: "Textiles",
    price: 2499,
    status: "Pending",
  },
  {
    id: "PRD-202",
    name: "Jaipur Blue Pottery Vase",
    seller: "The Blue Pottery Studio",
    category: "Pottery",
    price: 1899,
    status: "Pending",
  },
  {
    id: "PRD-203",
    name: "Handwoven Kutch Shawl",
    seller: "Kutch Heritage Weaves",
    category: "Textiles",
    price: 3299,
    status: "Approved",
  },
  {
    id: "PRD-204",
    name: "Madhubani Folk Art Painting",
    seller: "Madhubani Rang",
    category: "Art",
    price: 1599,
    status: "Needs Changes",
  },
];

const initialReports = [
  {
    id: "DSP-031",
    title: "Product authenticity concern",
    reporter: "Customer #104",
    subject: "Handcrafted textile listing",
    priority: "High",
    status: "Open",
  },
  {
    id: "DSP-032",
    title: "Order delivery dispute",
    reporter: "Customer #118",
    subject: "Blue Pottery Studio",
    priority: "Medium",
    status: "Under Review",
  },
  {
    id: "DSP-033",
    title: "Incorrect product description",
    reporter: "Customer #126",
    subject: "Regional craft listing",
    priority: "Low",
    status: "Open",
  },
];

const initialAnnouncements = [
  {
    id: "ANN-01",
    title: "Diwali Heritage Edit",
    category: "Festival Campaign",
    message:
      "Celebrate India's craft traditions with a special seasonal collection.",
    status: "Published",
    date: "18 Oct 2026",
  },
  {
    id: "ANN-02",
    title: "Meet the Makers",
    category: "Community Bulletin",
    message:
      "Discover the artisans preserving India's extraordinary handmade heritage.",
    status: "Draft",
    date: "21 Oct 2026",
  },
];

const initialTransactions = [
  {
    id: "TXN-801",
    order: "ORD-501",
    seller: "Noor Phulkari House",
    amount: 2499,
    status: "Paid",
  },
  {
    id: "TXN-802",
    order: "ORD-502",
    seller: "The Blue Pottery Studio",
    amount: 1899,
    status: "Processing",
  },
  {
    id: "TXN-803",
    order: "ORD-503",
    seller: "Kutch Heritage Weaves",
    amount: 3299,
    status: "Paid",
  },
];

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { id: "dashboard", icon: "◈", label: "Dashboard" },
    ],
  },
  {
    label: "PLATFORM MANAGEMENT",
    items: [
      { id: "sellers", icon: "♙", label: "Seller Applications", count: true },
      { id: "listings", icon: "▧", label: "Product Listings" },
      { id: "disputes", icon: "⚖", label: "Disputes & Reports" },
      { id: "bulletin", icon: "✧", label: "Bulletin Board" },
      { id: "transactions", icon: "₹", label: "Transactions" },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { id: "settings", icon: "⚙", label: "Settings" },
    ],
  },
];

const pageTitles = {
  dashboard: "Dashboard",
  sellers: "Seller Applications",
  listings: "Product Listings",
  disputes: "Disputes & Reports",
  bulletin: "Bulletin Board",
  transactions: "Transactions",
  settings: "Admin Settings",
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function Status({ value }) {
  const className = value.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`ap-status ap-status--${className}`}>
      {value}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="ap-section-heading">
      <div>
        <span className="ap-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="ap-search">
      <span aria-hidden="true">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}

function StatCard({ icon, label, value, note, variant = "" }) {
  return (
    <article className={`ap-stat ${variant}`}>
      <div className="ap-stat-top">
        <span>{label}</span>
        <span className="ap-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="ap-empty">
      <span>✧</span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="ap-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ap-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="ap-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
          type="button"
        >
          ×
        </button>
        <span className="ap-eyebrow">VIRSA ADMINISTRATION</span>
        <h2>{title}</h2>
        {subtitle && <p className="ap-modal-subtitle">{subtitle}</p>}
        {children}
      </section>
    </div>
  );
}

function DetailModal({ item, onClose, onAction }) {
  if (!item) return null;

  return (
    <Modal
      title={item.name || item.title || item.id}
      subtitle={`Reference ID: ${item.id}`}
      onClose={onClose}
    >
      <div className="ap-detail-list">
        {Object.entries(item).map(([key, value]) => (
          <div key={key}>
            <small>{key.replace(/([A-Z])/g, " $1")}</small>
            <strong>
              {key === "price" || key === "amount"
                ? `₹${Number(value).toLocaleString("en-IN")}`
                : String(value)}
            </strong>
          </div>
        ))}
      </div>
      <p className="ap-detail-description">
        This is sample demonstration data. Verify the relevant evidence
        before taking an actual moderation decision.
      </p>
      <div className="ap-modal-actions">
        <button className="ap-button ap-button-quiet" onClick={onClose}>
          Close
        </button>
        {onAction}
      </div>
    </Modal>
  );
}

export default function AdminPanel({
  onBack = () => {},
  onSignOut = () => {},
}) {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [sellers, setSellers] = useState(() =>
    readStorage("virsa-admin-sellers", initialSellers)
  );
  const [listings, setListings] = useState(() =>
    readStorage("virsa-admin-listings", initialListings)
  );
  const [reports, setReports] = useState(() =>
    readStorage("virsa-admin-reports", initialReports)
  );
  const [announcements, setAnnouncements] = useState(() =>
    readStorage("virsa-admin-announcements", initialAnnouncements)
  );
  const [transactions] = useState(() =>
    readStorage("virsa-admin-transactions", initialTransactions)
  );

  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState("All");
  const [listingSearch, setListingSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("All");
  const [reportFilter, setReportFilter] = useState("All");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    category: "Community Bulletin",
    message: "",
  });

  const [settings, setSettings] = useState(() =>
    readStorage("virsa-admin-settings", {
      sellerNotifications: true,
      reportNotifications: true,
      maintenanceMode: false,
    })
  );

  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The panel remains usable for the current session.
    }
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function changePage(id) {
    setActivePage(id);
    setMobileOpen(false);
    setModal(null);
  }

  function updateCollection(setter, key, updater) {
    setter((previous) => {
      const next = updater(previous);
      persist(key, next);
      return next;
    });
  }

  function updateStatus(collection, id, status) {
    const config = {
      sellers: {
        data: sellers,
        setter: setSellers,
        key: "virsa-admin-sellers",
      },
      listings: {
        data: listings,
        setter: setListings,
        key: "virsa-admin-listings",
      },
      reports: {
        data: reports,
        setter: setReports,
        key: "virsa-admin-reports",
      },
      announcements: {
        data: announcements,
        setter: setAnnouncements,
        key: "virsa-admin-announcements",
      },
    };

    const selected = config[collection];
    if (!selected) return;

    updateCollection(selected.setter, selected.key, (previous) =>
      previous.map((item) => (item.id === id ? { ...item, status } : item))
    );

    setModal(null);
    notify(`Status updated to "${status}".`);
  }

  const pendingSellers = sellers.filter(
    (seller) => seller.status === "Pending"
  ).length;

  const pendingListings = listings.filter(
    (listing) =>
      listing.status === "Pending" || listing.status === "Needs Changes"
  ).length;

  const openReports = reports.filter(
    (report) => report.status !== "Resolved" && report.status !== "Closed"
  ).length;

  const sellerRows = useMemo(() => {
    const query = sellerSearch.toLowerCase().trim();
    return sellers.filter((seller) => {
      const matchesQuery = [
        seller.id,
        seller.name,
        seller.owner,
        seller.state,
        seller.craft,
      ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesQuery &&
        (sellerFilter === "All" || seller.status === sellerFilter)
      );
    });
  }, [sellers, sellerSearch, sellerFilter]);

  const listingRows = useMemo(() => {
    const query = listingSearch.toLowerCase().trim();
    return listings.filter((listing) => {
      const matchesQuery = [
        listing.id,
        listing.name,
        listing.seller,
        listing.category,
      ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesQuery &&
        (listingFilter === "All" || listing.status === listingFilter)
      );
    });
  }, [listings, listingSearch, listingFilter]);

  const reportRows = useMemo(
    () =>
      reports.filter(
        (report) =>
          reportFilter === "All" || report.status === reportFilter
      ),
    [reports, reportFilter]
  );

  const transactionRows = useMemo(() => {
    const query = transactionSearch.toLowerCase().trim();
    return transactions.filter((transaction) =>
      [
        transaction.id,
        transaction.order,
        transaction.seller,
        transaction.status,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [transactions, transactionSearch]);

  const announcementRows = useMemo(() => {
    const query = announcementSearch.toLowerCase().trim();
    return announcements.filter((announcement) =>
      [
        announcement.title,
        announcement.category,
        announcement.message,
        announcement.status,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [announcements, announcementSearch]);

  const revenue = transactions
    .filter((transaction) => transaction.status === "Paid")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  function createAnnouncement(event) {
    event.preventDefault();

    const title = announcementForm.title.trim();
    const message = announcementForm.message.trim();

    if (!title || !message) {
      notify("Please complete the announcement title and message.");
      return;
    }

    const newAnnouncement = {
      id: `ANN-${Date.now().toString().slice(-6)}`,
      title,
      category: announcementForm.category,
      message,
      status: "Draft",
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    updateCollection(
      setAnnouncements,
      "virsa-admin-announcements",
      (previous) => [newAnnouncement, ...previous]
    );

    setAnnouncementForm({
      title: "",
      category: "Community Bulletin",
      message: "",
    });

    setModal(null);
    notify("Announcement saved as a draft.");
  }

  function updateSetting(key, value) {
    setSettings((previous) => {
      const next = { ...previous, [key]: value };
      persist("virsa-admin-settings", next);
      return next;
    });
    notify("Admin preference updated.");
  }

  function renderSellerTable() {
    return (
      <div className="ap-card">
        <div className="ap-toolbar">
          <SearchBox
            value={sellerSearch}
            onChange={setSellerSearch}
            placeholder="Search sellers, craft or state..."
          />
          <select
            value={sellerFilter}
            onChange={(event) => setSellerFilter(event.target.value)}
            aria-label="Filter sellers by status"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs Changes</option>
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Craft / State</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerRows.map((seller) => (
                <tr key={seller.id}>
                  <td>
                    <strong>{seller.name}</strong>
                    <small>{seller.owner} · {seller.id}</small>
                  </td>
                  <td>
                    <strong>{seller.craft}</strong>
                    <small>{seller.state}</small>
                  </td>
                  <td>{seller.submitted}</td>
                  <td><Status value={seller.status} /></td>
                  <td>
                    <div className="ap-row-actions">
                      <button
                        className="ap-button ap-button-quiet"
                        onClick={() => setModal({ type: "seller", item: seller })}
                      >
                        Review
                      </button>
                      {seller.status !== "Approved" && (
                        <button
                          className="ap-button ap-button-primary"
                          onClick={() => updateStatus("sellers", seller.id, "Approved")}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sellerRows.length === 0 && (
            <EmptyState title="No sellers found" message="Try another search or status filter." />
          )}
        </div>
      </div>
    );
  }

  function renderListingTable() {
    return (
      <div className="ap-card">
        <div className="ap-toolbar">
          <SearchBox
            value={listingSearch}
            onChange={setListingSearch}
            placeholder="Search products or sellers..."
          />
          <select
            value={listingFilter}
            onChange={(event) => setListingFilter(event.target.value)}
            aria-label="Filter product listings"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs Changes</option>
          </select>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listingRows.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <strong>{listing.name}</strong>
                    <small>{listing.id}</small>
                  </td>
                  <td>{listing.seller}</td>
                  <td>{listing.category}</td>
                  <td className="ap-money">
                    ₹{listing.price.toLocaleString("en-IN")}
                  </td>
                  <td><Status value={listing.status} /></td>
                  <td>
                    <div className="ap-row-actions">
                      <button
                        className="ap-button ap-button-quiet"
                        onClick={() => setModal({ type: "listing", item: listing })}
                      >
                        Review
                      </button>
                      {listing.status !== "Approved" && (
                        <button
                          className="ap-button ap-button-primary"
                          onClick={() => updateStatus("listings", listing.id, "Approved")}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listingRows.length === 0 && (
            <EmptyState title="No listings found" message="Try a different filter." />
          )}
        </div>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <div className="ap-page-content">
        <section className="ap-welcome">
          <div className="ap-welcome-copy">
            <span className="ap-eyebrow ap-eyebrow-light">
              THE CUSTODIANS OF TRUST
            </span>
            <h2>Preserving heritage.<br /><em>Protecting trust.</em></h2>
            <p>
              Every craft has a story. Every artisan deserves a trusted
              place to tell it.
            </p>
            <div className="ap-welcome-meta">
              <span>✧</span>
              <span>VIRSA Platform Administration</span>
              <span className="ap-meta-dot" />
              <span>Operations overview</span>
            </div>
          </div>
          <div className="ap-welcome-art" aria-hidden="true">
            <div className="ap-art-ring ap-ring-one" />
            <div className="ap-art-ring ap-ring-two" />
            <span>वि</span>
            <small>HERITAGE · AUTHENTICITY · TRUST</small>
          </div>
        </section>

        <section className="ap-stats-grid">
          <StatCard
            icon="♙"
            label="Seller Applications"
            value={pendingSellers}
            note="Awaiting verification"
            variant="ap-stat-burgundy"
          />
          <StatCard
            icon="▧"
            label="Listings to Review"
            value={pendingListings}
            note="Pending or needing changes"
          />
          <StatCard
            icon="⚖"
            label="Open Reports"
            value={openReports}
            note="Require administrative attention"
            variant="ap-stat-gold"
          />
          <StatCard
            icon="₹"
            label="Recorded Paid Sales"
            value={`₹${revenue.toLocaleString("en-IN")}`}
            note="Sample transaction records"
          />
        </section>

        <section className="ap-overview-grid">
          <div className="ap-card">
            <div className="ap-card-heading">
              <div>
                <span className="ap-eyebrow">REQUIRES ATTENTION</span>
                <h3>Seller verification queue</h3>
              </div>
              <button className="ap-text-button" onClick={() => changePage("sellers")}>
                View all →
              </button>
            </div>

            {sellers.filter((seller) => seller.status === "Pending").length === 0 ? (
              <EmptyState title="Queue is clear" message="No pending seller applications." />
            ) : (
              sellers.filter((seller) => seller.status === "Pending").slice(0, 4).map((seller) => (
                <div className="ap-queue-row" key={seller.id}>
                  <div className="ap-avatar">{seller.name.charAt(0)}</div>
                  <div className="ap-queue-info">
                    <strong>{seller.name}</strong>
                    <span>{seller.craft} · {seller.state}</span>
                  </div>
                  <button
                    className="ap-icon-button"
                    title="Review application"
                    onClick={() => setModal({ type: "seller", item: seller })}
                  >
                    ↗
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="ap-card">
            <div className="ap-card-heading">
              <div>
                <span className="ap-eyebrow">PLATFORM ACTIVITY</span>
                <h3>Recent updates</h3>
              </div>
              <span className="ap-live-dot">Demo feed</span>
            </div>

            <div className="ap-timeline">
              <div className="ap-timeline-item">
                <span className="ap-timeline-icon">♙</span>
                <div><strong>Seller applications</strong><p>{pendingSellers} application(s) awaiting review.</p><small>Current demo data</small></div>
              </div>
              <div className="ap-timeline-item">
                <span className="ap-timeline-icon">▧</span>
                <div><strong>Product moderation</strong><p>{pendingListings} listing(s) need attention.</p><small>Current demo data</small></div>
              </div>
              <div className="ap-timeline-item">
                <span className="ap-timeline-icon">⚖</span>
                <div><strong>Trust & safety</strong><p>{openReports} report(s) remain unresolved.</p><small>Current demo data</small></div>
              </div>
              <div className="ap-timeline-item">
                <span className="ap-timeline-icon">✧</span>
                <div><strong>Community bulletin</strong><p>{announcements.length} announcement(s) in the board.</p><small>Current demo data</small></div>
              </div>
            </div>
          </div>
        </section>

        <div className="ap-inline-note">
          <span>i</span>
          <p>
            <strong>Prototype notice:</strong> This panel currently uses
            sample records stored in this browser. Real identity verification,
            user accounts, payments, and moderation permissions need a
            secure backend.
          </p>
        </div>
      </div>
    );
  }

  function renderSellers() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="TRUST BEGINS WITH THE MAKER"
          title="Seller Applications"
          description="Review artisan registrations and verify their authorization before they join the marketplace."
        />
        <section className="ap-stats-grid ap-stats-compact">
          <StatCard icon="◷" label="Pending" value={pendingSellers} note="Awaiting a decision" />
          <StatCard icon="✓" label="Approved" value={sellers.filter((item) => item.status === "Approved").length} note="Verified in this demo" />
          <StatCard icon="↺" label="Needs Changes" value={sellers.filter((item) => item.status === "Needs Changes").length} note="Further evidence requested" />
        </section>
        {renderSellerTable()}
      </div>
    );
  }

  function renderListings() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="AUTHENTICITY & QUALITY"
          title="Product Listings"
          description="Moderate product descriptions, craft claims, and marketplace listings."
        />
        <div className="ap-inline-note">
          <span>i</span>
          <p>Check product details and supporting evidence before approval. Sample products are provided for demonstration.</p>
        </div>
        {renderListingTable()}
      </div>
    );
  }

  function renderDisputes() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="TRUST & SAFETY"
          title="Disputes & Reports"
          description="Track reported listings, customer concerns, and issues requiring administrative review."
        />
        <div className="ap-card">
          <div className="ap-toolbar">
            <p className="ap-muted-note">Select a report to inspect its details and update its status.</p>
            <select
              value={reportFilter}
              onChange={(event) => setReportFilter(event.target.value)}
              aria-label="Filter reports"
            >
              <option>All</option>
              <option>Open</option>
              <option>Under Review</option>
              <option>Evidence Requested</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr><th>Report</th><th>Reported by</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reportRows.map((report) => (
                  <tr key={report.id}>
                    <td><strong>{report.title}</strong><small>{report.id} · {report.subject}</small></td>
                    <td>{report.reporter}</td>
                    <td><Status value={report.priority} /></td>
                    <td><Status value={report.status} /></td>
                    <td>
                      <button className="ap-button ap-button-quiet" onClick={() => setModal({ type: "report", item: report })}>
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportRows.length === 0 && <EmptyState title="No reports found" message="No reports match this status." />}
          </div>
        </div>
      </div>
    );
  }

  function renderBulletin() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="THE VOICE OF VIRSA"
          title="Bulletin Board"
          description="Create community updates, seasonal campaigns, and important marketplace announcements."
          action={
            <button
              className="ap-button ap-button-primary"
              onClick={() => setModal({ type: "announcement-create" })}
            >
              + New announcement
            </button>
          }
        />
        <div className="ap-toolbar">
          <SearchBox value={announcementSearch} onChange={setAnnouncementSearch} placeholder="Search announcements..." />
        </div>
        <div className="ap-announcement-grid">
          {announcementRows.map((announcement) => (
            <article className="ap-announcement-card" key={announcement.id}>
              <div className="ap-announcement-top">
                <span className="ap-announcement-symbol">✧</span>
                <Status value={announcement.status} />
              </div>
              <span className="ap-eyebrow">{announcement.category}</span>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <div className="ap-muted-note">{announcement.id} · {announcement.date}</div>
              <div className="ap-announcement-actions">
                <button
                  className="ap-button ap-button-quiet"
                  onClick={() => setModal({ type: "announcement", item: announcement })}
                >
                  View details
                </button>
                {announcement.status !== "Published" ? (
                  <button
                    className="ap-button ap-button-gold"
                    onClick={() => updateStatus("announcements", announcement.id, "Published")}
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    className="ap-button ap-button-danger"
                    onClick={() => updateStatus("announcements", announcement.id, "Draft")}
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {announcementRows.length === 0 && (
          <div className="ap-card"><EmptyState title="No announcements found" message="Try a different search or create a new announcement." /></div>
        )}
      </div>
    );
  }

  function renderTransactions() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="MARKETPLACE OPERATIONS"
          title="Transactions"
          description="Review sample order payments and transaction records. No actual payments are processed here."
        />
        <section className="ap-stats-grid ap-stats-compact">
          <StatCard icon="₹" label="Paid total" value={`₹${revenue.toLocaleString("en-IN")}`} note="Sample paid records" />
          <StatCard icon="✓" label="Paid orders" value={transactions.filter((item) => item.status === "Paid").length} note="Recorded as paid" />
          <StatCard icon="◷" label="Processing" value={transactions.filter((item) => item.status === "Processing").length} note="Sample transaction state" />
        </section>
        <div className="ap-card">
          <div className="ap-toolbar">
            <SearchBox value={transactionSearch} onChange={setTransactionSearch} placeholder="Search order, seller or transaction..." />
          </div>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr><th>Transaction</th><th>Order</th><th>Seller</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {transactionRows.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><strong>{transaction.id}</strong></td>
                    <td>{transaction.order}</td>
                    <td>{transaction.seller}</td>
                    <td className="ap-money">₹{transaction.amount.toLocaleString("en-IN")}</td>
                    <td><Status value={transaction.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactionRows.length === 0 && <EmptyState title="No transactions found" message="Try another search term." />}
          </div>
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="ap-page-content">
        <SectionHeading
          eyebrow="PLATFORM CONFIGURATION"
          title="Admin Settings"
          description="Manage local prototype preferences for platform administration."
        />
        <div className="ap-card ap-settings-card">
          <div className="ap-card-heading">
            <div><span className="ap-eyebrow">PREFERENCES</span><h3>Notifications & operations</h3></div>
            <span className="ap-settings-icon">⚙</span>
          </div>
          <label className="ap-setting-row">
            <span><strong>Seller application alerts</strong><small>Show a preference for notifications when seller applications need attention.</small></span>
            <input type="checkbox" checked={settings.sellerNotifications} onChange={(event) => updateSetting("sellerNotifications", event.target.checked)} />
          </label>
          <label className="ap-setting-row">
            <span><strong>Trust & safety alerts</strong><small>Show a preference for notifications about new reports and disputes.</small></span>
            <input type="checkbox" checked={settings.reportNotifications} onChange={(event) => updateSetting("reportNotifications", event.target.checked)} />
          </label>
          <label className="ap-setting-row">
            <span><strong>Maintenance mode (demo preference)</strong><small>This toggle only saves a local preference. It does not take the live website offline.</small></span>
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(event) => updateSetting("maintenanceMode", event.target.checked)} />
          </label>
        </div>
        <div className="ap-card ap-security-note">
          <span>♙</span>
          <div>
            <h3>Security reminder</h3>
            <p>
              A production admin panel must enforce administrator roles on the
              server, protect sensitive actions, validate evidence, and record
              an audit trail. Hiding a page in React is not access control.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "sellers": return renderSellers();
      case "listings": return renderListings();
      case "disputes": return renderDisputes();
      case "bulletin": return renderBulletin();
      case "transactions": return renderTransactions();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  }

  function renderModal() {
    if (!modal) return null;

    if (modal.type === "announcement-create") {
      return (
        <Modal
          title="Create an announcement"
          subtitle="Your new announcement will be saved as a draft."
          onClose={() => setModal(null)}
        >
          <form onSubmit={createAnnouncement}>
            <label className="ap-form-label">
              Announcement title
              <input
                value={announcementForm.title}
                onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })}
                placeholder="e.g. A celebration of Indian crafts"
                required
              />
            </label>
            <label className="ap-form-label">
              Category
              <select
                value={announcementForm.category}
                onChange={(event) => setAnnouncementForm({ ...announcementForm, category: event.target.value })}
              >
                <option>Community Bulletin</option>
                <option>Festival Campaign</option>
                <option>Platform Update</option>
                <option>Artisan Spotlight</option>
              </select>
            </label>
            <label className="ap-form-label">
              Message
              <textarea
                value={announcementForm.message}
                onChange={(event) => setAnnouncementForm({ ...announcementForm, message: event.target.value })}
                placeholder="Write the announcement for your community..."
                rows={4}
                required
              />
            </label>
            <div className="ap-modal-actions">
              <button type="button" className="ap-button ap-button-quiet" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="ap-button ap-button-primary">Save draft</button>
            </div>
          </form>
        </Modal>
      );
    }

    const { type, item } = modal;

    if (type === "seller") {
      return (
        <DetailModal
          item={item}
          onClose={() => setModal(null)}
          onAction={
            <>
              <button className="ap-button ap-button-danger" onClick={() => updateStatus("sellers", item.id, "Rejected")}>Reject</button>
              <button className="ap-button ap-button-quiet" onClick={() => updateStatus("sellers", item.id, "Needs Changes")}>Request evidence</button>
              <button className="ap-button ap-button-primary" onClick={() => updateStatus("sellers", item.id, "Approved")}>Approve seller</button>
            </>
          }
        />
      );
    }

    if (type === "listing") {
      return (
        <DetailModal
          item={item}
          onClose={() => setModal(null)}
          onAction={
            <>
              <button className="ap-button ap-button-danger" onClick={() => updateStatus("listings", item.id, "Rejected")}>Reject</button>
              <button className="ap-button ap-button-quiet" onClick={() => updateStatus("listings", item.id, "Needs Changes")}>Request changes</button>
              <button className="ap-button ap-button-primary" onClick={() => updateStatus("listings", item.id, "Approved")}>Approve listing</button>
            </>
          }
        />
      );
    }

    if (type === "report") {
      return (
        <DetailModal
          item={item}
          onClose={() => setModal(null)}
          onAction={
            <>
              <button className="ap-button ap-button-quiet" onClick={() => updateStatus("reports", item.id, "Evidence Requested")}>Request evidence</button>
              <button className="ap-button ap-button-gold" onClick={() => updateStatus("reports", item.id, "Under Review")}>Under review</button>
              <button className="ap-button ap-button-primary" onClick={() => updateStatus("reports", item.id, "Resolved")}>Resolve</button>
            </>
          }
        />
      );
    }

    return (
      <DetailModal
        item={item}
        onClose={() => setModal(null)}
        onAction={
          <button className="ap-button ap-button-primary" onClick={() => setModal(null)}>Done</button>
        }
      />
    );
  }

  return (
    <div className="ap-shell">
      {mobileOpen && (
        <button
          className="ap-mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`ap-sidebar ${mobileOpen ? "ap-sidebar-open" : ""}`}>
        <button className="ap-brand" onClick={() => changePage("dashboard")} aria-label="VIRSA admin dashboard">
          <span className="ap-brand-mark">वि</span>
          <span><strong>VIRSA</strong><small>ADMINISTRATION</small></span>
        </button>

        {navGroups.map((group) => (
          <div className="ap-nav-group" key={group.label}>
            <div className="ap-sidebar-label">{group.label}</div>
            <nav className="ap-nav">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`ap-nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => changePage(item.id)}
                >
                  <span className="ap-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.count && pendingSellers > 0 && (
                    <span className="ap-nav-count">{pendingSellers}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}

        <div className="ap-sidebar-bottom">
          <div className="ap-sidebar-motif">✧</div>
          <p>Honouring the hands<br />that <em>shape our heritage.</em></p>
          <div className="ap-admin-mini">
            <span className="ap-admin-avatar">A</span>
            <span><strong>Platform Admin</strong><small>Administrator demo</small></span>
            <span className="ap-online-dot" title="Demo session" />
          </div>
          <button className="ap-back-home" onClick={onBack}>← Back to VIRSA</button>
          <button className="ap-signout" onClick={onSignOut}>↪ Sign out</button>
        </div>
      </aside>

      <main className="ap-main">
        <header className="ap-topbar">
          <button
            className="ap-menu-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <div className="ap-breadcrumb">
            VIRSA <b>/</b> Administration <b>/</b> <strong>{pageTitles[activePage]}</strong>
          </div>
          <div className="ap-topbar-right">
            <span className="ap-demo-pill"><i /> Demo environment</span>
            <div className="ap-top-admin">
              <span className="ap-admin-avatar">A</span>
              <span><strong>Platform Admin</strong><small>Trust & Operations</small></span>
            </div>
          </div>
        </header>

        <div className="ap-content">{renderPage()}</div>

        <footer className="ap-footer">
          <span>✧ VIRSA</span>
          <span>Preserving India's craft heritage · Admin prototype</span>
          <span>© 2026 VIRSA</span>
        </footer>
      </main>

      {renderModal()}

      {toast && (
        <div className="ap-toast" role="status">
          <span>✓</span>{toast}
        </div>
      )}
    </div>
  );
}
