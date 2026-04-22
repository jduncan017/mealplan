import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Masthead() {
  return (
    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-4 no-print">
      <Link href="/" aria-label="May Meal Plan home" className="inline-flex">
        <Image
          src="/logo.png"
          alt="May Meal Plan"
          width={726}
          height={186}
          priority
          className="h-8 w-auto sm:h-9"
        />
      </Link>
      <ThemeToggle />
    </div>
  );
}
