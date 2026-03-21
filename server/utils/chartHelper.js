/**
 * Fills gaps in time-series trend data to ensure a continuous chart line.
 * @param {Array} trendData — [{ _id: 'YYYY-MM-DD', count: N }, ...]
 * @param {Number} days — Number of days to backfill (default: 30)
 * @returns {Array} — Filled time-series data
 */
export const fillTrendGaps = (trendData, days = 30) => {
  const result = [];
  const map = new Map(trendData.map((d) => [d._id, d.count]));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    result.push({
      _id: dateStr,
      count: map.get(dateStr) || 0,
    });
  }

  return result;
};
