const formatAmount = (amount) =>
  Number(amount).toLocaleString("fr-FR") + " XOF";

module.exports = ({ user, order }) => {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(item.totalPrice)}</td>
        </tr>`,
    )
    .join("");

  const refundLine =
    order.paymentStatus === "REFUNDED"
      ? `<p>Votre paiement sera remboursé sous quelques jours ouvrés.</p>`
      : `<p>Aucun paiement n'a été prélevé pour cette commande.</p>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <h2 style="color:#1a1a1a;">Bonjour ${user.firstName},</h2>
      <p>Votre commande <strong>${order.orderNumber}</strong> a bien été annulée.</p>

      <h3 style="margin-top:24px;">Récapitulatif de la commande annulée</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">Produit</th>
            <th style="padding:8px;text-align:center;">Qté</th>
            <th style="padding:8px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <p style="margin-top:16px;"><strong>Montant total :</strong> ${formatAmount(order.totalAmount)}</p>

      ${refundLine}

      <p style="margin-top:24px;">Si cette annulation n'est pas de votre fait, contactez-nous immédiatement.</p>
      <p>Cordialement,<br/>L'équipe BuurElec</p>
    </div>
  `;
};
