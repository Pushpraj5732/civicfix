/**
 * Returns a MongoDB date filter object based on a range string.
 * @param {string} range - "1w" | "1m" | "6m" | undefined
 * @returns {object} Mongoose $gte filter or empty object
 */
export const getDateFilter = (range) => {
  if (!range) return {};
  const now = new Date();
  let startDate;
  switch (range) {
    case "1w":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "1m":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "6m":
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }
  return { createdAt: { $gte: startDate } };
};
