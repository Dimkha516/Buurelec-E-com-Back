module.exports = ({ user, order }) => {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <h2 style="color:#1a1a1a;">Bonjour ${user.firstName},</h2>
      <p>Votre commande <strong>${order.orderNumber}</strong> a bien été <strong>livrée</strong>.</p>

      <p>Nous espérons que vous êtes satisfait(e) de vos achats. N'hésitez pas à laisser un avis sur les produits commandés — votre retour aide d'autres clients à choisir.</p>

      <p style="margin-top:24px;">À très bientôt sur BuurElec,<br/>L'équipe BuurElec</p>
    </div>
  `;
};
