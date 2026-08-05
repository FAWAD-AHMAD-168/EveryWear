const buildSortOptions = (sortBy, sortOrder) => {
  let sortOptions = {};
  
  if (!sortBy) {
    sortOptions = { createdAt: -1 };
  } else if (sortBy === "createdAt") {
    sortOptions = sortOrder === "oldest_to_newest" ? { createdAt: 1 } : { createdAt: -1 };
  } else if (sortBy === "price") {
    sortOptions =
      sortOrder === "low_to_high" ? { "billingDetails.grandTotal": 1 } : { "billingDetails.grandTotal": -1 };
  }
  return sortOptions;
};

export default buildSortOptions;