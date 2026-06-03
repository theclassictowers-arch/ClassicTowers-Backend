import { archives } from "./archives.data-access.js";
import { blacklistedToken } from "./blacklisted-token.data-access.js";
import { limits } from "./limits.data-access.js";
import { sensor } from "./sensor.data-access.js";
import { sensorStatus } from "./sensor-status.data-access.js";
import { site } from "./site.data-access.js";
import { user } from "./user.data-access.js";
import { resetToken } from "./reset-token.data-access.js";
import { pendingUser } from "./pending-user.data-access.js";

export const dataAccess = {
  save: {
    ...archives.save,
    ...blacklistedToken.save,
    ...limits.save,
    ...sensor.save,
    ...sensorStatus.save,
    ...site.save,
    ...user.save,
    ...resetToken.save,
    ...pendingUser.save,
  },

  read: {
    ...archives.read,
    ...limits.read,
    ...sensor.read,
    ...sensorStatus.read,
    ...site.read,
    ...user.read,
    ...resetToken.read,
    ...pendingUser.read,
  },

  update: {
    ...archives.update,
    ...limits.update,
    ...site.update,
    ...user.update,
  },

  remove: {
    ...archives.remove,
    ...limits.remove,
    ...sensor.remove,
    ...sensorStatus.remove,
    ...site.remove,
    ...user.remove,
    ...resetToken.remove,
    ...pendingUser.remove,
  },
  find: {
    ...user.find,
  },
};
