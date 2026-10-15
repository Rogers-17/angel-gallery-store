import Link from "next/link";
import { BagIcon } from "@/components/layout/icons";
import { getCart } from "@/db/queries/cart";
import { getStoreSettings } from "@/db/queries/settings";
import { CartDrawer } from "./cart-drawer";
import { bagIconClass } from "./styles";

/** Header bag with live count and the cart drawer. Reads the cart cookie: render inside <Suspense>. */
export async function CartButton() {
  const [cart, settings] = await Promise.all([getCart(), getStoreSettings()]);
  return <CartDrawer cart={cart} lrdPerUsd={settings.lrdPerUsd} />;
}

/** Suspense fallback: the bag icon without a count, linking to /cart. */
export function CartButtonFallback() {
  return (
    <Link href="/cart" aria-label="Bag" className={bagIconClass}>
      <BagIcon />
    </Link>
  );
}
