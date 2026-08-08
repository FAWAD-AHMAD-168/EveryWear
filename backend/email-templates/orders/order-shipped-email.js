const orderShippedEmail = (order, name) => {
  const items = order.items
    .map(
      (item) => `
        <li
          style="
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px;
            margin-bottom: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background-color: #f9fafb;
            list-style-type: none;
          "
        >
          <!-- Product Image -->
          <div
            style="
              flex-shrink: 0;
              width: 100px;
              height: 100px;
              overflow: hidden;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              background-color: #ffffff;
            "
          >
            <img
              src="${item.productImage}"
              alt="${item.productName}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
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
    <!DOCTYPE html>
    <html>
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: Arial, sans-serif;
          color: #374151;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 30px auto;
            padding: 24px;
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
            Your Order Has Been Shipped
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
            Good news! Your order has been shipped and is now on its way to
            you. Please keep an eye out for its arrival.
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
              <strong style="color: #2563eb;">Shipped</strong>
            </p>
          </div>

          <!-- Ordered Items -->
          <h2
            style="
              margin: 24px 0 14px;
              font-size: 18px;
              color: #111827;
            "
          >
            Shipped Items
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

          <p
            style="
              margin-top: 24px;
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            Your package is on its way. We will notify you once your order
            has been delivered.
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

export default orderShippedEmail;
