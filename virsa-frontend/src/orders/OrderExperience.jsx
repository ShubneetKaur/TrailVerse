import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  CreditCard,
  Landmark,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import {
  findOrder,
  formatINR,
  updateOrder as persistOrderUpdate,
} from "./orderStorage";
import "./OrderExperience.css";

const paymentChoices = [
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    detail: "Demo checkout only. No UPI app is opened and no payment is sent.",
  },
  {
    id: "card",
    label: "Credit or debit card",
    icon: CreditCard,
    detail: "Card details are not requested or stored in this prototype.",
  },
  {
    id: "netbanking",
    label: "Net banking",
    icon: Landmark,
    detail: "No bank login or payment provider is connected.",
  },
];

function ProgressSteps({ current }) {
  const steps = ["Product / Cart", "Checkout", "Confirmation"];
  return (
    <ol className="order-progress" aria-label="Checkout progress">
      {steps.map((step, index) => (
        <li
          className={index < current ? "is-complete" : index === current ? "is-current" : ""}
          key={step}
          aria-current={index === current ? "step" : undefined}
        >
          <span>{index < current ? <Check size={14} /> : index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function OrderHeader({ onBack, backLabel = "Back to Product" }) {
  return (
    <header className="order-header">
      <button className="order-brand" type="button" onClick={onBack} aria-label="Return to VIRSA">
        <span className="order-brand-mark">V</span>
        <span><strong>VIRSA</strong><small>THE ART OF HERITAGE</small></span>
      </button>
      <div className="order-header-side">
        <span className="secure-label"><ShieldCheck size={15} /> Secure Checkout</span>
        <button type="button" className="order-text-link" onClick={onBack}>
          <ArrowLeft size={15} /> {backLabel}
        </button>
      </div>
    </header>
  );
}

function ProductSummary({ product, quantity, subtotalCents, onQuantityChange }) {
  return (
    <section className="order-product-summary" aria-labelledby="order-item-title">
      <img src={product.image} alt={product.name} />
      <div className="order-product-copy">
        <span className="order-eyebrow">{product.craft} · {product.origin}</span>
        <h2 id="order-item-title">{product.name}</h2>
        {product.description && <p>{product.description}</p>}
        <span className="order-artisan">By {product.artisan}</span>
        <div className="order-quantity-row">
          <label htmlFor="checkout-quantity">Quantity</label>
          <div className="order-quantity-control">
            <button type="button" aria-label="Decrease quantity" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
            <input id="checkout-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => onQuantityChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} />
            <button type="button" aria-label="Increase quantity" onClick={() => onQuantityChange(quantity + 1)}>+</button>
          </div>
          <strong>{formatINR(subtotalCents)}</strong>
        </div>
      </div>
    </section>
  );
}

function OrderTotal({ subtotalCents, quantity }) {
  return (
    <section className="order-total-panel" aria-label="Order total">
      <h2>Order summary</h2>
      <div><span>Product subtotal · {quantity} {quantity === 1 ? "item" : "items"}</span><strong>{formatINR(subtotalCents)}</strong></div>
      <div><span>Delivery</span><strong>Not configured</strong></div>
      <div><span>Taxes</span><strong>Not calculated</strong></div>
      <p>Demo pricing: no delivery charge, discount, or tax rules are connected.</p>
      <div className="order-total-final"><span>Total order value</span><strong>{formatINR(subtotalCents)}</strong></div>
    </section>
  );
}

function FinancialModel({ orderValueCents = 10000, currency = "INR" }) {
  const [amountText, setAmountText] = useState("100.00");
  const [scenario, setScenario] = useState("accepted");
  const centsInput = /^(\d+)(?:\.(\d{0,2}))?$/.exec(amountText.trim());
  const enteredCents = centsInput
    ? Number(centsInput[1]) * 100 + Number((centsInput[2] || "").padEnd(2, "0"))
    : 0;
  const totalCents = currency === "USD" ? enteredCents : orderValueCents;
  const commissionCents = Math.round((totalCents * 1500) / 10000);
  const artistCents = totalCents - commissionCents;
  const firstPayoutCents = Math.floor(artistCents / 2);
  const remainingCents = artistCents - firstPayoutCents;
  const formatter = currency === "USD"
    ? (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
    : formatINR;
  const scenarioCopy = {
    accepted: "After artisan acceptance, the first half of the artist payout potential is planned for release in this model.",
    approval: "The first portion is marked released in the simulation. The remaining portion stays pending buyer review.",
    dispute: "The first portion remains simulated as released. The remaining portion is marked under review; no outcome is assumed.",
  }[scenario];
  const firstStatus = scenario === "accepted" ? "Planned after acceptance" : "Simulated as released";
  const remainingStatus = scenario === "dispute" ? "Under review" : scenario === "approval" ? "Pending approval" : "Held in model";

  return (
    <details className="financial-model">
      <summary><span><CircleHelp size={18} /> Explore the Financial Model</span><span className="simulation-tag">Simulation only</span></summary>
      <div className="financial-model-body">
        <p className="financial-notice">Illustrative allocation only. VIRSA has no connected escrow, payment, or payout provider in this prototype.</p>
        {currency === "USD" ? (
          <label className="simulator-amount">Illustrative order value (USD)
            <span><b>$</b><input type="number" min="0.01" max="10000000" step="0.01" value={amountText} onChange={(event) => setAmountText(event.target.value)} /></span>
          </label>
        ) : (
          <p className="simulator-order-value">This order · {formatter(totalCents)}</p>
        )}
        <fieldset className="scenario-select">
          <legend>Scenario</legend>
          {[["accepted", "Order Accepted"], ["approval", "Awaiting Buyer Approval"], ["dispute", "Dispute Raised"]].map(([value, label]) => (
            <label key={value} className={scenario === value ? "selected" : ""}>
              <input type="radio" name={`scenario-${currency}`} value={value} checked={scenario === value} onChange={() => setScenario(value)} />{label}
            </label>
          ))}
        </fieldset>
        <p className="scenario-explanation" aria-live="polite">{scenarioCopy}</p>
        <div className="allocation-bar" role="img" aria-label={`Allocation: platform ${formatter(commissionCents)}, first artist portion ${formatter(firstPayoutCents)}, remaining artist portion ${formatter(remainingCents)}`}>
          <span className="allocation-platform" style={{ width: `${totalCents ? (commissionCents / totalCents) * 100 : 0}%` }} />
          <span className={`allocation-first allocation-first-${scenario}`} style={{ width: `${totalCents ? (firstPayoutCents / totalCents) * 100 : 0}%` }} />
          <span className={`allocation-remaining allocation-remaining-${scenario}`} style={{ width: `${totalCents ? (remainingCents / totalCents) * 100 : 0}%` }} />
        </div>
        <dl className="allocation-list">
          <div><dt><i className="allocation-dot total-dot" />Total order value</dt><dd>{formatter(totalCents)}</dd></div>
          <div><dt><i className="allocation-dot platform-dot" />Platform commission · 15%</dt><dd>{formatter(commissionCents)}</dd></div>
          <div><dt><i className="allocation-dot artist-dot" />Artist payout potential · 85%</dt><dd>{formatter(artistCents)}</dd></div>
          <div><dt><i className="allocation-dot first-dot" />First 50% portion · {firstStatus}</dt><dd>{formatter(firstPayoutCents)}</dd></div>
          <div><dt><i className="allocation-dot remaining-dot" />Remaining portion · {remainingStatus}</dt><dd>{formatter(remainingCents)}</dd></div>
        </dl>
        <p className="allocation-footnote">The 15% commission is allocated within the order value, never added as a buyer fee.</p>
      </div>
    </details>
  );
}

export function EscrowExplainer() {
  const steps = [
    ["Buyer commitment", "The proposed model begins with the buyer paying the full order value. A future platform escrow arrangement would hold it while the order begins."],
    ["Material release", "After the artisan accepts, 50% of the artist payout potential is planned for release to support materials and initial work."],
    ["Proof checkpoint", "The artisan shares completion photos or video. The remaining 50% stays pending buyer review in the proposed model."],
    ["Approval or dispute", "Buyer approval would trigger the planned final payout. A dispute would go to a proposed evidence review; no outcome is assumed here."],
  ];
  return (
    <section className="escrow-explainer">
      <div className="order-section-heading"><span className="order-eyebrow">PROPOSED FRAMEWORK · NOT A LIVE SERVICE</span><h2>How VIRSA Protects Your Purchase</h2><p>A model intended to give buyers review time while helping artisans begin their work.</p></div>
      <ol>{steps.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      <p className="order-disclaimer">No escrow provider, payout automation, or dispute-resolution service is connected. These steps describe a proposal only.</p>
    </section>
  );
}

const initialDelivery = { name: "", email: "", phone: "", street: "", locality: "", city: "", state: "", pincode: "", instructions: "" };

function validateDelivery(values) {
  const errors = {};
  const required = ["name", "email", "phone", "street", "locality", "city", "state", "pincode"];
  for (const key of required) if (!values[key].trim()) errors[key] = "This field is required.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.phone) {
    const phoneDigits = values.phone.replace(/\D/g, "");
    const nationalNumber = phoneDigits.length === 12 && phoneDigits.startsWith("91")
      ? phoneDigits.slice(2)
      : phoneDigits;
    if (!/^[6-9]\d{9}$/.test(nationalNumber)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (values.pincode && !/^[1-9]\d{5}$/.test(values.pincode.trim())) errors.pincode = "Enter a valid 6-digit Indian PIN code.";
  return errors;
}

export function CheckoutPage({ draft, onBackToProduct, onReturnToMarketplace, onDraftQuantityChange, onPlaceOrder }) {
  const product = draft?.product;
  const [quantity, setQuantity] = useState(Math.max(1, draft?.quantity || 1));
  const [delivery, setDelivery] = useState(initialDelivery);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const submittingRef = useRef(false);
  const subtotalCents = product ? product.unitPriceCents * quantity : 0;
  const updateQuantity = (nextQuantity) => {
    const safeQuantity = Math.max(1, Math.min(99, Number(nextQuantity) || 1));
    setQuantity(safeQuantity);
    onDraftQuantityChange?.(safeQuantity);
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateDelivery(delivery);
    if (!paymentMethod) nextErrors.paymentMethod = "Choose a demo payment method to continue.";
    if (!product) nextErrors.product = "The selected product could not be recovered.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onPlaceOrder({ quantity, paymentMethod });
    } catch {
      setSubmissionError("We couldn't save this demo order in this browser. Check available browser storage and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!product) {
    return <main className="order-page"><OrderHeader onBack={onReturnToMarketplace} backLabel="Return to Marketplace" /><section className="order-fallback"><PackageCheck size={34} /><h1>Checkout details unavailable</h1><p>We could not recover the selected product. No order has been created.</p><button className="order-primary-button" onClick={onReturnToMarketplace}>Return to Marketplace <ArrowRight size={16} /></button></section></main>;
  }

  return (
    <main className="order-page">
      <OrderHeader onBack={onBackToProduct} />
      <div className="order-container">
        <ProgressSteps current={1} />
        <div className="order-title-row"><div><span className="order-eyebrow">VIRSA · MADE WITH MEANING</span><h1>Secure checkout</h1><p>Review your selection and delivery details.</p></div><span className="demo-checkout-badge">Demo Checkout · No payment processed</span></div>
        <div className="checkout-grid">
          <div className="checkout-main-column">
            <ProductSummary product={product} quantity={quantity} subtotalCents={subtotalCents} onQuantityChange={updateQuantity} />
            <form id="checkout-form" onSubmit={submit} noValidate>
              <section className="checkout-section">
                <div className="checkout-section-heading"><span>01</span><div><h2>Delivery information</h2><p>Your details are used for this demo session only and are not stored.</p></div></div>
                <div className="delivery-fields">
                  {[["name", "Full name", "text", "Your name"], ["email", "Email address", "email", "you@example.com"], ["phone", "Phone number", "tel", "+91 98765 43210"]].map(([key, label, type, placeholder]) => <label className={key === "name" ? "field-wide" : ""} key={key}>{label}<input type={type} autoComplete={key === "name" ? "name" : key} value={delivery[key]} placeholder={placeholder} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `error-${key}` : undefined} onChange={(event) => setDelivery({ ...delivery, [key]: event.target.value })} />{errors[key] && <small id={`error-${key}`} className="field-error">{errors[key]}</small>}</label>)}
                  <label className="field-wide">House number and street<input autoComplete="street-address" value={delivery.street} placeholder="Flat, house number, street" aria-invalid={Boolean(errors.street)} aria-describedby={errors.street ? "error-street" : undefined} onChange={(event) => setDelivery({ ...delivery, street: event.target.value })} />{errors.street && <small id="error-street" className="field-error">{errors.street}</small>}</label>
                  {[["locality", "Locality", "Neighborhood or area", "address-level3"], ["city", "City", "City", "address-level2"], ["state", "State", "State", "address-level1"], ["pincode", "Indian PIN code", "6-digit PIN code", "postal-code"]].map(([key, label, placeholder, autocomplete]) => <label key={key}>{label}<input autoComplete={autocomplete} inputMode={key === "pincode" ? "numeric" : undefined} maxLength={key === "pincode" ? 6 : undefined} value={delivery[key]} placeholder={placeholder} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `error-${key}` : undefined} onChange={(event) => setDelivery({ ...delivery, [key]: key === "pincode" ? event.target.value.replace(/\D/g, "").slice(0, 6) : event.target.value })} />{errors[key] && <small id={`error-${key}`} className="field-error">{errors[key]}</small>}</label>)}
                  <label className="field-wide">Delivery instructions <span className="optional-label">Optional</span><textarea rows="3" value={delivery.instructions} placeholder="Anything the delivery partner should know" onChange={(event) => setDelivery({ ...delivery, instructions: event.target.value })} /></label>
                </div>
              </section>
              <section className="checkout-section payment-section">
                <div className="checkout-section-heading"><span>02</span><div><h2>Payment method</h2><p>Choose a method for the demo order record. This does not initiate payment.</p></div></div>
                <fieldset className="payment-options"><legend className="visually-hidden">Choose payment method</legend>{paymentChoices.map(({ id, label, icon: Icon, detail }) => <label className={`payment-choice ${paymentMethod === id ? "is-selected" : ""}`} key={id}><input type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => { setPaymentMethod(id); setErrors((previous) => ({ ...previous, paymentMethod: "" })); }} /><span className="payment-icon"><Icon size={19} /></span><span><strong>{label}</strong><small>{detail}</small></span></label>)}</fieldset>
                {errors.paymentMethod && <p className="field-error" role="alert">{errors.paymentMethod}</p>}
              </section>
            </form>
          </div>
          <aside className="checkout-side-column">
            <OrderTotal subtotalCents={subtotalCents} quantity={quantity} />
            <div className="demo-payment-note"><ShieldCheck size={18} /><p><strong>Demo checkout</strong><br />No money will be charged or transferred. Payment credentials are never requested.</p></div>
            <button className="order-primary-button place-order-button" type="submit" form="checkout-form" disabled={submitting}>{submitting ? "Creating demo order…" : "Place Demo Order"}<ArrowRight size={17} /></button>
            <p className="order-consent">By continuing, you create a demo order record in this browser. Delivery information is not retained.</p>
            {submissionError && <p className="field-error" role="alert">{submissionError}</p>}
          </aside>
        </div>
        <EscrowExplainer />
        <FinancialModel currency="USD" />
      </div>
    </main>
  );
}

export function ConfirmationPage({ order, onTrackOrder, onViewProduct, onReturnToMarketplace }) {
  if (!order) return <UnknownOrder onReturnToMarketplace={onReturnToMarketplace} title="Order not found" />;
  return (
    <main className="order-page">
      <OrderHeader onBack={onReturnToMarketplace} backLabel="Return to Marketplace" />
      <div className="order-container confirmation-container">
        <ProgressSteps current={2} />
        <section className="confirmation-panel">
          <span className="confirmation-mark"><Check size={25} /></span>
          <span className="order-eyebrow">DEMO ORDER · NO PAYMENT PROCESSED</span>
          <h1>Demo order created</h1>
          <p>Your order record is saved in this browser. No payment was charged or sent to an artisan.</p>
          <div className="confirmation-reference"><span>Order reference</span><strong>{order.reference}</strong></div>
          <div className="confirmation-item"><img src={order.product.image} alt={order.product.name} /><div><strong>{order.product.name}</strong><span>Quantity: {order.quantity}</span><span>Payment method selected: {paymentChoices.find((item) => item.id === order.paymentMethod)?.label || order.paymentMethod}</span></div><strong>{formatINR(order.totalCents)}</strong></div>
          <p className="confirmation-next">Next: this prototype lets you explore a simulated artisan and delivery workflow. No real fulfillment or financial activity is connected.</p>
          <div className="confirmation-actions"><button className="order-primary-button" onClick={onTrackOrder}>Track Your Order <ArrowRight size={16} /></button><button className="order-secondary-button" onClick={onViewProduct}>View Product</button><button className="order-text-link" onClick={onReturnToMarketplace}>Return to Marketplace</button></div>
          <FinancialModel orderValueCents={order.totalCents} />
        </section>
      </div>
    </main>
  );
}

function UnknownOrder({ onReturnToMarketplace, title = "We couldn’t find that order" }) {
  return <main className="order-page"><OrderHeader onBack={onReturnToMarketplace} backLabel="Return to Marketplace" /><section className="order-fallback"><CircleHelp size={34} /><h1>{title}</h1><p>This reference is not available in this browser. No other order has been substituted.</p><button className="order-primary-button" onClick={onReturnToMarketplace}>Return to Marketplace <ArrowRight size={16} /></button></section></main>;
}

const trackingStages = [
  "Order Placed",
  "Payment Confirmed",
  "Order Accepted by Artisan",
  "Crafting in Progress",
  "Proof Uploaded",
  "Awaiting Your Approval",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function getTrackingIndex(order) {
  if (order.disputeStatus === "under_review") return 5;
  if (order.deliveryStatus === "delivered") return 9;
  if (order.deliveryStatus === "out_for_delivery") return 8;
  if (order.deliveryStatus === "shipped") return 7;
  if (order.buyerApproval === "approved") return 6;
  if (order.events.some((event) => event.type === "proof_uploaded")) return 5;
  if (order.events.some((event) => event.type === "crafting_started")) return 3;
  if (order.events.some((event) => event.type === "artisan_accepted")) return 2;
  return 0;
}

export function TrackingPage({ reference, onReturnToMarketplace, onViewProduct }) {
  const [order, setOrder] = useState(() => findOrder(reference));
  const update = (change) => {
    const next = persistOrderUpdate(reference, (current) => change(current));
    if (next) setOrder(next);
  };
  const addEvent = (type, label, change = {}) => update((current) => ({
    ...current,
    ...change,
    events: [...current.events, { type, label, at: new Date().toISOString() }],
  }));

  if (!order) return <UnknownOrder onReturnToMarketplace={onReturnToMarketplace} />;
  const currentIndex = getTrackingIndex(order);
  const getEvent = (type) => order.events.find((event) => event.type === type);
  const currentStatus = order.disputeStatus === "under_review"
    ? "Dispute under review (demo)"
    : order.deliveryStatus === "delivered"
      ? "Delivered · simulated"
      : order.deliveryStatus === "out_for_delivery"
        ? "Out for delivery · simulated"
        : order.deliveryStatus === "shipped"
          ? "Shipped · simulated"
          : order.buyerApproval === "approved"
            ? "Ready to ship · simulated"
            : getEvent("proof_uploaded")
              ? "Awaiting your approval · simulated"
              : getEvent("artisan_accepted")
                ? getEvent("crafting_started") ? "Crafting in progress · simulated" : "Order accepted by artisan · simulated"
                : "Order placed · demo status";
  const artistPayoutCents = order.totalCents - Math.round((order.totalCents * 1500) / 10000);
  const firstPayoutCents = Math.floor(artistPayoutCents / 2);
  const remainingPayoutCents = artistPayoutCents - firstPayoutCents;
  const isAccepted = Boolean(getEvent("artisan_accepted"));
  const isCrafting = Boolean(getEvent("crafting_started"));
  const hasProof = Boolean(getEvent("proof_uploaded"));
  const isApproved = order.buyerApproval === "approved";
  const isDisputed = order.disputeStatus === "under_review";
  const isDelivered = order.deliveryStatus === "delivered";

  return (
    <main className="order-page">
      <OrderHeader onBack={onReturnToMarketplace} backLabel="Return to Marketplace" />
      <div className="order-container tracking-container">
        <div className="order-title-row"><div><span className="order-eyebrow">ORDER TRACKING · SIMULATED</span><h1>Follow your order</h1><p>Reference <strong>{order.reference}</strong></p></div><span className="tracking-status"><i />{currentStatus}</span></div>
        <div className="tracking-layout">
          <div className="tracking-main">
            <section className="tracking-product-card">
              <img src={order.product.image} alt={order.product.name} />
              <div><span className="order-eyebrow">{order.product.craft} · {order.product.origin}</span><h2>{order.product.name}</h2><p>By {order.product.artisan}</p><p>Quantity {order.quantity} · {formatINR(order.totalCents)}</p><button className="order-text-link" onClick={onViewProduct}>View Product <ArrowRight size={14} /></button></div>
            </section>
            <section className="tracking-timeline-section">
              <div className="order-section-heading"><span className="order-eyebrow">NO LIVE COURIER DATA</span><h2>Order timeline</h2><p>Only actions recorded in this demo are timestamped. Payment has not been processed.</p></div>
              <ol className="tracking-timeline">{trackingStages.map((stage, index) => {
                const typeByIndex = ["order_placed", null, "artisan_accepted", "crafting_started", "proof_uploaded", null, "buyer_approved", "shipped", "out_for_delivery", "delivered"];
                const event = typeByIndex[index] ? getEvent(typeByIndex[index]) : null;
                const state = index === 1 ? "not-processed" : index === currentIndex ? "is-current" : event ? "is-complete" : "is-upcoming";
                return <li className={state} key={stage}><span className="timeline-marker">{event ? <Check size={13} /> : index === 1 ? "–" : index + 1}</span><div><strong>{stage}{index === 1 && <small>Not processed in demo checkout</small>}{order.disputeStatus === "under_review" && index === 5 && <small>Under review · no resolution recorded</small>}</strong>{event?.at && <time dateTime={event.at}>{new Date(event.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>}</div></li>;
              })}</ol>
            </section>
            <section className="demo-workflow">
              <div className="order-section-heading"><span className="order-eyebrow">LOCAL DEMO CONTROLS</span><h2>Explore the order workflow</h2><p>These actions update this browser’s demo record only; they do not contact an artisan or carrier.</p></div>
              {!isAccepted && <button className="order-secondary-button" onClick={() => addEvent("artisan_accepted", "Order accepted by artisan")}>Simulate artisan acceptance</button>}
              {isAccepted && !isCrafting && !hasProof && !isDisputed && <button className="order-secondary-button" onClick={() => addEvent("crafting_started", "Crafting started")}>Simulate crafting started</button>}
              {isCrafting && !hasProof && !isDisputed && <button className="order-secondary-button" onClick={() => addEvent("proof_uploaded", "Sample proof added")}>Add sample proof</button>}
              {hasProof && <div className="sample-proof"><img src={order.product.image} alt="Sample product reference, not proof of completed work" /><p><strong>Sample reference only</strong><br />This is the product listing image, not evidence of a completed commissioned item.</p></div>}
              {hasProof && !isApproved && !isDisputed && <div className="buyer-review-actions"><button className="order-primary-button" onClick={() => addEvent("buyer_approved", "Buyer approved demo proof", { buyerApproval: "approved" })}>Approve sample proof</button><button className="order-secondary-button dispute-button" onClick={() => addEvent("dispute_raised", "Buyer raised a demo dispute", { disputeStatus: "under_review" })}>Raise a dispute</button></div>}
              {isDisputed && <p className="dispute-notice" role="status">This demo dispute is under review. No decision or payout outcome has been generated.</p>}
              {isApproved && !order.deliveryStatus && <button className="order-secondary-button" onClick={() => addEvent("shipped", "Order marked shipped", { deliveryStatus: "shipped" })}>Simulate dispatch</button>}
              {order.deliveryStatus === "shipped" && <button className="order-secondary-button" onClick={() => addEvent("out_for_delivery", "Order out for delivery", { deliveryStatus: "out_for_delivery" })}>Simulate out for delivery</button>}
              {order.deliveryStatus === "out_for_delivery" && <button className="order-secondary-button" onClick={() => addEvent("delivered", "Order marked delivered", { deliveryStatus: "delivered" })}>Simulate delivery</button>}
              {isDelivered && <p className="tracking-status-note">Delivery status is simulated; no carrier or tracking number is connected.</p>}
            </section>
          </div>
          <aside className="tracking-side">
            <section className="payment-status-card"><span className="order-eyebrow">SIMULATED ALLOCATION</span><h2>Proposed financial model</h2><div><span>Total order value</span><strong>{formatINR(order.totalCents)}</strong></div><div><span>Platform allocation · 15%</span><strong>{formatINR(order.totalCents - artistPayoutCents)}</strong></div><div><span>Artist payout potential · 85%</span><strong>{formatINR(artistPayoutCents)}</strong></div><div><span>First portion · 50%</span><strong>{isAccepted ? "Simulated as released" : "Awaiting acceptance"}<small>{formatINR(firstPayoutCents)}</small></strong></div><div><span>Remaining portion</span><strong>{isDisputed ? "Under review" : isApproved ? "Simulated as approved" : "Pending buyer approval"}<small>{formatINR(remainingPayoutCents)}</small></strong></div><div><span>Buyer approval</span><strong>{isDisputed ? "Dispute raised" : isApproved ? "Approved in demo" : hasProof ? "Awaiting review" : "Not available yet"}</strong></div><p>Illustrative states only. No funds are held, released, or transferred.</p></section>
            <div className="tracking-help"><Truck size={18} /><p><strong>Shipping stays separate</strong><br />Delivery status advances only through the demo controls. No delivery estimate is available.</p></div>
            <button className="order-secondary-button full-width" onClick={onReturnToMarketplace}>Return to Marketplace</button>
          </aside>
        </div>
        <FinancialModel orderValueCents={order.totalCents} />
      </div>
    </main>
  );
}