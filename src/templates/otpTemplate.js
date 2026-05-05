module.exports = (otp) => `
    <div>
        <h2>🔐 Code de vérification</h2>
        <p>Voici ton code OTP :</p>
        <h1 style="letter-spacing:5px">${otp}</h1>
        <p>Expire dans 5 minutes</p>
    </div>
`;
