import type { ReactNode } from "react";
import { WorldBackground } from "@/components/world/WorldBackground";

type GameShellProps = {
  children: ReactNode;
  showAtmosphere?: boolean;
};

export function GameShell({
  children,
  showAtmosphere = true,
}: GameShellProps) {
  return (
    <main className="ru-shell">
      <WorldBackground />

      {showAtmosphere && (
        <div className="ru-atmosphere" aria-hidden="true">
          <span className="ru-orb ru-orb-one" />
          <span className="ru-orb ru-orb-two" />

          <span className="ru-particle ru-particle-one" />
          <span className="ru-particle ru-particle-two" />
          <span className="ru-particle ru-particle-three" />
        </div>
      )}

      <div className="ru-shell-content">
        {children}
      </div>
    </main>
  );
}
