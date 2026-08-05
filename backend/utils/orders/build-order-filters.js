const buildOrderFilters = (
  status = null,
  paymentStatus = null,
  paymentMethod = null,
  lowerPrice = null,
  upperPrice = null,
  minPrice = null,
  maxPrice = null,
  city = null,
  province = null,
  parsedStartDate = null,
  parsedEndDate = null,
) => {
  let filterOptions = {};
  filterOptions = status ? { status: status } : {};
  filterOptions = paymentStatus ? { ...filterOptions, "paymentInfo.paymentStatus": paymentStatus } : filterOptions;
  filterOptions = paymentMethod ? { ...filterOptions, "paymentInfo.paymentMethod": paymentMethod } : filterOptions;
  filterOptions =
    lowerPrice && upperPrice
      ? {
          ...filterOptions,
          "billingDetails.grandTotal": { $gte: parseFloat(lowerPrice), $lte: parseFloat(upperPrice) },
        }
      : filterOptions;
  filterOptions = minPrice
    ? { ...filterOptions, "billingDetails.grandTotal": { $gte: parseFloat(minPrice) } }
    : filterOptions;
  filterOptions = maxPrice
    ? { ...filterOptions, "billingDetails.grandTotal": { $lte: parseFloat(maxPrice) } }
    : filterOptions;
  filterOptions = city ? { ...filterOptions, "shippingAddress.city": city } : filterOptions;
  filterOptions = province ? { ...filterOptions, "shippingAddress.province": province } : filterOptions;

  filterOptions =
    parsedStartDate && parsedEndDate
      ? { ...filterOptions, createdAt: { $gte: parsedStartDate, $lte: parsedEndDate } }
      : filterOptions;

  return filterOptions;
};

export default buildOrderFilters;
