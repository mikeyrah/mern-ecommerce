const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const storeUrl = () => (process.env.CLIENT_URL || "").replace(/\/$/, "");

const layout = (eyebrow, title, content) => `<!doctype html><html><body style="margin:0;background:#f8f6ef;color:#27352b;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #ded8ca;border-radius:24px;overflow:hidden"><tr><td style="background:#314b3b;padding:28px 36px;color:#fff"><div style="font-family:Georgia,serif;font-size:27px">Stewart-Tate &amp; Co.</div><div style="margin-top:6px;font-size:10px;letter-spacing:2px;color:#dce7d9">${escapeHtml(eyebrow).toUpperCase()}</div></td></tr><tr><td style="padding:34px 36px"><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:34px;line-height:1.15;color:#27352b">${escapeHtml(title)}</h1>${content}</td></tr><tr><td style="background:#f3eee2;padding:22px 36px;font-size:12px;line-height:1.6;color:#687064">Stewart-Tate &amp; Co.<br>970 N Oak St, Jackson, GA 30233</td></tr></table></td></tr></table></body></html>`;

export const sendEmail = async ({ to, subject, html }) => {
    if (!to) return { skipped: true, reason: "No recipient" };
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn(`Email skipped (${subject}): configure GMAIL_USER and GMAIL_APP_PASSWORD`);
        return { skipped: true, reason: "Email is not configured" };
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
        },
    });

    return transporter.sendMail({
        from: `"Stewart-Tate & Co." <${process.env.GMAIL_USER}>`,
        replyTo: process.env.GMAIL_USER,
        to,
        subject,
        html,
    });
};

const itemRows = (order) => order.products.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ece7dd"><strong>${escapeHtml(item.name || "Product")}</strong><br><span style="font-size:13px;color:#707970">Qty ${item.quantity}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #ece7dd">${money(item.price * item.quantity)}</td></tr>`).join("");

const fulfillment = (order) => order.deliveryMethod === "pickup"
    ? `<p style="padding:16px;background:#edf3e9;border-radius:12px;line-height:1.6"><strong>Local pickup</strong><br>${escapeHtml(order.pickupLocation)}</p>`
    : `<p style="padding:16px;background:#edf3e9;border-radius:12px;line-height:1.6"><strong>Shipping</strong><br>${escapeHtml(order.shippingAddress?.line1 || "Address collected at checkout")}<br>${escapeHtml([order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", "))}</p>`;

export const sendOrderConfirmation = (order, recipient) => sendEmail({
    to: recipient.email,
    subject: `Order confirmed: ${order.orderNumber}`,
    html: layout("Order confirmation", `Thank you, ${recipient.name || "friend"}.`, `<p style="line-height:1.7;color:#596259">Your payment was successful and order <strong>${escapeHtml(order.orderNumber)}</strong> is now being prepared.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0">${itemRows(order)}<tr><td style="padding-top:16px"><strong>Total</strong></td><td align="right" style="padding-top:16px;font-size:20px;color:#b58a34"><strong>${money(order.totalAmount)}</strong></td></tr></table>${fulfillment(order)}${storeUrl() ? `<p style="margin-top:24px"><a href="${storeUrl()}/orders" style="display:inline-block;background:#314b3b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">View your order</a></p>` : ""}`),
});

export const sendNewOrderNotification = (order, recipientEmail, customer) => sendEmail({
    to: recipientEmail,
    subject: `New paid order ${order.orderNumber} · ${money(order.totalAmount)}`,
    html: layout("New order", "A new order is ready to process.", `<p style="line-height:1.7;color:#596259"><strong>${escapeHtml(customer.name || "Customer")}</strong> completed a ${order.deliveryMethod === "pickup" ? "local pickup" : "shipping"} order.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0">${itemRows(order)}<tr><td style="padding-top:16px"><strong>Total</strong></td><td align="right" style="padding-top:16px;font-size:20px;color:#b58a34"><strong>${money(order.totalAmount)}</strong></td></tr></table>${fulfillment(order)}${storeUrl() ? `<p style="margin-top:24px"><a href="${storeUrl()}/secret-dashboard" style="display:inline-block;background:#314b3b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">Manage this order</a></p>` : ""}`),
});

export const sendOrderStatusUpdate = (order, recipient) => {
    const statusCopy = {
        processing: "We’re preparing your order with care.",
        shipped: "Your order is on its way.",
        delivered: "Your order has been delivered.",
        cancelled: "Your order has been cancelled.",
        placed: "Your order has been placed.",
    };
    const tracking = order.trackingNumber ? `<p style="padding:16px;background:#edf3e9;border-radius:12px;line-height:1.6"><strong>${escapeHtml(order.carrier || "Shipment tracking")}</strong><br>${escapeHtml(order.trackingNumber)}</p>` : "";
    return sendEmail({
        to: recipient.email,
        subject: `${order.orderNumber}: ${statusCopy[order.fulfillmentStatus]}`,
        html: layout("Order update", statusCopy[order.fulfillmentStatus], `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(recipient.name || "there")}, order <strong>${escapeHtml(order.orderNumber)}</strong> is now <strong>${escapeHtml(order.fulfillmentStatus)}</strong>.</p>${order.deliveryMethod === "pickup" && order.fulfillmentStatus === "processing" ? fulfillment(order) : tracking}${storeUrl() ? `<p style="margin-top:24px"><a href="${storeUrl()}/orders" style="display:inline-block;background:#314b3b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">View order details</a></p>` : ""}`),
    });
};
import nodemailer from "nodemailer";
