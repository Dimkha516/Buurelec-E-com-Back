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
  const deliveryBlock =
    order.deliveryMethod === "HOME_DELIVERY"
      ? `<p><strong>Mode de livraison :</strong> Livraison à domicile</p>
         <p><strong>Adresse :</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}${order.shippingAddress.zipCode ? ` (${order.shippingAddress.zipCode})` : ""}</p>`
      : `<p><strong>Mode de livraison :</strong> Point de retrait</p>
         <p><strong>Point de retrait :</strong> ${order.pickupPoint.name} — ${order.pickupPoint.address}, ${order.pickupPoint.city}</p>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <h2 style="color:#1a1a1a;">Bonjour ${user.firstName},</h2>
      <p>Bonne nouvelle : votre commande <strong>${order.orderNumber}</strong> a été <strong>validée</strong> par notre équipe.</p>

      <p>Nous la préparons et vous tiendrons informé(e) de son expédition.</p>

      <h3 style="margin-top:24px;">Récapitulatif</h3>
      <p><strong>Montant total :</strong> ${formatAmount(order.totalAmount)}</p>
      ${order.deliveryDate ? `<p><strong>Date de livraison prévue :</strong> ${formatDate(order.deliveryDate)}</p>` : ""}

      <h3 style="margin-top:24px;">Livraison</h3>
      ${deliveryBlock}

      <p style="margin-top:24px;">Merci pour votre confiance,<br/>L'équipe BuurElec</p>
    </div>
  `;
};
