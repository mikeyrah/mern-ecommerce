# Stewart-Tate & Co. launch checklist

## Required before the next deployment

- Add `STRIPE_WEBHOOK_SECRET` to the host. In Stripe, create a webhook for
  `https://YOUR-DOMAIN/api/payments/webhook` and subscribe to
  `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
- Confirm `CLIENT_URL` is the final HTTPS storefront URL with no trailing slash.
- Use Stripe live-mode values for `STRIPE_SECRET_KEY` and the webhook secret.
- Confirm `MONGO_URI`, `UPSTASH_REDIS_URL`, `ACCESS_TOKEN_SECRET`, and
  `REFRESH_TOKEN_SECRET` are set. Token secrets should be long, random, and
  different from each other.
- Confirm at least one administrator account exists and can open
  `/secret-dashboard`.

## Store operations

- Add final products, prices, images, SKUs, stock quantities, and low-stock
  thresholds.
- Place one complete live or low-value test order for shipping and one for
  local pickup. Confirm the order appears in the admin dashboard.
- Test status changes, tracking, cancellation, a return request, and a Stripe
  refund. Confirm inventory is restored only once.
- Decide whether sales tax must be collected for the locations where the store
  has tax obligations. Configure Stripe Tax or another tax workflow before
  accepting affected orders.
- Confirm the $7 shipping rate, $75 free-shipping threshold, 3–5 business-day
  estimate, pickup address, and 10 AM–6 PM pickup hours.
- Review the shipping, return, privacy, and terms pages with the business owner
  and qualified counsel. Add any required return window or non-returnable item
  rules.

## Email and customer service

- Enable Google 2-Step Verification and create a Gmail App Password.
- Set `GMAIL_USER=stewarttateandco@gmail.com` and `GMAIL_APP_PASSWORD` on the
  host. Never commit the App Password.
- Confirm `ORDER_NOTIFICATION_EMAIL=stewarttateandco@gmail.com`.
- Test order confirmation, new-order alert, fulfillment update, return request,
  and refund-result emails.
- Monitor `stewarttateandco@gmail.com` for customer and policy requests.

## Domain, monitoring, and recovery

- Connect the final domain, enforce HTTPS, and update `CLIENT_URL` and the
  Stripe webhook URL.
- Configure uptime monitoring for `/api/health` and alert on non-200 responses.
- Enable host and database backups and document how to restore them.
- Review application logs after every deployment and configure error alerts.
- Keep Stripe, MongoDB, Redis, Gmail, Cloudinary, GitHub, and hosting accounts
  protected with unique passwords and two-factor authentication.

## Final acceptance test

- Test signup, login, logout, expired-session recovery, profile image, browsing,
  cart quantities, coupons, sold-out items, shipping, pickup, checkout success,
  checkout cancellation, customer orders, admin fulfillment, inventory,
  returns, refunds, mobile layout, policy links, and contact links.
- Run `npm audit --omit=dev`, backend syntax checks, and
  `npm run build --prefix frontend`. Do not launch with known high-severity
  vulnerabilities or a failing production build.
