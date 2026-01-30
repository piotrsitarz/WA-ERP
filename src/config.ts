import "dotenv/config";

type Config = {
    PORT: number;
    VERIFY_TOKEN: string;
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_GRAPH_VERSION: string;
    ODOO_BASE_URL: string;
    ODOO_DB: string;
    ODOO_USER: string;
    ODOO_PASSWORD: string;
};

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v22.0";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_PASSWORD = process.env.ODOO_PASSWORD;

// --- startup validation (fail fast) ---
if (!VERIFY_TOKEN) throw new Error("Missing WHATSAPP_VERIFY_TOKEN in .env");
if (!WHATSAPP_ACCESS_TOKEN) throw new Error("Missing WHATSAPP_ACCESS_TOKEN in .env");

if (!ODOO_BASE_URL || !ODOO_DB || !ODOO_USER || !ODOO_PASSWORD) {
    throw new Error("Missing Odoo env vars: ODOO_BASE_URL/ODOO_DB/ODOO_USER/ODOO_PASSWORD");
}

export const config: Config = {
    PORT,
    VERIFY_TOKEN: VERIFY_TOKEN!,
    WHATSAPP_ACCESS_TOKEN: WHATSAPP_ACCESS_TOKEN!,
    WHATSAPP_GRAPH_VERSION,
    ODOO_BASE_URL: ODOO_BASE_URL!,
    ODOO_DB: ODOO_DB!,
    ODOO_USER: ODOO_USER!,
    ODOO_PASSWORD: ODOO_PASSWORD!,
};
