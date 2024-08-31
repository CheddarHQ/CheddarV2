export const formatValue = (value: any) => {
    if (typeof value !== 'number') {
      return value; // Return as is if not a number
    }
  
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  };