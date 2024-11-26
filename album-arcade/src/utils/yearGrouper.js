// src/utils/yearGrouper.js
export const normalizeYear = (year) => {
    if (!year || year === 'Unknown') return 'Unknown';
    const numYear = parseInt(year);
    if (isNaN(numYear)) return 'Unknown';
    if (numYear < 1970) return 'Pre-70s';
    if (numYear < 1980) return "70's";
    if (numYear < 1990) return "80's";
    if (numYear < 2000) return "90's";
    return year.toString();
};
