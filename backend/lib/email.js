import nodemailer from "nodemailer";

const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const storeUrl = () => (process.env.CLIENT_URL || "").split(",")[0].trim().replace(/\/$/, "");

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

const actionButton = (href, label) => `<p style="margin-top:26px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#314b3b;color:#fff;text-decoration:none;padding:13px 24px;border-radius:999px;font-weight:bold">${escapeHtml(label)}</a></p>`;

export const sendEmailVerification = (user, token) => {
    const url = `${storeUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    return sendEmail({
        to: user.email,
        subject: "Verify your Stewart-Tate & Co. email",
        html: layout("Account security", "Confirm your email address.", `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(user.name || "there")}, use the button below to verify your email address. This link expires in 24 hours.</p>${actionButton(url, "Verify my email")}<p style="margin-top:24px;font-size:13px;line-height:1.6;color:#7a817a">If you did not create this account, you can safely ignore this email.</p>`),
    });
};

export const sendPasswordReset = (user, token) => {
    const url = `${storeUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    return sendEmail({
        to: user.email,
        subject: "Reset your Stewart-Tate & Co. password",
        html: layout("Account security", "Reset your password.", `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(user.name || "there")}, we received a request to reset your password. This secure link expires in one hour.</p>${actionButton(url, "Choose a new password")}<p style="margin-top:24px;font-size:13px;line-height:1.6;color:#7a817a">If you did not request a reset, no changes have been made to your account.</p>`),
    });
};

export const sendBackInStock = (user, product) => sendEmail({
    to: user.email,
    subject: `${product.name} is back in stock`,
    html: layout("Wishlist update", "A favorite is back.", `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(user.name || "there")}, <strong>${escapeHtml(product.name)}</strong> is available again.</p>${product.image ? `<img src="${escapeHtml(product.image)}" alt="" width="220" style="display:block;width:220px;max-width:100%;margin:24px 0;border-radius:18px">` : ""}${storeUrl() ? actionButton(`${storeUrl()}/products/${product._id}`, "Shop this product") : ""}<p style="margin-top:24px;font-size:13px;line-height:1.6;color:#7a817a">You requested this update from your Stewart-Tate wishlist.</p>`),
});

export const sendAbandonedCartReminder = (user, items, cartTotal) => sendEmail({
    to: user.email,
    subject: "Your Stewart-Tate bag is waiting",
    html: layout("A gentle reminder", "Still thinking it over?", `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(user.name || "there")}, the pieces you selected are still waiting in your shopping bag.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0">${items.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ece7dd"><strong>${escapeHtml(item.product.name)}</strong>${item.variantLabel ? `<br><span style="font-size:13px;color:#707970">${escapeHtml(item.variantLabel)}</span>` : ""}<br><span style="font-size:13px;color:#707970">Qty ${item.quantity}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #ece7dd">${money((item.unitPrice ?? item.product.price) * item.quantity)}</td></tr>`).join("")}<tr><td style="padding-top:16px"><strong>Cart total</strong></td><td align="right" style="padding-top:16px;font-size:20px;color:#b58a34"><strong>${money(cartTotal)}</strong></td></tr></table>${storeUrl() ? actionButton(`${storeUrl()}/cart`, "Return to my bag") : ""}<p style="margin-top:24px;font-size:13px;line-height:1.6;color:#7a817a">Availability is not guaranteed. You can turn off cart reminders from your account page.</p>`),
});

const itemRows = (order) => order.products.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ece7dd"><strong>${escapeHtml(item.name || "Product")}</strong>${item.variantLabel ? `<br><span style="font-size:13px;color:#526b57">${escapeHtml(item.variantName || "Option")}: ${escapeHtml(item.variantLabel)}</span>` : ""}<br><span style="font-size:13px;color:#707970">Qty ${item.quantity}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #ece7dd">${money(item.price * item.quantity)}</td></tr>`).join("");

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

export const sendReturnStatusUpdate = (order, recipient) => {
    const refunded = order.returnRequest?.status === "refunded";
    const title = refunded ? "Your refund has been issued." : "Your return request was reviewed.";
    const message = refunded
        ? `We issued a ${money(order.returnRequest.refundAmount || order.totalAmount)} refund for order <strong>${escapeHtml(order.orderNumber)}</strong>. Your bank may take several business days to post it.`
        : `We’re unable to approve the return request for order <strong>${escapeHtml(order.orderNumber)}</strong> at this time.`;
    const note = order.returnRequest?.adminNote ? `<p style="padding:16px;background:#edf3e9;border-radius:12px;line-height:1.6"><strong>Note from Stewart-Tate &amp; Co.</strong><br>${escapeHtml(order.returnRequest.adminNote)}</p>` : "";
    return sendEmail({
        to: recipient.email,
        subject: `${order.orderNumber}: ${refunded ? "refund issued" : "return update"}`,
        html: layout("Returns & refunds", title, `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(recipient.name || "there")}, ${message}</p>${note}`),
    });
};

