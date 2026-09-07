/**
 * Entry point. Sets up the Express server, Telegram bot (webhook
 * mode), and health check endpoint for Railway.
 */

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const config = require("./config");
const logger = require("./logger");
const { registerHandlers } = require("./handlers");

const app = express();
app.use(express.json());

const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });
registerHandlers(bot);

bot
  .setWebHook(config.fullWebhookUrl)
  .then(() => logger.info("Webhook set", { url: config.fullWebhookUrl }))
  .catch((err) => logger.error("Failed to set webhook", { error: err.message }));

app.post(config.webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(config.PORT, () => {
  logger.info("Server listening", { port: config.PORT });
});
