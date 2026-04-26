import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root of the server directory
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from environment variables.");
}
