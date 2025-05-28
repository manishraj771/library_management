export const parseDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) throw new Error("Invalid date format");
    return date;
  };
  
  export const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };
  
  export const isDateOverdue = (toDate) => {
    return toDate < new Date();
  };