const orderDeliveredEmail = (order, name) => {
  const items = order.items
    .map(
      (item) => `
        <li
          style="
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background-color: #ffffff;
          "
        >
          <!-- Product Image -->
          <div style="flex-shrink: 0;">
            <img
              src="${item.productImage}"
              alt="${item.productName}"
              width="90"
              height="90"
              style="
                width: 90px;
                height: 90px;
                object-fit: cover;
                border-radius: 8px;
                display: block;
              "
            />
          </div>

          <!-- Product Details -->
          <div
            style="
              flex: 1;
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
            "
          >
            <strong
              style="
                display: block;
                margin-bottom: 6px;
                font-size: 16px;
                color: #111827;
              "
            >
              ${item.productName}
            </strong>

            <div style="margin-bottom: 3px;">
              <span style="color: #6b7280;">Size:</span>
              <strong>${item.size}</strong>
            </div>

            <div style="margin-bottom: 3px;">
              <span style="color: #6b7280;">Quantity:</span>
              <strong>${item.quantity}</strong>
            </div>

            <div>
              <span style="color: #6b7280;">Total:</span>
              <strong style="color: #111827;">
                Rs. ${item.discountedPriceAtPurchase * item.quantity}
              </strong>
            </div>
          </div>
        </li>
      `,
    )
    .join("");

  return `
    <html>
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: Arial, sans-serif;
          color: #111827;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 30px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          "
        >
          <h1
            style="
              margin: 0 0 20px;
              font-size: 24px;
              color: #111827;
            "
          >
            Order Delivered Successfully
          </h1>

          <p
            style="
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 12px;
            "
          >
            Hi <strong>${name}</strong>,
          </p>

          <p
            style="
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            Your order has been successfully delivered. We hope you enjoy
            your purchase and thank you for choosing EveryWear!
          </p>

          <!-- Order Information -->
          <div
            style="
              margin: 20px 0;
              padding: 14px;
              background-color: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            "
          >
            <p style="margin: 0 0 8px;">
              <span style="color: #6b7280;">Order ID:</span>
              <strong>${order.orderId}</strong>
            </p>

            <p style="margin: 0 0 8px;">
              <span style="color: #6b7280;">Order Date:</span>
              ${order.createdAt}
            </p>

            <p style="margin: 0;">
              <span style="color: #6b7280;">Order Status:</span>
              <strong style="color: #16a34a;">Delivered</strong>
            </p>
          </div>

          <!-- Delivered Items -->
          <h2
            style="
              margin: 24px 0 14px;
              font-size: 18px;
              color: #111827;
            "
          >
            Delivered Items
          </h2>

          <ul
            style="
              list-style-type: none;
              margin: 0;
              padding: 0;
            "
          >
            ${items}
          </ul>

          <!-- Review CTA -->
          <div
            style="
              margin: 28px 0 20px;
              padding: 22px;
              text-align: center;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
            "
          >
            <h2
              style="
                margin: 0 0 8px;
                font-size: 18px;
                color: #111827;
              "
            >
              How was your purchase?
            </h2>

            <p
              style="
                margin: 0 0 18px;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              "
            >
              We'd love to hear what you think. Visit your orders to review
              the products you purchased.
            </p>

            <a
              href="https://your-frontend-domain.com/my-orders"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #111827;
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: bold;
                border-radius: 6px;
              "
            >
              Review Your Purchase
            </a>
          </div>

          <p
            style="
              margin-top: 24px;
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            We hope you're happy with your purchase. If you have any questions
            or concerns regarding your order, please don't hesitate to
            contact us.
          </p>

          <p
            style="
              margin-top: 12px;
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            Thank you for shopping with us!
          </p>
        </div>
      </body>
    </html>
  `;
};

export default orderDeliveredEmail;

