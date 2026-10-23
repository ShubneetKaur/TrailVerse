
import { useRef, useState } from "react";
import "./tracking.css";

// VIRSA Order Tracking Page
// This is a frontend demo. Connect APIs and persistent image storage
// before using it with real customer orders.

const INITIAL_ORDER = {
  id: "MTO-98231-XYZ",
  productName: "Handcrafted Decorative Pottery",
  productImage:
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85",
  creatorName: "Alex K.",
  creatorRating: "4.9",
  estimatedDelivery: "Thursday, Oct 29",
  currentStage: 1,
  courierName: "Awaiting dispatch",
  trackingNumber: "",
  paymentStatus: "Payment confirmed",
};

const INITIAL_EVIDENCE = [
  {
    id: "photo-1",
    title: "Product front view",
    description: "Pre-shipment condition",
    uploadedAt: "Oct 24, 2026 · 10:42 AM",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "photo-2",
    title: "Product details",
    description: "Craftsmanship close-up",
    uploadedAt: "Oct 24, 2026 · 10:45 AM",
    image:
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "photo-3",
    title: "Packaging preparation",
    description: "Packing reference",
    uploadedAt: "Oct 24, 2026 · 10:48 AM",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=900&q=85",
  },
];

const STAGES = [
  {
    label: "Order Placed & Funded",
    date: "Order confirmed",
    icon: "✓",
  },
  {
    label: "In Production",
    date: "Artisan is creating your item",
    icon: "✳",
  },
  {
    label: "Quality Verified",
    date: "Quality check pending",
    icon: "◇",
  },
  {
    label: "Shipped & In Transit",
    date: "Awaiting dispatch",
    icon: "↗",
  },
  {
    label: "Delivered",
    date: "Delivery pending",
    icon: "✓",
  },
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Payment confirmed, brief sent",
    description:
      "Your order details have been recorded for the creator.",
    date: "Order confirmation",
    complete: true,
  },
  {
    id: 2,
    title: "Artisan started production",
    description:
      "Your handcrafted item is being prepared.",
    date: "Production update",
    complete: true,
  },
  {
    id: 3,
    title: "Quality check",
    description:
      "The product will be checked before it is dispatched.",
    date: "Pending",
    complete: false,
  },
  {
    id: 4,
    title: "Package picked up by courier",
    description:
      "Courier pickup details will appear once the order ships.",
    date: "Pending",
    complete: false,
  },
  {
    id: 5,
    title: "Delivered",
    description:
      "Delivery confirmation will appear after the order arrives.",
    date: "Pending",
    complete: false,
  },
];

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    truck: (
      <>
        <path d="M3 6h11v12H3z" />
        <path d="M14 10h4l3 4v4h-7" />
        <circle cx="7.5" cy="18" r="1.8" />
        <circle cx="17.5" cy="18" r="1.8" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
      </>
    ),
    alert: (
      <>
        <path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.package}</svg>;
}

