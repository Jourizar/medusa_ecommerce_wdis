/**
 * Email templates as plain HTML strings with inline styles (email clients
 * ignore <style> blocks and most CSS). Brand look: cream card, thick black
 * borders, hard offset shadow. Every interpolated value goes through esc().
 */

type Rendered = { subject: string; html: string; text: string };

export type OrderPlacedData = {
  display_id: number | string;
  first_name?: string | null;
  currency_code: string;
  items: { title: string; variant?: string | null; quantity: number; total: number }[];
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  total: number;
  shipping_method?: string | null;
  shipping_address?: string[];
  store_url: string;
};

export type CustomerWelcomeData = {
  first_name?: string | null;
  store_url: string;
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount);

function layout(heading: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#fff1e8;font-family:Arial,Helvetica,sans-serif;color:#000;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffaf5;border:4px solid #000;box-shadow:8px 8px 0 #77269A;">
      <tr><td style="background:#000;color:#fff;padding:16px 24px;font-size:28px;font-weight:900;letter-spacing:2px;">WDIS</td></tr>
      <tr><td style="padding:28px 24px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:900;text-transform:uppercase;">${heading}</h1>
        ${body}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function button(href: string, label: string) {
  return `<a href="${esc(href)}" style="display:inline-block;margin-top:20px;padding:12px 22px;background:#EC69D4;color:#000;border:3px solid #000;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-decoration:none;">${esc(label)}</a>`;
}

function orderPlaced(d: OrderPlacedData): Rendered {
  const m = (n: number) => money(n, d.currency_code);
  const hi = d.first_name ? `Thanks, ${esc(d.first_name)}!` : "Thanks for your order!";

  const rows = d.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:2px solid #000;">
          <strong>${esc(i.title)}</strong>${i.variant ? `<br><span style="font-size:13px;">${esc(i.variant)}</span>` : ""}
          <br><span style="font-size:13px;">Qty ${esc(i.quantity)}</span>
        </td>
        <td align="right" style="padding:8px 0;border-bottom:2px solid #000;font-weight:700;">${m(i.total)}</td>
      </tr>`
    )
    .join("");

  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:900;font-size:18px;" : ""}">${label}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:900;font-size:18px;" : ""}">${value}</td></tr>`;

  const html = layout(
    `Order #${esc(d.display_id)} confirmed`,
    `<p style="margin:0 0 20px;font-size:16px;">${hi} We've got your order and will email you again when it ships.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">${rows}</table>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:15px;">
       ${line("Subtotal", m(d.subtotal))}
       ${d.discount_total ? line("Discount", `−${m(d.discount_total)}`) : ""}
       ${line(`Shipping${d.shipping_method ? ` (${esc(d.shipping_method)})` : ""}`, m(d.shipping_total))}
       ${line("Tax", m(d.tax_total))}
       ${line("Total", m(d.total), true)}
     </table>
     ${
       d.shipping_address?.length
         ? `<p style="margin:20px 0 0;font-size:14px;"><strong style="text-transform:uppercase;">Shipping to</strong><br>${d.shipping_address.map(esc).join("<br>")}</p>`
         : ""
     }
     ${button(`${d.store_url}/account`, "View your orders")}
     <p style="margin:20px 0 0;font-size:13px;">Questions? Just reply to this email.</p>`
  );

  const text = [
    `Order #${d.display_id} confirmed`,
    "",
    ...d.items.map((i) => `${i.quantity} × ${i.title}${i.variant ? ` (${i.variant})` : ""} — ${m(i.total)}`),
    "",
    `Subtotal: ${m(d.subtotal)}`,
    ...(d.discount_total ? [`Discount: −${m(d.discount_total)}`] : []),
    `Shipping: ${m(d.shipping_total)}`,
    `Tax: ${m(d.tax_total)}`,
    `Total: ${m(d.total)}`,
    "",
    ...(d.shipping_address?.length ? ["Shipping to:", ...d.shipping_address, ""] : []),
    `View your orders: ${d.store_url}/account`,
  ].join("\n");

  return { subject: `Your WDIS order #${d.display_id} is confirmed`, html, text };
}

function customerWelcome(d: CustomerWelcomeData): Rendered {
  const who = d.first_name ? esc(d.first_name) : "friend";
  const html = layout(
    `Welcome, ${who}!`,
    `<p style="margin:0;font-size:16px;">Your WDIS account is ready. Sign in any time to track your orders and check out faster.</p>
     ${button(`${d.store_url}/products`, "Start shopping")}`
  );
  const text = `Welcome, ${d.first_name || "friend"}!\n\nYour WDIS account is ready.\n\nStart shopping: ${d.store_url}/products`;
  return { subject: "Welcome to WDIS", html, text };
}

export function renderTemplate(template: string, data: Record<string, unknown>): Rendered {
  switch (template) {
    case "order-placed":
      return orderPlaced(data as OrderPlacedData);
    case "customer-welcome":
      return customerWelcome(data as CustomerWelcomeData);
    default:
      throw new Error(`Unknown email template "${template}"`);
  }
}
