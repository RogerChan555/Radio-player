// utils/dateUtils.js
export const formatTrackTime = (dateString) => {
    if (!dateString) {
      return { date: "Invalid date", time: "Invalid time" };
    }
  
    const parsedDate = new Date(dateString.replace(" ", "T") + "Z");
    if (isNaN(parsedDate.getTime())) {
      return { date: "Invalid date", time: "Invalid time" };
    }
  
    const formattedDate = parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  
    const formattedTime = parsedDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      //second: "2-digit",
      hour12: true,
    });
  
    return { date: formattedDate, time: formattedTime };
  };
  
  export const formatDateToMySQL = (date) => {
    if (!date) return null;
  
    const utcDate = new Date(date); // Convert to Date object (if not already)
  
    // Set seconds and milliseconds to zero
    utcDate.setSeconds(0, 0);
  
    // Format to MySQL datetime string: YYYY-MM-DD HH:mm:ss
    return utcDate.toISOString().slice(0, 19).replace("T", " ");
  };
  