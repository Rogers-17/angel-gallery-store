import { describe, expect, it } from "vitest";
import { buildOrderMessage, buildWaMeUrl, DEFAULT_ORDER_TEMPLATE, MAX_MESSAGE_LENGTH, type WhatsAppOrder } from "./whatsapp";

const ORDER_LINK = "https://shop.example/admin/orders/AG-1027";

function order(overrides: Partial<WhatsAppOrder> = {}): WhatsAppOrder {
  return {
    number: "AG-1027",
    customerName: "Test Buyer",
    whatsappPhone: "+231770123456",
    fulfilment: "delivery",
    delivery: { area: "Sinkor", street: "12th Street", landmark: "opposite the Total station", notes: "Call when close" },
    paymentMethodLabel: "MTN Mobile Money",
    subtotalCents: 68988,
    lrdPerUsd: 170,
    items: [
      { productName: "Suede Penny Loafer", color: "Tobacco", size: "EU 42", quantity: 2, lineTotalCents: 45992 },
      { productName: "Canvas Tote", color: "Natural", size: "One size", quantity: 1, lineTotalCents: 22996 },
    ],
    ...overrides,
  };
}

describe("buildOrderMessage (default template)", () => {
  const message = buildOrderMessage(order(), { orderLink: ORDER_LINK });

  it("includes the order, items and totals", () => {
    expect(message).toContain("I'd like to place order AG-1027.");
    expect(message).toContain("• 2 × Suede Penny Loafer (Tobacco / EU 42) – $459.92");
    expect(message).toContain("• 1 × Canvas Tote (Natural / One size) – $229.96");
    expect(message).toContain("Subtotal: $689.88 (≈ L$117,280)");
    expect(message).toContain("Delivery fee: to agree here");
  });

  it("includes delivery, payment, buyer and the order link", () => {
    expect(message).toContain("Delivery: Sinkor, 12th Street");
    expect(message).toContain("Landmark: opposite the Total station");
    expect(message).toContain("Notes: Call when close");
    expect(message).toContain("Payment: MTN Mobile Money");
    expect(message).toContain("Name: Test Buyer");
    expect(message).toContain("WhatsApp: +231 77 012 3456");
    expect(message).toContain(`Order details: ${ORDER_LINK}`);
  });

  it("uses the order's snapshot rate", () => {
    expect(buildOrderMessage(order({ lrdPerUsd: 200 }), { orderLink: ORDER_LINK })).toContain("(≈ L$137,976)");
  });

  it("omits the street when there is none", () => {
    const text = buildOrderMessage(
      order({ delivery: { area: "Paynesville", street: null, landmark: "ELWA junction", notes: null } }),
      { orderLink: ORDER_LINK },
    );
    expect(text).toContain("Delivery: Paynesville\nLandmark: ELWA junction\nPayment:");
    expect(text).not.toContain("Notes:");
  });

  it("describes pickup", () => {
    const text = buildOrderMessage(order({ fulfilment: "pickup", delivery: null }), { orderLink: ORDER_LINK });
    expect(text).toContain("Pickup: point to agree on WhatsApp");
    expect(text).not.toContain("Landmark:");
  });
});

describe("buildOrderMessage (templates)", () => {
  it("uses a custom template and keeps unknown placeholders", () => {
    const text = buildOrderMessage(order(), {
      template: "Order {{order_number}} for {{customer_name}} {{unknown}}",
      orderLink: ORDER_LINK,
    });
    expect(text).toBe("Order AG-1027 for Test Buyer {{unknown}}");
  });

  it("falls back to the default template when the setting is blank", () => {
    expect(buildOrderMessage(order(), { template: "   ", orderLink: ORDER_LINK })).toBe(
      buildOrderMessage(order(), { template: DEFAULT_ORDER_TEMPLATE, orderLink: ORDER_LINK }),
    );
  });

  it("never expands placeholders typed by the buyer", () => {
    const text = buildOrderMessage(order({ customerName: "{{items}} {{order_link}}" }), {
      template: "Name: {{customer_name}}",
      orderLink: ORDER_LINK,
    });
    expect(text).toBe("Name: {{items}} {{order_link}}");
  });
});

describe("buildOrderMessage (length budget)", () => {
  const manyItems = Array.from({ length: 30 }, (_, i) => ({
    productName: `Hand-stitched Leather Weekender Bag Number ${i + 1}`,
    color: "Cognac Brown",
    size: "One size",
    quantity: 1,
    lineTotalCents: 19900,
  }));

  it("summarises long orders to fit the budget", () => {
    const text = buildOrderMessage(order({ items: manyItems }), { orderLink: ORDER_LINK });
    expect(text.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(text).toMatch(/…and \d+ more items \(see order details\)/);
    expect(text).toContain("Hand-stitched Leather Weekender Bag Number 1 ");
    expect(text).toContain(`Order details: ${ORDER_LINK}`);
  });

  it("trims long delivery notes when items alone don't fit", () => {
    const delivery = { area: "Sinkor", street: null, landmark: "Total" };
    const base = buildOrderMessage(order({ customerName: "", delivery: { ...delivery, notes: null } }), {
      orderLink: ORDER_LINK,
    }).length;
    // Leaves room for ~80 characters of notes, not 300.
    const customerName = "N".repeat(MAX_MESSAGE_LENGTH - base - 100);
    const notes = "x".repeat(300);
    const text = buildOrderMessage(order({ customerName, delivery: { ...delivery, notes } }), { orderLink: ORDER_LINK });
    expect(text.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(text).toContain(`Notes: ${"x".repeat(79)}…\n`);
    expect(text).toContain(`Order details: ${ORDER_LINK}`);
  });

  it("hard-caps anything still too long", () => {
    const text = buildOrderMessage(order(), { template: "y".repeat(5000), orderLink: ORDER_LINK });
    expect(text).toHaveLength(MAX_MESSAGE_LENGTH);
    expect(text.endsWith("…")).toBe(true);
  });
});

describe("buildWaMeUrl", () => {
  it("uses the digits of the number and encodes the text", () => {
    const url = buildWaMeUrl("+231779268242", "Hi & bye #1\nLine 2");
    expect(url).toBe("https://wa.me/231779268242?text=Hi%20%26%20bye%20%231%0ALine%202");
    expect(new URL(url).searchParams.get("text")).toBe("Hi & bye #1\nLine 2");
  });
});
