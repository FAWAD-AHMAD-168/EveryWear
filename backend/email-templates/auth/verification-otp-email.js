const verificationOtpEmail = (otp) => {
  return `<html>
  <body style="font-family: Arial, sans-serif;">
    <h2>Email Verification</h2>

    <p>Your verification code is:</p>

    <h2 style="letter-spacing: 5px;">${otp}</h2>

    <p>This OTP will expire in 10 minutes.</p>

    <p>
      If you didn't request this code, you can safely ignore this email.
    </p>
  </body>
</html>`;
};

export default verificationOtpEmail;
