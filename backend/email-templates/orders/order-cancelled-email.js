const orderCancelledEmail = (order) => {
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
      <span style="color: #6b7280;">Total Price:</span>
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
      <body style="font-family: Arial, sans-serif;">
        <h1>Order Cancelled</h1>

        <p>
          Your order has been successfully cancelled.
        </p>

        <p>
          Order ID: <strong>${order.orderId}</strong>
        </p>

        <p>
          Order Date: ${order.createdAt}
        </p>

        <h2>Cancelled Items</h2>

        <ul>
          ${items}
        </ul>

        <h2>Cancellation Details</h2>

        <p>
          Reason: <strong>${order.cancellationInfo.reason}</strong>
        </p>

        ${order.cancellationInfo.description ? `<p>Description: ${order.cancellationInfo.description}</p>` : ""}

        <p>
          Cancellation Date: ${order.cancellationInfo.cancellationDate}
        </p>

        <p>
          If you have any questions about your order, please feel free to contact us.
        </p>
      </body>
    </html>
  `;
};

export default orderCancelledEmail;
