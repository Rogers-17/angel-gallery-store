import { expect, type Page, test } from "@playwright/test";
import { E2E_BUYER_NAME, randomPhone } from "./fixtures";

// Guest checkout → WhatsApp hand-off → order lookup, against the seeded demo catalog.

const PRODUCT = "/products/suede-penny-loafer";

async function addToBag(page: Page) {
  await page.goto(PRODUCT);
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("dialog", { name: /Your Bag/ })).toBeVisible();
}

test("empty checkout shows every error and focuses the first field", async ({ page }) => {
  await addToBag(page);
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter your WhatsApp number.")).toBeVisible();
  await expect(page.getByText("Enter a landmark near you.")).toBeVisible();
  await expect(page.getByText("Choose how you'd like to pay.")).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeFocused();
});

test("a guest places an order, hands it to WhatsApp and finds it again", async ({ page }) => {
  const phone = randomPhone();

  // Bag → checkout
  await addToBag(page);
  await page.getByRole("dialog").getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Checkout
  await page.getByLabel("Full name").fill(E2E_BUYER_NAME);
  await page.getByLabel("WhatsApp number").fill(phone);
  await page.getByRole("radio", { name: /^Delivery/ }).check();
  await page.getByLabel("Area / community").fill("Sinkor");
  await page.getByLabel("Nearest landmark").fill("opposite the Total station");
  await page.getByRole("radio", { name: /MTN Mobile Money/ }).check();
  await page.getByRole("checkbox", { name: /contacted on WhatsApp/ }).check();
  await page.getByRole("button", { name: "Place order" }).click();

  // Confirmation
  await page.waitForURL(/\/orders\/AG-\d+\?token=[\w-]{43}$/);
  const orderUrl = page.url();
  const number = /AG-\d+/.exec(orderUrl)![0];
  await expect(page.getByRole("heading", { level: 1, name: "One Last Step" })).toBeVisible();
  await expect(page.getByText("Awaiting confirmation")).toBeVisible();
  await expect(page.getByText(`Order ${number}`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Bag, empty" })).toBeVisible();

  const href = await page.getByRole("link", { name: "Send order on WhatsApp" }).getAttribute("href");
  const whatsapp = new URL(href!);
  expect(whatsapp.origin + whatsapp.pathname).toBe("https://wa.me/231779268242");
  const message = whatsapp.searchParams.get("text")!;
  expect(message).toContain(`place order ${number}`);
  expect(message).toContain("Landmark: opposite the Total station");
  expect(message).toContain("Payment: MTN Mobile Money");

  // Lookup: digits only + phone with spaces → the same order page
  await page.goto("/orders/lookup");
  await page.getByLabel("Order number").fill(number.replace("AG-", ""));
  await page.getByLabel("WhatsApp number").fill(phone);
  await page.getByRole("button", { name: "Find my order" }).click();
  await page.waitForURL(orderUrl);
  await expect(page.getByRole("heading", { level: 1, name: "One Last Step" })).toBeVisible();

  // Lookup with a wrong phone → generic message
  await page.goto("/orders/lookup");
  await page.getByLabel("Order number").fill(number);
  await page.getByLabel("WhatsApp number").fill("0880 000 000");
  await page.getByRole("button", { name: "Find my order" }).click();
  // (Next's route announcer is also role="alert", so match the message.)
  await expect(
    page.getByRole("alert").filter({ hasText: "We couldn't find an order with that order number and WhatsApp number." }),
  ).toBeVisible();
});
