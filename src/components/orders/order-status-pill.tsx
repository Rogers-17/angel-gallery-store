import { cn } from "@/lib/cn";
import { type OrderStatus, orderStatusLabels } from "@/lib/orders/labels";

/** The order's status as a pill: green when delivered, red when cancelled or refunded. */
export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "tag",
        status === "delivered" && "bg-success/10 text-success",
        (status === "cancelled" || status === "refunded") && "bg-danger/10 text-danger",
      )}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
