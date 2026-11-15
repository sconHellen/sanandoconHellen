import Link from "next/link";
import styles from "./Brand.module.css";

export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.brand}>
      Sanando <em>con</em> Hellen
    </Link>
  );
}
