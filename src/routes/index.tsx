import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import heroImg from "@/assets/cake_4.jpg";
import g1 from "@/assets/cake_0.jpg";
import g2 from "@/assets/cake_5.jpg";
import g3 from "@/assets/cake_6.jpg";
import g4 from "@/assets/cake_7.jpg";
import g5 from "@/assets/cake_3.jpg";
import g6 from "@/assets/cake_8.jpg";
import g7 from "@/assets/cake_2.jpg";
import g8 from "@/assets/cake_9.jpg";
import g9 from "@/assets/cake_1.jpg";

const GALLERY = [
  { src: g1, alt: "Blue Police Secondary School graduation cake with cap topper", caption: "Graduation Celebration Cake" },
  { src: g2, alt: "Blue and cream 'Happy Graduation' buttercream cake", caption: "Happy Graduation Cake" },
  { src: g3, alt: "Orange and cream heart-shaped birthday cake", caption: "Heart Birthday Cake" },
  { src: g4, alt: "Black buttercream birthday cake with pearls", caption: "Midnight Black Cake" },
  { src: g5, alt: "Chocolate buttercream 70th birthday cake with gold pearls", caption: "Chocolate & Gold Cake" },
  { src: g6, alt: "White buttercream birthday cake with gold pearls", caption: "Classic Cream & Gold" },
  { src: g9, alt: "White buttercream cake with gold pearls and chocolate lettering", caption: "Buttercream & Pearls" },
  { src: g7, alt: "White cake decorated with fresh pink and orange flowers", caption: "Floral Celebration Cake" },
  { src: g8, alt: "Boxed pink cake with money bouquet gift set", caption: "Gift Box & Bouquet Set" },
];


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ease Cakes & Pastries — Lokoja, Kogi State" },
      {
        name: "description",
        content:
          "Celebration cakes, foil cakes, cupcakes and pastries in Lokoja, Kogi State. Order doughnuts, meat pies, samosas and small chops for delivery or pickup.",
      },
      { property: "og:title", content: "Ease Cakes & Pastries — Lokoja, Kogi State" },
      {
        property: "og:description",
        content:
          "Custom cakes and fresh pastries made with ease. Delivery or pickup across Kogi State.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WHATSAPP = "2349028341259";

type Item = { name: string; options: { label: string; price: number }[] };

const ITEMS: Item[] = [
  { name: "Milky Doughnuts", options: [{ label: "Box of 3", price: 4000 }, { label: "Box of 6", price: 7500 }] },
  { name: "Meat Pies", options: [{ label: "Box of 3", price: 5000 }, { label: "Box of 6", price: 9500 }] },
  { name: "Fish Rolls", options: [{ label: "Box of 3", price: 3500 }, { label: "Box of 6", price: 6000 }] },
  { name: "Samosas", options: [{ label: "10 pieces", price: 5000 }, { label: "20 pieces", price: 10000 }, { label: "50 pieces", price: 23000 }] },
  { name: "Spring Rolls", options: [{ label: "10 pieces", price: 5000 }, { label: "20 pieces", price: 10000 }, { label: "50 pieces", price: 23000 }] },
  { name: "Puff-puff", options: [{ label: "10 pieces", price: 2000 }, { label: "20 pieces", price: 3800 }, { label: "50 pieces", price: 9000 }] },
  {
    name: "Mixed Small Chops (Samosa + Spring Roll)",
    options: [
      { label: "10 pieces", price: 5000 },
      { label: "20 pieces", price: 10000 },
      { label: "50 pieces", price: 23000 },
      { label: "100 pieces", price: 46000 },
    ],
  },
];

const fmt = (n: number) => "₦" + n.toLocaleString();

function Scallop() {
  return (
    <div className="scallop reveal">
      <svg viewBox="0 0 260 18" aria-hidden="true">
        <path d="M0 9 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0" />
      </svg>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.28 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2c-1.6 0-3.1-.44-4.4-1.2l-.32-.19-3.1.76.78-3.02-.2-.32A8.18 8.18 0 0 1 3.82 12c0-4.53 3.69-8.2 8.22-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.15.16-.29.18-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

function Index() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [fulfil, setFulfil] = useState<"Pickup" | "Delivery">("Pickup");
  const [form, setForm] = useState({ name: "", phone: "", date: "", address: "", cake: "", notes: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const lines = useMemo(() => {
    const out: { text: string; sub: number }[] = [];
    ITEMS.forEach((item, i) =>
      item.options.forEach((opt, j) => {
        const q = qty[`${i}_${j}`] ?? 0;
        if (q > 0) out.push({ text: `${item.name} — ${opt.label} × ${q}`, sub: q * opt.price });
      }),
    );
    return out;
  }, [qty]);

  const total = lines.reduce((a, l) => a + l.sub, 0);

  const bump = (key: string, delta: number) =>
    setQty((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }));

  const send = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setMsg("Please add your name and phone number.");
      return;
    }
    if (fulfil === "Delivery" && !form.address.trim()) {
      setMsg("Please add a delivery address.");
      return;
    }
    if (!lines.length && !form.cake.trim()) {
      setMsg("Select at least one pastry or describe a cake request.");
      return;
    }
    let text = `Hi Ease Cakes! I'd like to place an order.\n\n`;
    text += `Name: ${form.name}\nPhone: ${form.phone}\n`;
    if (form.date) text += `Needed by: ${form.date}\n`;
    text += `Fulfillment: ${fulfil}\n`;
    if (fulfil === "Delivery") text += `Address: ${form.address}\n`;
    if (lines.length) {
      text += `\nPastries:\n${lines.map((l) => `- ${l.text} = ${fmt(l.sub)}`).join("\n")}\nPastry Subtotal: ${fmt(total)}\n`;
    }
    if (form.cake.trim()) text += `\nCustom Cake Request:\n${form.cake}\n`;
    if (form.notes.trim()) text += `\nNotes: ${form.notes}\n`;

    setMsg("Opening WhatsApp with your order...");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <div className="ec" ref={rootRef}>
      <header>
        <span className="wordmark">
          Ease <span>Cakes</span> &amp; Pastries
        </span>
        <nav>
          <a href="#menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#order">Order</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-grid">
          <div className="reveal">
            <p className="hero-eyebrow">Est. 2023 · Lokoja, Kogi State</p>
            <h1>Cakes &amp; pastries, made with ease.</h1>
            <p className="sub">
              Celebration cakes, foil cakes, cupcakes, and a full pastry menu — samosas, spring rolls, meat pies,
              doughnuts and more. Delivery or pickup across Kogi State.
            </p>
            <div className="cta-row">
              <a className="btn btn-solid" href="#order">
                <WhatsAppIcon />
                Order Now
              </a>
              <a className="btn btn-outline" href="#menu">
                View Menu
              </a>
            </div>
          </div>
          <div className="hero-photo reveal">
            <img src={heroAsset.url} alt="Pink buttercream birthday cake with butterfly toppers by Ease Cakes" width={1440} height={1920} />
            <span className="hero-tag">
              <span className="dot" />
              Freshly baked, made to order
            </span>
          </div>
        </div>
      </section>

      <Scallop />

      <section id="gallery">
        <div className="section-head reveal">
          <p className="eyebrow">A little taste</p>
          <h2>From the Kitchen</h2>
          <p>A few recent bakes — every order is made to fit the occasion.</p>
        </div>
        <div className="gallery reveal">
          {GALLERY.map((g) => (
            <figure key={g.src}>
              <img src={g.src} alt={g.alt} loading="lazy" width={1440} height={1920} />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>


      <Scallop />

      <section id="menu">
        <div className="section-head reveal">
          <p className="eyebrow">What we make</p>
          <h2>The Menu</h2>
          <p>Cakes are custom-quoted. Pastries are priced by box or piece count below.</p>
        </div>

        <div className="menu-block reveal">
          <h3>Cakes</h3>
          <div className="menu-tags">
            <span className="menu-tag">Celebration cakes</span>
            <span className="menu-tag">Plain cakes — vanilla, red velvet, cinnamon, chocolate</span>
            <span className="menu-tag">Foil cakes — mini, medium, big</span>
            <span className="menu-tag">Cupcakes — plain &amp; frosted</span>
            <span className="menu-tag">Cake slice</span>
            <span className="menu-tag">Cake parfait</span>
          </div>
        </div>

        <div className="menu-block reveal">
          <h3>Pastry Price List</h3>
          <div className="price-table">
            {ITEMS.map((item) => (
              <div className="price-item" key={item.name}>
                <div className="price-item-head">{item.name}</div>
                <div className="price-rows">
                  {item.options.map((o) => (
                    <span className="price-row" key={o.label}>
                      {o.label} <b>{fmt(o.price)}</b>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-notes reveal">
          <div className="menu-note">
            <span className="pin">📌</span>All prices include neat, secure packaging
          </div>
          <div className="menu-note">
            <span className="pin">📌</span>Orders must be placed at least 24–48 hours before delivery
          </div>
          <div className="menu-note">
            <span className="pin">📌</span>Payment confirms your order
          </div>
          <div className="menu-note">
            <span className="pin">📌</span>Delivery within Kogi State only — pickup also available
          </div>
        </div>
      </section>

      <Scallop />

      <section id="order" className="order-section">
        <div className="order-inner">
          <div className="section-head reveal">
            <p className="eyebrow">Ready to order?</p>
            <h2>Build Your Order</h2>
            <p>Pick your pastries below, add a custom cake request if needed, then send it straight to WhatsApp.</p>
          </div>

          <div className="order-grid reveal">
            <div>
              <div className="field-group">
                <label htmlFor="f-name">Your Name</label>
                <input
                  id="f-name"
                  type="text"
                  placeholder="e.g. Amina Yusuf"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="f-phone">Phone Number</label>
                  <input
                    id="f-phone"
                    type="tel"
                    placeholder="080..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="f-date">Needed By</label>
                  <input
                    id="f-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="field-group">
                <label>Fulfillment</label>
                <div className="radio-row">
                  <button
                    type="button"
                    className={`radio-pill${fulfil === "Pickup" ? " active" : ""}`}
                    onClick={() => setFulfil("Pickup")}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    className={`radio-pill${fulfil === "Delivery" ? " active" : ""}`}
                    onClick={() => setFulfil("Delivery")}
                  >
                    Delivery
                  </button>
                </div>
              </div>
              {fulfil === "Delivery" && (
                <div className="field-group">
                  <label htmlFor="f-address">Delivery Address (Kogi State)</label>
                  <input
                    id="f-address"
                    type="text"
                    placeholder="Street, area, LGA"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              )}

              <div>
                {ITEMS.map((item, i) => (
                  <div className="item-card" key={item.name}>
                    <h4>{item.name}</h4>
                    {item.options.map((opt, j) => {
                      const key = `${i}_${j}`;
                      return (
                        <div className="item-option" key={opt.label}>
                          <span className="label">
                            {opt.label} <span className="price">{fmt(opt.price)}</span>
                          </span>
                          <span className="stepper">
                            <button type="button" aria-label={`Remove one ${item.name} ${opt.label}`} onClick={() => bump(key, -1)}>
                              −
                            </button>
                            <span>{qty[key] ?? 0}</span>
                            <button type="button" aria-label={`Add one ${item.name} ${opt.label}`} onClick={() => bump(key, 1)}>
                              +
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="field-group">
                <label htmlFor="f-cake">Custom Cake Request (optional)</label>
                <textarea
                  id="f-cake"
                  placeholder="Occasion, flavor, size, design ideas..."
                  value={form.cake}
                  onChange={(e) => setForm({ ...form, cake: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label htmlFor="f-notes">Notes (optional)</label>
                <textarea
                  id="f-notes"
                  placeholder="Anything else we should know"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="summary">
              <h3>Order Summary</h3>
              <div className="summary-lines">
                {lines.length ? (
                  lines.map((l) => (
                    <div className="summary-line" key={l.text}>
                      <span>{l.text}</span>
                      <span>{fmt(l.sub)}</span>
                    </div>
                  ))
                ) : (
                  <p className="summary-empty">No pastries selected yet.</p>
                )}
              </div>
              <div className="summary-total">
                <span>Pastry Subtotal</span>
                <span>{fmt(total)}</span>
              </div>
              <small>
                Cakes are quoted separately once we see your request. Subtotal excludes delivery fee, confirmed on
                WhatsApp.
              </small>
              <button type="button" className="btn btn-solid" onClick={send}>
                <WhatsAppIcon />
                Send Order via WhatsApp
              </button>
              <p className="form-msg">{msg}</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact">
        <span className="wordmark">
          Ease <span>Cakes</span> &amp; Pastries
        </span>
        <div className="social-row">
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
            WhatsApp / Call: 0902 834 1259
          </a>
        </div>
        <p className="fine">Lokoja, Kogi State · Delivery or pickup · Payment confirms order</p>
      </footer>
    </div>
  );
}
