const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

module.exports = ({ user, order }) => {
  const deliveryBlock =
    order.deliveryMethod === "HOME_DELIVERY"
      ? `<p><strong>Adresse de livraison :</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}${order.shippingAddress.zipCode ? ` (${order.shippingAddress.zipCode})` : ""}</p>`
      : `<p><strong>Point de retrait :</strong> ${order.pickupPoint.name} — ${order.pickupPoint.address}, ${order.pickupPoint.city}</p>
         <p>Votre colis sera disponible au point de retrait sous peu. Pensez à venir muni(e) d'une pièce d'identité.</p>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <h2 style="color:#1a1a1a;">Bonjour ${user.firstName},</h2>
      <p>Votre commande <strong>${order.orderNumber}</strong> vient d'être <strong>expédiée</strong>.</p>

      ${deliveryBlock}
      ${order.deliveryDate ? `<p><strong>Date de livraison prévue :</strong> ${formatDate(order.deliveryDate)}</p>` : ""}

      <p style="margin-top:24px;">Nous vous remercions de votre patience.</p>
      <p>Cordialement,<br/>L'équipe BuurElec</p>
    </div>
  `;
};
