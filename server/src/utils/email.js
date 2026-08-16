import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const from = process.env.EMAIL_FROM || "Ashal Marketplace <noreply@ashal.com>";
    const mailer = getTransporter();

    if (!mailer) {
      if (process.env.NODE_ENV !== "test") {
        console.log(`[Email Mock/Dev] To: ${to} | Subject: "${subject}"`);
      }
      return { success: true, mocked: true };
    }

    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Failed] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Customer Order Confirmation Email
 */
export async function sendOrderConfirmationEmail({ customerEmail, customerName, order, subOrders = [] }) {
  if (!customerEmail) return { success: false, error: "No customer email provided" };

  const orderShortId = order._id?.toString().slice(-6).toUpperCase() || "N/A";
  const itemsList = subOrders
    .flatMap((sub) => sub.items || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const shipping = order.shippingAddress
    ? [order.shippingAddress.line1, order.shippingAddress.city, order.shippingAddress.country]
        .filter(Boolean)
        .join(", ")
    : "Standard delivery";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background-color: #0f766e; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Ashal Marketplace</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Thank you for your order, ${customerName || "Customer"}!</h2>
        <p style="color: #475569; font-size: 14px;">Your order <strong>#${orderShortId}</strong> has been confirmed and forwarded to the respective vendors for fulfillment.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 12px;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px 8px 4px; text-align: right; font-weight: bold;">Grand Total:</td>
              <td style="padding: 12px 8px 4px; text-align: right; font-weight: bold; color: #0f766e; font-size: 16px;">$${Number(order.grandTotal).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #475569;">
          <p style="margin: 0 0 6px;"><strong>Delivery Address:</strong> ${shipping}</p>
          <p style="margin: 0;"><strong>Payment Method:</strong> ${String(order.paymentMethod || "Cash on Delivery").toUpperCase()}</p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
          If you have any questions, visit your Ashal Orders page or reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${orderShortId} - Ashal`,
    html,
  });
}

/**
 * Vendor New Order Notification Email
 */
export async function sendVendorNewOrderEmail({ vendorEmail, vendorName, storeName, subOrder }) {
  if (!vendorEmail) return { success: false, error: "No vendor email provided" };

  const subOrderShortId = subOrder._id?.toString().slice(-6).toUpperCase() || "N/A";
  const itemsList = (subOrder.items || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background-color: #0f766e; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Ashal Vendor Hub</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">New Order for ${storeName || "your store"}!</h2>
        <p style="color: #475569; font-size: 14px;">Hello ${vendorName || "Vendor"}, you have received a new sub-order <strong>#${subOrderShortId}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 12px;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px 8px 4px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 12px 8px 4px; text-align: right; font-weight: bold; color: #0f766e; font-size: 16px;">$${Number(subOrder.subtotal).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="font-size: 14px; color: #334155;">
          Please log into your <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/vendor/orders" style="color: #0f766e; font-weight: bold; text-decoration: none;">Vendor Portal</a> to confirm and prepare this order for shipping.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `New Order Received for ${storeName || "Store"} (#${subOrderShortId})`,
    html,
  });
}

/**
 * Contact Form Acknowledgment Email
 */
export async function sendContactAcknowledgmentEmail({ name, email, subject, message }) {
  if (!email) return { success: false, error: "No email provided" };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background-color: #0f766e; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Ashal Support</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">We've received your message, ${name || "there"}!</h2>
        <p style="color: #475569; font-size: 14px;">Thank you for contacting Ashal Marketplace. Our support team will review your inquiry and get back to you shortly.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0f766e; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px; font-weight: bold; color: #0f172a;">${subject}</p>
          <p style="margin: 0; color: #475569; font-size: 13px; white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
          This is an automated acknowledgment. You do not need to reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `We received your message: "${subject}" - Ashal Support`,
    html,
  });
}
