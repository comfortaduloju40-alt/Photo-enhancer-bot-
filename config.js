/**
 * Centralized configuration. Loads and validates all environment
 * variables in one place — every other module requires `config` from
 * here instead of reading process.env directly.
 */

require("dotenv").config();

const required = ["BOT_TOKEN", "WEBHOOK_URL"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  WEBHOOK_URL: process.env.WEBHOOK_URL.replace(/\/$/, ""),
  PORT: process.env.PORT || 8000,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  get webhookPath() {
    return `/webhook/${this.BOT_TOKEN}`;
  },
  get fullWebhookUrl() {
    return `${this.WEBHOOK_URL}${this.webhookPath}`;
  },
};
