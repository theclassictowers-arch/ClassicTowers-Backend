// sensor-config.js
import { defaultLimits } from "#helpers/index.js";

export const CONFIG = {
  VIBRATION: {
    speed: {
      x: defaultLimits.vibrationSpeed.x.green,
      y: defaultLimits.vibrationSpeed.y.green,
      z: defaultLimits.vibrationSpeed.z.green,
    },
    displacement: {
      x: defaultLimits.vibrationDisplacement.x.green,
      y: defaultLimits.vibrationDisplacement.y.green,
      z: defaultLimits.vibrationDisplacement.z.green,
    },
    frequency: {
      x: defaultLimits.vibrationFrequency.x.green,
      y: defaultLimits.vibrationFrequency.y.green,
      z: defaultLimits.vibrationFrequency.z.green,
    },
    angle: {
      x: defaultLimits.vibrationAngle.x.green,
      y: defaultLimits.vibrationAngle.y.green,
      z: defaultLimits.vibrationAngle.z.green,
    },
    pitchAngle: defaultLimits.vibrationPitchAngle.green,
    rollAngle: defaultLimits.vibrationRollAngle.green,
    yawAngle: defaultLimits.vibrationYawAngle.green,
    resonance: defaultLimits.vibrationResonance.green,
  },
  WIND: {
    direction: defaultLimits.windDirection.green,
    speed: defaultLimits.windSpeed.green,
    humidity: defaultLimits.windHumidity.green,
    temperature: defaultLimits.windTemperature.green,
  },
};
