import mongoose from 'mongoose';
import { env } from '../config/env.config.js';
import { Site } from '../models/site.model.js';
import { Sensor } from '../models/sensor.model.js';
import { Limits } from '../models/limits.model.js';
import { defaultLimits } from '../helpers/index.js';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(env.DATABASE_URI);
    
    // Riyadh Coordinates
    const RIYADH_LAT = 24.7136;
    const RIYADH_LON = 46.6753;
    const TEST_IMEI = 987654321098765;

    // 1. Clean old test data to avoid duplication/confusion
    await Site.deleteMany({ imei: TEST_IMEI });
    await Sensor.deleteMany({ imei: TEST_IMEI });
    await Limits.deleteMany({ imei: TEST_IMEI });

    console.log('Creating Riyadh Test Site...');
    const site = await Site.create({
      name: "Riyadh Tower One",
      display_name: "Riyadh, Saudi Arabia",
      lat: RIYADH_LAT,
      lon: RIYADH_LON,
      imei: [TEST_IMEI]
    });
    
    await Limits.create({
      coordinates: [site.lon, site.lat],
      imei: site.imei,
      ...defaultLimits
    });

    console.log(`Generating 48 hours of trend data for Riyadh...`);

    const sensorEntries = [];
    const now = new Date();
    
    for (let i = 0; i < 48 * 4; i++) {
      const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
      // Base value logic for a nice wavy graph (Trends)
      const baseVib = Math.sin(i / 5) * 3 + 7; 
      const baseWind = Math.cos(i / 10) * 10 + 20;

      sensorEntries.push({
        imei: [TEST_IMEI],
        coordinates: [site.lon, site.lat], // Important: Must match Site exactly
        vibrationSensor: {
          sensorId: "VIB-RIYADH-01",
          speed: { 
            x: [Number((baseVib + Math.random()).toFixed(2))], 
            y: [Number((baseVib * 0.8 + Math.random()).toFixed(2))], 
            z: [Number((baseVib * 1.2 + Math.random()).toFixed(2))] 
          },
          displacement: { 
            x: [Number((Math.random() * 1.5).toFixed(2))], 
            y: [Number((Math.random() * 1.5).toFixed(2))], 
            z: [Number((Math.random() * 2).toFixed(2))] 
          },
          frequency: { x: [50], y: [50], z: [50] },
          angle: { x: [0.05], y: [0.05], z: [0.1] },
          pitchAngle: [0.2],
          rollAngle: [0.3]
        },
        windSensor: {
          sensorId: "WIND-RIYADH-01",
          speed: [Number((baseWind + Math.random() * 5).toFixed(2))],
          direction: [Number((180 + Math.random() * 30).toFixed(2))],
          humidity: [Number((20 + Math.random() * 10).toFixed(2))], // Riyadh is dry
          temperature: [Number((35 + Math.random() * 5).toFixed(2))] // Riyadh is hot
        },
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    await Sensor.insertMany(sensorEntries);
    console.log(`DONE! Seeded ${sensorEntries.length} points for Riyadh.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();