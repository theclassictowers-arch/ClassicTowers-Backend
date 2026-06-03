/**
 * Enhanced Mock Sensor Data Generator for Testing
 * یہ file comprehensive vibration data generate کرتی ہے
 */

export const generateMockSensorData = (parameter: string, hours: number = 24) => {
  const now = new Date();
  const data = [];

  // Generate data points for the specified hours (every 5 minutes)
  const totalPoints = hours * 12; // 12 points per hour (every 5 minutes)

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now.getTime() - (totalPoints - i) * 5 * 60 * 1000);
    const date = timestamp.toISOString().split('T')[0];
    const time = timestamp.toISOString().split('T')[1].split('.')[0];

    let dataPoint: any = {
      date,
      time,
    };

    // Add some realistic variation and trends
    const baseTime = i / totalPoints; // 0 to 1 over the time period
    const variation = Math.sin(baseTime * Math.PI * 4) * 0.3 + Math.random() * 0.2; // Sine wave + noise

    // Generate values based on parameter type with realistic ranges
    switch (parameter) {
      case 'vibrationAngle':
        dataPoint.value = (15 + variation * 10 + Math.random() * 5).toFixed(2);
        break;
      case 'vibrationDisplacement':
        dataPoint.x = (2 + variation * 3 + Math.random() * 2).toFixed(2);
        dataPoint.y = (2 + variation * 2.5 + Math.random() * 1.5).toFixed(2);
        dataPoint.z = (1.5 + variation * 2 + Math.random() * 1).toFixed(2);
        break;
      case 'vibrationFrequency':
        dataPoint.x = (60 + variation * 40 + Math.random() * 20).toFixed(1);
        dataPoint.y = (55 + variation * 35 + Math.random() * 15).toFixed(1);
        dataPoint.z = (50 + variation * 30 + Math.random() * 10).toFixed(1);
        break;
      case 'vibrationRollAngle':
        dataPoint.value = (variation * 20 + Math.random() * 5).toFixed(2);
        break;
      case 'vibrationPitchAngle':
        dataPoint.value = (variation * 15 + Math.random() * 3).toFixed(2);
        break;
      case 'vibrationSpeed':
        dataPoint.x = (1.5 + variation * 2 + Math.random() * 1).toFixed(2);
        dataPoint.y = (1.2 + variation * 1.8 + Math.random() * 0.8).toFixed(2);
        dataPoint.z = (1 + variation * 1.5 + Math.random() * 0.5).toFixed(2);
        break;
      case 'windSpeed':
        dataPoint.value = (12 + variation * 8 + Math.random() * 5).toFixed(1);
        break;
      case 'windTemperature':
        dataPoint.value = (25 + variation * 10 + Math.random() * 3).toFixed(1);
        break;
      case 'windHumidity':
        dataPoint.value = (45 + variation * 20 + Math.random() * 10).toFixed(1);
        break;
      case 'windDirection':
        dataPoint.value = (180 + variation * 90 + Math.random() * 45).toFixed(0);
        break;
      default:
        dataPoint.value = (50 + variation * 25 + Math.random() * 10).toFixed(2);
    }

    data.push(dataPoint);
  }

  return data;
};

export const generateMockLimits = () => {
  return {
    vibrationAngle: {
      green: { min: 0, max: 20 },
      yellow: { min: 20, max: 35 },
      red: { min: 35, max: 50 },
    },
    vibrationDisplacement: {
      x: {
        green: { min: 0, max: 3 },
        yellow: { min: 3, max: 6 },
        red: { min: 6, max: 12 },
      },
      y: {
        green: { min: 0, max: 2.5 },
        yellow: { min: 2.5, max: 5 },
        red: { min: 5, max: 10 },
      },
      z: {
        green: { min: 0, max: 2 },
        yellow: { min: 2, max: 4 },
        red: { min: 4, max: 8 },
      },
    },
    vibrationFrequency: {
      x: {
        green: { min: 0, max: 70 },
        yellow: { min: 70, max: 120 },
        red: { min: 120, max: 200 },
      },
      y: {
        green: { min: 0, max: 65 },
        yellow: { min: 65, max: 110 },
        red: { min: 110, max: 180 },
      },
      z: {
        green: { min: 0, max: 60 },
        yellow: { min: 60, max: 100 },
        red: { min: 100, max: 160 },
      },
    },
    vibrationSpeed: {
      x: {
        green: { min: 0, max: 2 },
        yellow: { min: 2, max: 3.5 },
        red: { min: 3.5, max: 6 },
      },
      y: {
        green: { min: 0, max: 1.8 },
        yellow: { min: 1.8, max: 3 },
        red: { min: 3, max: 5 },
      },
      z: {
        green: { min: 0, max: 1.5 },
        yellow: { min: 1.5, max: 2.5 },
        red: { min: 2.5, max: 4 },
      },
    },
    windSpeed: {
      green: { min: 0, max: 15 },
      yellow: { min: 15, max: 25 },
      red: { min: 25, max: 40 },
    },
    windTemperature: {
      green: { min: 15, max: 30 },
      yellow: { min: 10, max: 15 },
      red: { min: 35, max: 50 },
    },
    windHumidity: {
      green: { min: 30, max: 60 },
      yellow: { min: 20, max: 30 },
      red: { min: 70, max: 90 },
    },
    windDirection: {
      green: { min: 0, max: 360 },
      yellow: { min: 0, max: 360 },
      red: { min: 0, max: 360 },
    },
  };
};
