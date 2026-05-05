const PAYMENT_METHOD_LABELS = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  BANK_CARD: "Carte bancaire",
  CASH: "Espèces",
};

const PAYMENT_TIMING_LABELS = {
  PREPAID: "Avant la livraison",
  ON_DELIVERY: "À la livraison",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatAmount = (amount) =>
  Number(amount).toLocaleString("fr-FR") + " XOF";

module.exports = ({ user, order }) => {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(item.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(item.totalPrice)}</td>
        </tr>`,
    )
    .join("");

  const deliveryBlock =
    order.deliveryMethod === "HOME_DELIVERY"
      ? `
        <p><strong>Mode de livraison :</strong> Livraison à domicile</p>
        <p><strong>Adresse :</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}${order.shippingAddress.zipCode ? ` (${order.shippingAddress.zipCode})` : ""}</p>`
      : `
        <p><strong>Mode de livraison :</strong> Point de retrait</p>
        <p><strong>Point de retrait :</strong> ${order.pickupPoint.name} — ${order.pickupPoint.address}, ${order.pickupPoint.city}</p>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <h2 style="color:#1a1a1a;">Bonjour ${user.firstName},</h2>
      <p>Merci pour votre commande sur <strong>BuurElec</strong> ! Voici le récapitulatif :</p>

      <h3 style="margin-top:24px;">Commande ${order.orderNumber}</h3>

      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">Produit</th>
            <th style="padding:8px;text-align:center;">Qté</th>
            <th style="padding:8px;text-align:right;">Prix unitaire</th>
            <th style="padding:8px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <table style="width:100%;margin-top:16px;">
        <tr><td>Sous-total</td><td style="text-align:right;">${formatAmount(order.subtotal)}</td></tr>
        <tr><td>Livraison</td><td style="text-align:right;">${formatAmount(order.shippingCost)}</td></tr>
        <tr style="font-weight:bold;font-size:16px;"><td>Total</td><td style="text-align:right;">${formatAmount(order.totalAmount)}</td></tr>
      </table>

      <h3 style="margin-top:24px;">Livraison</h3>
      ${deliveryBlock}
      ${order.deliveryDate ? `<p><strong>Date prévue :</strong> ${formatDate(order.deliveryDate)}</p>` : ""}

      <h3 style="margin-top:24px;">Paiement</h3>
      <p><strong>Méthode :</strong> ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</p>
      <p><strong>Modalité :</strong> ${PAYMENT_TIMING_LABELS[order.paymentTiming] || order.paymentTiming}</p>

      <p style="margin-top:24px;">Nous vous contacterons sous peu pour confirmer votre commande.</p>
      <p>Cordialement,<br/>L'équipe BuurElec</p>
    </div>
  `;
};