export const sendReturnRequestNotification = (order, customer) => sendEmail({
    to: process.env.ORDER_NOTIFICATION_EMAIL || "stewarttateandco@gmail.com",
    subject: `Return requested: ${order.orderNumber}`,
    html: layout("Return request", "A customer requested a return.", `<p style="line-height:1.7;color:#596259"><strong>${escapeHtml(customer.name || "Customer")}</strong> requested a return for order <strong>${escapeHtml(order.orderNumber)}</strong>.</p><p style="padding:16px;background:#edf3e9;border-radius:12px;line-height:1.6"><strong>Reason</strong><br>${escapeHtml(order.returnRequest?.reason || "Not provided")}${order.returnRequest?.customerNote ? `<br><br>${escapeHtml(order.returnRequest.customerNote)}` : ""}</p>${storeUrl() ? `<p style="margin-top:24px"><a href="${storeUrl()}/secret-dashboard" style="display:inline-block;background:#314b3b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">Review return</a></p>` : ""}`),
});

const customOrderDetails = (order) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0"><tr><td style="padding:9px 0;border-bottom:1px solid #ece7dd"><strong>Request</strong></td><td align="right">${escapeHtml(order.requestNumber)}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #ece7dd"><strong>Occasion</strong></td><td align="right">${escapeHtml(order.occasion)}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #ece7dd"><strong>Dessert</strong></td><td align="right">${escapeHtml(order.dessertType.replaceAll("-", " "))}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #ece7dd"><strong>Event date</strong></td><td align="right">${new Date(order.eventDate).toLocaleDateString("en-US", { timeZone: "UTC" })}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #ece7dd"><strong>Servings</strong></td><td align="right">${escapeHtml(order.servings)}</td></tr><tr><td style="padding:9px 0"><strong>Flavor</strong></td><td align="right">${escapeHtml(order.flavor)}</td></tr></table>`;

export const sendCustomOrderConfirmation = (order) => sendEmail({
    to: order.email,
    subject: `We received your Velvet Bakery request ${order.requestNumber}`,
    html: layout("The Velvet Bakery", "Your custom request is in.", `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(order.customerName)}, thank you for sharing your celebration with us. We’ll review the details and contact you about availability and pricing.</p>${customOrderDetails(order)}<p style="font-size:13px;line-height:1.6;color:#7a817a">Submitting a request does not reserve your date. Your order is confirmed after you approve the quote and receive confirmation from our team.</p>`),
});

export const sendCustomOrderNotification = (order, recipientEmail) => sendEmail({
    to: recipientEmail,
    subject: `New Velvet Bakery request ${order.requestNumber}`,
    html: layout("Custom order request", "A celebration is waiting for review.", `<p style="line-height:1.7;color:#596259"><strong>${escapeHtml(order.customerName)}</strong> submitted a custom order request. Contact: ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</p>${customOrderDetails(order)}<p style="padding:16px;background:#f3eee2;border-radius:12px;line-height:1.6"><strong>Design request</strong><br>${escapeHtml(order.designDetails)}</p>${storeUrl() ? actionButton(`${storeUrl()}/secret-dashboard`, "Review request") : ""}`),
});

export const sendCustomOrderStatusUpdate = (order) => {
    const titles = { reviewing: "We’re reviewing your request.", quoted: "Your custom quote is ready.", approved: "Your custom order is approved.", declined: "An update about your request.", completed: "Your custom order is complete.", new: "Your request is in." };
    const quote = order.quotedPrice ? `<p style="padding:16px;background:#f5e7e5;border-radius:12px;font-size:18px"><strong>Quoted price: ${money(order.quotedPrice)}</strong></p>` : "";
    const note = order.adminNote ? `<p style="padding:16px;background:#f3eee2;border-radius:12px;line-height:1.6"><strong>Message from The Velvet Bakery</strong><br>${escapeHtml(order.adminNote)}</p>` : "";
    return sendEmail({ to: order.email, subject: `${order.requestNumber}: ${titles[order.status]}`, html: layout("The Velvet Bakery", titles[order.status], `<p style="line-height:1.7;color:#596259">Hi ${escapeHtml(order.customerName)}, your custom order request is now <strong>${escapeHtml(order.status)}</strong>.</p>${quote}${note}${customOrderDetails(order)}`) });
};
