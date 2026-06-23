export const verifyEmail=(otp) =>`
  <div style="background-color: #f0ebe3; padding: 40px 16px; font-family: Georgia, 'Times New Roman', serif;">
    <div style="max-width: 480px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: #f0ebe3; letter-spacing: 3px; text-transform: uppercase;">
          YourStore
        </div>
        <div style="font-size: 11px; color: #c8a96e; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
          Account Verification
        </div>
      </div>

      <!-- Hero -->
      <div style="background: linear-gradient(135deg, #c8a96e 0%, #e8c98a 50%, #c8a96e 100%); padding: 32px 40px; text-align: center;">
        <div style="width: 52px; height: 52px; background: #1a1a1a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
          <span style="color: #c8a96e; font-size: 22px; line-height: 1;">✉</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">Verify Your Account</h1>
        <p style="font-size: 14px; color: #3a2e1e; margin: 0; line-height: 1.6;">
          Use the code below to complete your verification.
        </p>
      </div>

      <!-- Body -->
      <div style="background: #ffffff; padding: 40px;">

        <p style="font-size: 14px; color: #4a4a4a; line-height: 1.7; margin: 0 0 28px; text-align: center;">
          Enter this code in the verification screen.<br/>
          <span style="color: #999; font-size: 13px;">Do not share this code with anyone.</span>
        </p>

        <!-- OTP Box -->
        <div style="background: #faf8f4; border: 2px dashed #c8a96e; border-radius: 14px; padding: 28px 20px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #999; margin-bottom: 14px;">
            Your Verification Code
          </div>
          <div style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #1a1a1a; font-family: 'Courier New', monospace;">
            ${otp}
          </div>
        </div>

        <!-- Expiry Warning -->
        <div style="background: #fff8e6; border: 1px solid #f0d080; border-radius: 10px; padding: 12px 18px; text-align: center; margin-bottom: 8px;">
          <span style="font-size: 13px; color: #b07d20;">⏱ This code expires in <strong>10 minutes</strong></span>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #1a1a1a; padding: 28px 40px; text-align: center;">
        <p style="font-size: 12px; color: #666; line-height: 1.8; margin: 0;">
          Didn't request this? You can safely ignore this email.
        </p>
        <div style="width: 40px; height: 1px; background: #333; margin: 14px auto;"></div>
        <p style="font-size: 11px; color: #444; margin: 0; line-height: 1.8;">
          © ${new Date().getFullYear()} YourStore. All rights reserved.
        </p>
      </div>

    </div>
  </div>
`