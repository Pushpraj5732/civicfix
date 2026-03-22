/**
 * Returns a MongoDB date filter object based on a range string or specific dates.
 * @param {string} range - "1w" | "1m" | "6m" | "ALL" | undefined
 * @param {string} startStr - "YYYY-MM-DD"
 * @param {string} endStr - "YYYY-MM-DD"
 * @returns {object} Mongoose filter or empty object
 */
export const getDateFilter = (range, startStr, endStr) => {
  const filter = {};

  // Handle specific date boundaries (priority over preset ranges)
  if (startStr || endStr) {
    const timeFilter = {};

    if (startStr) {
      // Parse as UTC start of day (avoids timezone shift bugs on the server)
      const [yr, mo, dy] = startStr.split("-").map(Number);
      if (yr && mo && dy) {
        timeFilter.$gte = new Date(Date.UTC(yr, mo - 1, dy, 0, 0, 0, 0));
      }
    }

    if (endStr) {
      // Parse as UTC end of day
      const [yr, mo, dy] = endStr.split("-").map(Number);
      if (yr && mo && dy) {
        timeFilter.$lte = new Date(Date.UTC(yr, mo - 1, dy, 23, 59, 59, 999));
      }
    }

    if (Object.keys(timeFilter).length > 0) {
      return { createdAt: timeFilter };
    }
  }

  // Handle preset ranges
  if (!range || range === "ALL" || range === "") return {};

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
