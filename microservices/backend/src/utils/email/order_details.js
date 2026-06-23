export const order_details = (order) => {
  const { _id: orderId, status, paymentMethod, shippingAddress, totalAmount, products } = order;
  const { governorate, city, street } = shippingAddress;
  const customerName = order.customerName;

  const productRows = products.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #ede8e0; font-size: 13px; color: #3a3a3a;">
        ${item.product?.name || item.product}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #ede8e0; font-size: 13px; color: #3a3a3a; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #ede8e0; font-size: 13px; color: #3a3a3a; text-align: right;">
        EGP ${item.price}
      </td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #f0ebe3; padding: 40px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <div style="max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #f0ebe3; letter-spacing: 3px; text-transform: uppercase;">
            YourStore
          </div>
          <div style="font-size: 11px; color: #c8a96e; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
            Order Confirmation
          </div>
        </div>

        <!-- Hero -->
        <div style="background: linear-gradient(135deg, #c8a96e 0%, #e8c98a 50%, #c8a96e 100%); padding: 32px 40px; text-align: center;">
          <div style="width: 52px; height: 52px; background: #1a1a1a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            <span style="color: #c8a96e; font-size: 22px; line-height: 1;">✓</span>
          </div>
          <h1 style="font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px;">Order Confirmed!</h1>
          <p style="font-size: 14px; color: #3a2e1e; margin: 0; line-height: 1.6;">
            Thank you for your purchase. We've received your order<br/>and will begin processing it shortly.
          </p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 36px 40px;">

          <!-- Greeting -->
          <p style="font-size: 15px; color: #4a4a4a; line-height: 1.7; margin: 0 0 28px; padding-bottom: 28px; border-bottom: 1px solid #ede8e0;">
            Hi <strong style="color: #1a1a1a;">${customerName}</strong>,<br/>
            Your order has been successfully placed. Here's a full summary below. We'll notify you once your items are on the way!
          </p>

          <!-- Order Meta -->
          <div style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #c8a96e; font-weight: 500; margin-bottom: 14px;">
            Order Details
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 50%; padding-right: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Order ID</div>
                  <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">#${orderId}</div>
                </div>
              </td>
              <td style="width: 50%; padding-left: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Order Date</div>
                  <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
              </td>
            </tr>
            <tr><td colspan="2" style="padding-top: 12px;"></td></tr>
            <tr>
              <td style="width: 50%; padding-right: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Status</div>
                  <div>
                    <span style="background: #fff8e6; color: #b07d20; border: 1px solid #f0d080; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 500; text-transform: capitalize;">
                      ${status}
                    </span>
                  </div>
                </div>
              </td>
              <td style="width: 50%; padding-left: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 10px; padding: 14px 18px;">
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-bottom: 4px;">Payment</div>
                  <div style="font-size: 14px; color: #1a1a1a; font-weight: 500; text-transform: capitalize;">${paymentMethod}</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Products -->
          <div style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #c8a96e; font-weight: 500; margin-bottom: 14px;">
            Items Ordered
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr>
              <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 400; text-align: left; padding-bottom: 10px; border-bottom: 1px solid #ede8e0;">Product</th>
              <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 400; text-align: center; padding-bottom: 10px; border-bottom: 1px solid #ede8e0;">Qty</th>
              <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 400; text-align: right; padding-bottom: 10px; border-bottom: 1px solid #ede8e0;">Price</th>
            </tr>
            ${productRows}
          </table>

          <!-- Totals -->
          <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 12px; padding: 18px 22px; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #666; padding: 5px 0;">
              <span>Subtotal</span><span>EGP ${totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #666; padding: 5px 0;">
              <span>Shipping</span><span>EGP 0</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; color: #1a1a1a; padding: 14px 0 4px; border-top: 1px solid #ede8e0; margin-top: 8px;">
              <span>Total</span>
              <span style="color: #c8a96e; font-size: 18px;">EGP ${totalAmount}</span>
            </div>
          </div>

          <!-- Address + Payment -->
          <div style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #c8a96e; font-weight: 500; margin-bottom: 14px;">
            Delivery Information
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 50%; padding-right: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 12px; padding: 18px 20px;">
                  <div style="font-size: 18px; margin-bottom: 8px;">📍</div>
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c8a96e; margin-bottom: 8px;">Shipping Address</div>
                  <div style="font-size: 13px; color: #3a3a3a; line-height: 1.7;">
                    ${street}<br/>${city}, ${governorate}
                  </div>
                </div>
              </td>
              <td style="width: 50%; padding-left: 8px; vertical-align: top;">
                <div style="background: #faf8f4; border: 1px solid #ede8e0; border-radius: 12px; padding: 18px 20px;">
                  <div style="font-size: 18px; margin-bottom: 8px;">💳</div>
                  <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c8a96e; margin-bottom: 8px;">Payment Method</div>
                  <div style="font-size: 13px; color: #3a3a3a; line-height: 1.7; text-transform: capitalize;">
                    ${paymentMethod}<br/>
                    <span style="color: #c8a96e; font-size: 12px;">EGP ${totalAmount}</span>
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align: center; padding: 4px 0 8px;">
            <a href="${process.env.CLIENT_URL}/orders/${orderId}"
               style="display: inline-block; background: #1a1a1a; color: #f0ebe3; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; padding: 14px 40px; border-radius: 50px;">
              Track Your Order
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #1a1a1a; padding: 28px 40px; text-align: center;">
          <p style="font-size: 12px; color: #666; line-height: 1.8; margin: 0;">
            Questions? Contact us at
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #c8a96e; text-decoration: none;">
              ${process.env.SUPPORT_EMAIL}
            </a>
          </p>
          <div style="width: 40px; height: 1px; background: #333; margin: 14px auto;"></div>
          <p style="font-size: 11px; color: #444; margin: 0; line-height: 1.8;">
            You received this email because you placed an order on YourStore.<br/>
            © ${new Date().getFullYear()} YourStore. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `;
};