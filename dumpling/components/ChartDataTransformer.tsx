interface ChartDataPoint {
  date: string; // The date is represented as an ISO 8601 string
  value: number; // The value is a number
}

const transformChartData = (rawData: ChartDataPoint) => {
  // Parse the JSON string if it's not already an object
  const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

  // Extract only the 'value' from each data point
  const prices = data.map((item: any) => item.value);

  // Create the sparkline_in_7d object
  return {
    sparkline_in_7d: {
      price: prices,
    },
  };
};

// Example usage:
// const rawChartData = [{"date": "2024-09-24T18:05:00.000Z", "value": 0.0584099315637887}, ...];
// const transformedData = transformChartData(rawChartData);
// console.log(transformedData);

export default transformChartData;
