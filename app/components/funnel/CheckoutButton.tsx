"use client";

import { Lock } from "@phosphor-icons/react";
import { Cta } from "./ui";
import { FUNNEL } from "@/lib/funnel/config";
import { withAttribution } from "@/lib/funnel/attribution";
import { track } from "@/lib/funnel/track";

/** Lleva al pago de Hotmart con los parámetros del anuncio. Sin link configurado se muestra apagado (nunca un botón muerto engañoso). */
export function CheckoutButton({ where, children = "Quiero Profe Exprés" }: { where: string; children?: React.ReactNode }) {
  const url = FUNNEL.checkoutUrl;
  if (!url) {
    return (
      <div className="flex flex-col gap-2">
        <Cta disabled>{children}</Cta>
        <p className="text-center text-[13px] text-muted-foreground">El pago se activa muy pronto.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Cta onClick={() => { track("checkout_click", { where }); window.location.assign(withAttribution(url)); }}>{children}</Cta>
      <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground"><Lock size={14} weight="fill" /> Pago seguro en la página de Hotmart</p>
    </div>
  );
}
