import { LexisLcdHero } from "@/components/lexis-lcd-hero";
import { LexisFooter } from "@/components/lexis-lcd-sections";
import { LexisExampleSelector } from "@/components/lexis-example-selector";
import { LexisCommandReview } from "@/components/lexis-command-review";
import { LexisInstallConsole } from "@/components/lexis-install-console";
import styles from "./lexis-lcd.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main id="main-content" className="w-full flex-1">
        <LexisLcdHero />
        <LexisExampleSelector />
        <LexisCommandReview />
        <LexisInstallConsole />
      </main>
      <LexisFooter />
    </div>
  );
}
