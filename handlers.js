/**
 * Telegram command and message handlers.
 */

const config = require("./config");
const logger = require("./logger");
const { enhanceImage } = require("./imageEnhancer");

const HELP_TEXT =
  "🖼️ *Photo Enhancer Bot*\n\n" +
  "Just send me a photo and I'll enhance it — sharpening, " +
  "brightness/contrast correction, and noise reduction, all automatic.\n\n" +
  "*Commands:*\n" +
  "/start — welcome message\n" +
  "/help — this message";

function registerHandlers(bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "👋 Send me a photo and I'll enhance it for you — sharper, better contrast, less noise.",
    );
  });

  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: "Markdown" });
  });

  // Handles photos sent as compressed "photo" attachments
  bot.on("photo", (msg) => handleIncomingPhoto(bot, msg, msg.photo[msg.photo.length - 1].file_id));

  // Handles images sent as uncompressed "document" attachments (full quality)
  bot.on("document", (msg) => {
    const mime = msg.document.mime_type || "";
    if (!mime.startsWith("image/")) return; // ignore non-image documents silently
    handleIncomingPhoto(bot, msg, msg.document.file_id);
  });
}

async function handleIncomingPhoto(bot, msg, fileId) {
  const chatId = msg.chat.id;

  try {
    const file = await bot.getFile(fileId);

    const fileSizeMb = (file.file_size || 0) / (1024 * 1024);
    if (fileSizeMb > config.MAX_FILE_SIZE_MB) {
      await bot.sendMessage(chatId, `⚠️ That image is too large (max ${config.MAX_FILE_SIZE_MB}MB).`);
      return;
    }

    await bot.sendChatAction(chatId, "upload_photo");
    const statusMsg = await bot.sendMessage(chatId, "✨ Enhancing your photo...");

    const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file from Telegram: ${response.status}`);
    }
    const inputBuffer = Buffer.from(await response.arrayBuffer());

    const outputBuffer = await enhanceImage(inputBuffer);

    await bot.sendDocument(
      chatId,
      outputBuffer,
      {},
      { filename: "enhanced.jpg", contentType: "image/jpeg" },
    );

    await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {
      // non-fatal if this fails (e.g. message already gone)
    });

    logger.info("Photo enhanced and sent", { chatId });
  } catch (err) {
    logger.error("Failed to enhance photo", { chatId, error: err.message });
    await bot.sendMessage(chatId, "⚠️ Something went wrong enhancing that photo. Please try again.");
  }
}

module.exports = { registerHandlers };
