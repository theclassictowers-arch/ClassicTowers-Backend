import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

const siteApi = (longitude, latitude) => {
  // return `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  return `https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
};

const ROLES = {
  ADMIN: "admin",
  ORGANIZATION: "organization",
  TEAM_LEAD: "team_lead",
  OPERATOR: "operator",
};

export { UPLOAD_DIR, siteApi, ROLES };