export default function Tracking() {
  const [order] = useState(INITIAL_ORDER);
  const evidence = INITIAL_EVIDENCE;
  const [events] = useState(INITIAL_EVENTS);
  const [selectedImage, setSelectedImage] = useState(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [issueType, setIssueType] = useState("Damaged product");
  const [issueDescription, setIssueDescription] = useState("");
  const [customerPhotos, setCustomerPhotos] = useState([]);
  const [notice, setNotice] = useState("");
  const customerPhotoInput = useRef(null);

  const currentStage = order.currentStage;

  function handleCustomerPhotoUpload(event) {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setNotice("Please select image files.");
      return;
    }

    const remaining = Math.max(0, 5 - customerPhotos.length);
    const accepted = imageFiles.slice(0, remaining);

    if (accepted.length === 0) {
      setNotice("You can attach up to 5 delivery photos.");
      return;
    }

    const newPhotos = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setCustomerPhotos((previous) => [...previous, ...newPhotos]);
    setNotice(
      "Photos added to this demo report. They are not uploaded to a server."
    );
    event.target.value = "";
  }

  function removeCustomerPhoto(id) {
    setCustomerPhotos((previous) => {
      const photo = previous.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return previous.filter((item) => item.id !== id);
    });
  }

  function handleSubmitIssue(event) {
    event.preventDefault();

    if (!issueDescription.trim()) {
      setNotice("Please describe the issue before submitting.");
      return;
    }

    setNotice(
      "Demo report prepared. Connect the support API to submit this issue."
    );
    setIssueOpen(false);
  }

  function handleSendMessage(event) {
    event.preventDefault();

    if (!message.trim()) {
      setNotice("Please write a message first.");
      return;
    }

    setNotice(
      "Your demo message is ready. Connect seller messaging to send it."
    );
    setMessage("");
    setMessageOpen(false);
  }

  async function copyTrackingNumber() {
    if (!order.trackingNumber) {
      setNotice("The courier tracking number is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      setNotice("Tracking number copied.");
    } catch {
      setNotice("Unable to copy automatically. Please copy the number manually.");
    }
  }

  return (
    <main className="tracking-page">
      <div className="tracking-container">
        {notice && (
          <div className="tracking-success" role="status">
            {notice}
            <button
              type="button"
              className="tracking-button tracking-button-small tracking-button-secondary"
              style={{ marginLeft: 12 }}
              onClick={() => setNotice("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Order summary */}

        <section className="tracking-order-summary">
          <div>
            <p className="tracking-order-id">Order #{order.id}</p>
            <h1 className="tracking-delivery-heading">
              Arriving by {order.estimatedDelivery}
            </h1>
            <p className="tracking-delivery-subtitle">
              {order.productName} · Follow your order from creation to delivery.
            </p>
            <div className="tracking-workspace-actions">
              <button
                type="button"
                className="tracking-button tracking-button-secondary"
                onClick={() =>
                  setNotice(
                    `Order ${order.id}: ${order.productName}. Payment: ${order.paymentStatus}.`
                  )
                }
              >
                <Icon name="package" size={17} />
                View Order Details
              </button>
              <button
                type="button"
                className="tracking-button tracking-button-secondary"
                onClick={() => setIssueOpen(true)}
              >
                <Icon name="alert" size={17} />
                Need Help?
              </button>
            </div>
          </div>

          <div className="tracking-creator">
            <div className="tracking-creator-avatar">AK</div>
            <div>
              <span className="tracking-creator-label">Crafted by</span>
              <h2 className="tracking-creator-name">{order.creatorName}</h2>
              <span className="tracking-creator-rating">
                ★ {order.creatorRating} · VIRSA Creator
              </span>
            </div>
          </div>
        </section>

        {/* 2. Five-stage progress tracker */}

        <section className="tracking-section tracking-progress-section">
          <div className="tracking-section-header">
            <div className="tracking-section-icon">
              <Icon name="package" size={22} />
            </div>
            <div>
              <h2 className="tracking-section-title">Order Progress</h2>
              <p className="tracking-section-description">
                Follow every milestone as your handmade product makes its way
                to you.
              </p>
            </div>
          </div>

          <div className="tracking-progress">
            {STAGES.map((stage, index) => {
              const isComplete = index < currentStage;
              const isActive = index === currentStage;

              return (
                <div
                  key={stage.label}
                  className={[
                    "tracking-progress-step",
                    isComplete ? "is-complete" : "",
                    isActive ? "is-active" : "",
                    index > currentStage ? "is-pending" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {index < STAGES.length - 1 && (
                    <div
                      className={`tracking-progress-track ${
                        index < currentStage ? "is-complete" : ""
                      }`}
                    />
                  )}

                  <div className="tracking-progress-node">
                    {isComplete ? (
                      <Icon name="check" size={21} />
                    ) : index === 3 ? (
                      <Icon name="truck" size={20} />
                    ) : index === 4 ? (
                      <Icon name="package" size={20} />
                    ) : (
                      stage.icon
                    )}
                  </div>

                  <h3 className="tracking-progress-label">{stage.label}</h3>
                  <p className="tracking-progress-date">
                    {isActive && index === 1
                      ? "Estimated completion in 48 hours"
                      : isComplete
                        ? stage.date
                        : index === currentStage
                          ? stage.date
                          : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Artisan workspace */}

        <section className="tracking-section">
          <div className="tracking-section-header">
            <div className="tracking-section-icon">
              <Icon name="image" size={22} />
            </div>
            <div>
              <h2 className="tracking-section-title">Artisan Workspace</h2>
              <p className="tracking-section-description">
                See creation updates and stay connected with your creator.
              </p>
            </div>
          </div>

          <div className="tracking-workspace">
            <div className="tracking-workspace-card">
              <div className="tracking-workspace-heading">
                <h3 className="tracking-workspace-title">Proof of Creation</h3>
                <span className="tracking-status-badge">
                  In Production
                </span>
              </div>

              <p className="tracking-workspace-description">
                This is a demo progress photo. In the live platform, the seller
                will upload real photos as your custom product is created.
              </p>

              <div className="tracking-evidence-gallery">
                <div className="tracking-evidence-item">
                  <div className="tracking-evidence-image-wrapper">
                    <img
                      className="tracking-evidence-image"
                      src={order.productImage}
                      alt="Example handmade pottery product"
                    />
                  </div>
                  <div className="tracking-evidence-caption">
                    <strong>Creation progress</strong>
                    <span>Example image</span>
                  </div>
                </div>
              </div>

              <div className="tracking-workspace-actions">
                <button
                  type="button"
                  className="tracking-button tracking-button-primary"
                  onClick={() => setSelectedImage({
                    image: order.productImage,
                    title: "Proof of Creation",
                  })}
                >
                  <Icon name="eye" size={18} />
                  Review Creation Photo
                </button>

                <button
                  type="button"
                  className="tracking-button tracking-button-secondary"
                  onClick={() => setMessageOpen(true)}
                >
                  <Icon name="message" size={18} />
                  Message Seller
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Multiple pre-shipment photos */}

        <section className="tracking-section">
          <div className="tracking-section-header">
            <div className="tracking-section-icon">
              <Icon name="image" size={22} />
            </div>
            <div>
              <h2 className="tracking-section-title">
                Pre-Shipment Photo Evidence
              </h2>
              <p className="tracking-section-description">
                View the product's condition before dispatch. These reference
                photos can help document its condition if transit damage occurs.
              </p>
            </div>
          </div>

          <div className="tracking-evidence-section">
            <div className="tracking-evidence-header">
              <div>
                <h3 className="tracking-evidence-title">
                  Seller's Dispatch Photos
                </h3>
                <p className="tracking-evidence-description">
                  Multiple views of the item before it leaves the seller.
                  Original upload times should be recorded by the backend.
                </p>
              </div>
              <span className="tracking-status-badge">
                {evidence.length} reference photos
              </span>
            </div>

            <div className="tracking-evidence-notice">
              <Icon name="shield" size={20} />
              <span>
                Photo evidence helps document the item's pre-shipment condition.
                It does not by itself prove when or how damage occurred.
              </span>
            </div>

            <div className="tracking-evidence-gallery">
              {evidence.map((photo) => (
                <article className="tracking-evidence-item" key={photo.id}>
                  <div className="tracking-evidence-image-wrapper">
                    <img
                      className="tracking-evidence-image"
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="tracking-evidence-caption">
                    <strong>{photo.title}</strong>
                    <span>{photo.description}</span>
                    <br />
                    <span>{photo.uploadedAt}</span>

                    <button
                      type="button"
                      className="tracking-button tracking-button-secondary tracking-button-small"
                      style={{ marginTop: 10, width: "100%" }}
                      onClick={() =>
                        setSelectedImage({
                          image: photo.image,
                          title: photo.title,
                        })
                      }
                    >
                      <Icon name="eye" size={15} />
                      View Photo
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="tracking-evidence-actions">
              <button
                type="button"
                className="tracking-button tracking-button-secondary"
                onClick={() =>
                  setNotice(
                    "These are demo reference photos. Live seller uploads will be retrieved from secure storage."
                  )
                }
              >
                <Icon name="image" size={17} />
                View All Evidence
              </button>

              <button
                type="button"
                className="tracking-button tracking-button-danger"
                onClick={() => setIssueOpen(true)}
              >
                <Icon name="alert" size={17} />
                Report Transit Damage
              </button>
            </div>
          </div>
        </section>

        {/* 5. Shipment tracking */}

        <section className="tracking-section">
          <div className="tracking-section-header">
            <div className="tracking-section-icon">
              <Icon name="truck" size={22} />
            </div>
            <div>
              <h2 className="tracking-section-title">Shipment Tracking</h2>
              <p className="tracking-section-description">
                Courier details will appear once your product has been
                dispatched.
              </p>
            </div>
          </div>

          <div className="tracking-shipment-grid">
            <div className="tracking-shipment-item">
              <span className="tracking-shipment-label">Courier partner</span>
              <span className="tracking-shipment-value">
                {order.courierName}
              </span>
            </div>

            <div className="tracking-shipment-item">
              <span className="tracking-shipment-label">Tracking number</span>
              <span className="tracking-shipment-value">
                {order.trackingNumber || "Not assigned yet"}
              </span>
            </div>

            <div className="tracking-shipment-item">
              <span className="tracking-shipment-label">Delivery estimate</span>
              <span className="tracking-shipment-value">
                {order.estimatedDelivery}
              </span>
            </div>
          </div>

          <div className="tracking-shipment-actions">
            <button
              type="button"
              className="tracking-button tracking-button-primary"
              disabled={!order.trackingNumber}
              onClick={() =>
                setNotice("Connect your courier tracking integration first.")
              }
            >
              <Icon name="truck" size={17} />
              Track with Courier
            </button>

            <button
              type="button"
              className="tracking-button tracking-button-secondary"
              onClick={copyTrackingNumber}
            >
              <Icon name="copy" size={17} />
              Copy Tracking ID
            </button>
          </div>
        </section>

        {/* 6. Order activity timeline */}

        <section className="tracking-section">
          <div className="tracking-section-header">
            <div className="tracking-section-icon">
              <Icon name="clock" size={22} />
            </div>
            <div>
              <h2 className="tracking-section-title">Order Activity</h2>
              <p className="tracking-section-description">
                Follow the milestones in your order journey.
              </p>
            </div>
          </div>

          <div className="tracking-timeline">
            {events.map((event) => (
              <article
                key={event.id}
                className={`tracking-timeline-item ${
                  event.complete ? "is-complete" : ""
                }`}
              >
                <div className="tracking-timeline-rail">
                  <div className="tracking-timeline-node">
                    {event.complete ? (
                      <Icon name="check" size={19} />
                    ) : (
                      <Icon name="clock" size={17} />
                    )}
                  </div>
                </div>

                <div className="tracking-timeline-content">
                  <h3 className="tracking-timeline-title">{event.title}</h3>
                  <p className="tracking-timeline-description">
                    {event.description}
                  </p>
                  <span className="tracking-timeline-date">{event.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 7. Payment protection */}

        <section className="tracking-protection">
          <div className="tracking-protection-icon">
            <Icon name="shield" size={25} />
          </div>
          <div>
            <h2 className="tracking-protection-title">
              VIRSA Payment Information
            </h2>
            <p className="tracking-protection-description">
              Payment status: {order.paymentStatus}. View your transaction
              details and contact support if you have a payment concern.
              Escrow protection will be shown only if a verified escrow
              arrangement is implemented on the platform.
            </p>
            <button
              type="button"
              className="tracking-button tracking-button-secondary"
              style={{ marginTop: 14 }}
              onClick={() =>
                setNotice(
                  `Payment status: ${order.paymentStatus}. Connect the payment API to show the real transaction details.`
                )
              }
            >
              View Payment Details
            </button>
          </div>
        </section>
      </div>

      {/* Photo preview modal */}

      {selectedImage && (
        <div
          className="tracking-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedImage(null)}
        >
          <section
            className="tracking-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tracking-modal-header">
              <h2 className="tracking-modal-title">
                {selectedImage.title}
              </h2>
              <button
                type="button"
                className="tracking-modal-close"
                aria-label="Close photo preview"
                onClick={() => setSelectedImage(null)}
              >
                <Icon name="close" />
              </button>
            </div>

            <img
              className="tracking-modal-image"
              src={selectedImage.image}
              alt={selectedImage.title}
            />
          </section>
        </div>
      )}

      {/* Message seller modal */}

      {messageOpen && (
        <div
          className="tracking-modal-backdrop"
          role="presentation"
          onClick={() => setMessageOpen(false)}
        >
          <section
            className="tracking-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Message seller"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tracking-modal-header">
              <h2 className="tracking-modal-title">Message {order.creatorName}</h2>
              <button
                type="button"
                className="tracking-modal-close"
                aria-label="Close message form"
                onClick={() => setMessageOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form className="tracking-form" onSubmit={handleSendMessage}>
              <div>
                <label className="tracking-form-label" htmlFor="seller-message">
                  Your message
                </label>
                <textarea
                  id="seller-message"
                  className="tracking-form-textarea"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask the artisan about your product..."
                  required
                />
              </div>

              <button
                type="submit"
                className="tracking-button tracking-button-primary"
              >
                <Icon name="message" size={17} />
                Prepare Message
              </button>
            </form>
            <p className="tracking-form-help">
              Demo only: connect seller messaging to deliver this message.
            </p>
          </section>
        </div>
      )}

      {/* Issue / damage report modal */}

      {issueOpen && (
        <div
          className="tracking-modal-backdrop"
          role="presentation"
          onClick={() => setIssueOpen(false)}
        >
          <section
            className="tracking-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Report an order issue"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tracking-modal-header">
              <h2 className="tracking-modal-title">Report an Issue</h2>
              <button
                type="button"
                className="tracking-modal-close"
                aria-label="Close issue form"
                onClick={() => setIssueOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <p className="tracking-section-description" style={{ marginBottom: 20 }}>
              Compare the seller's pre-shipment evidence with the item you
              received. Attach delivery photos to help document your report.
            </p>

            <form className="tracking-form" onSubmit={handleSubmitIssue}>
              <div>
                <label className="tracking-form-label" htmlFor="issue-type">
                  Issue type
                </label>
                <select
                  id="issue-type"
                  className="tracking-form-select"
                  value={issueType}
                  onChange={(event) => setIssueType(event.target.value)}
                >
                  <option>Damaged product</option>
                  <option>Wrong product received</option>
                  <option>Missing item</option>
                  <option>Delivery delay</option>
                  <option>Other issue</option>
                </select>
              </div>

              <div>
                <label className="tracking-form-label" htmlFor="issue-details">
                  Describe the issue
                </label>
                <textarea
                  id="issue-details"
                  className="tracking-form-textarea"
                  value={issueDescription}
                  onChange={(event) => setIssueDescription(event.target.value)}
                  placeholder="Describe what happened and which part of the product is affected..."
                  required
                />
              </div>

              <div>
                <label className="tracking-form-label" htmlFor="customer-photos">
                  Delivery photos (up to 5)
                </label>
                <input
                  ref={customerPhotoInput}
                  id="customer-photos"
                  className="tracking-form-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCustomerPhotoUpload}
                />
                <span className="tracking-form-help">
                  Attach photos of the received item and its packaging. Images
                  are previewed locally in this demo; they are not uploaded
                  to the server.
                </span>
              </div>

              {customerPhotos.length > 0 && (
                <div className="tracking-evidence-gallery">
                  {customerPhotos.map((photo) => (
                    <div className="tracking-evidence-item" key={photo.id}>
                      <div className="tracking-evidence-image-wrapper">
                        <img
                          className="tracking-evidence-image"
                          src={photo.url}
                          alt={photo.name}
                        />
                      </div>
                      <div className="tracking-evidence-caption">
                        <strong>{photo.name}</strong>
                        <button
                          type="button"
                          className="tracking-button tracking-button-danger tracking-button-small"
                          onClick={() => removeCustomerPhoto(photo.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="tracking-button tracking-button-primary"
              >
                <Icon name="alert" size={17} />
                Prepare Damage Report
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
