import { Suspense } from "react";
import { shopping } from "@/data/shopping";
import { ShoppingView } from "@/components/ShoppingView";

export default function ShoppingPage() {
  return (
    <Suspense>
      <ShoppingView weeks={shopping} />
    </Suspense>
  );
}
