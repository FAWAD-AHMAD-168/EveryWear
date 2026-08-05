const getDateRange = (dateFilter, startDate=null , endDate=null ) => {
  const now = new Date();
  let parsedStartDate, parsedEndDate;

  switch (dateFilter) {
    case "last_7_days":
      parsedStartDate = new Date(now);
      parsedStartDate.setDate(now.getDate() - 7);
      parsedStartDate.setHours(0, 0, 0, 0);
      parsedEndDate = new Date(now);
      parsedEndDate.setHours(23, 59, 59, 999);
      break;
    case "last_30_days":
      parsedStartDate = new Date(now);
      parsedStartDate.setDate(now.getDate() - 30);
      parsedStartDate.setHours(0, 0, 0, 0);
      parsedEndDate = new Date(now);
      parsedEndDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (startDate && endDate) {
        parsedStartDate = new Date(startDate);
        parsedStartDate.setHours(0, 0, 0, 0);
        parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      parsedStartDate = null;
      parsedEndDate = null;
  }

  return { startDate: parsedStartDate, endDate: parsedEndDate };
};

export default getDateRange;