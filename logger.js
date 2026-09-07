/**
 * Minimal structured logger. Every module does:
 *   const logger = require("./logger");
 *   logger.info("message", { extra: "data" });
 */

const { LOG_LEVEL } = require("./config");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[LOG_LEVEL] ?? LEVELS.info;

function log(level, message, meta) {
  if (LEVELS[level] > currentLevel) return;
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`${timestamp} | ${level.toUpperCase().padEnd(5)} | ${message}${metaStr}`);
}

module.exports = {
  error: (msg, meta) => log("error", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  debug: (msg, meta) => log("debug", msg, meta),
};
