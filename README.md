# Telegram Photo Enhancer Bot

Sends back an enhanced version of any photo you send: sharpened,
contrast-corrected, and denoised, powered by `sharp`. Runs in webhook
mode on Express, deployed on Railway.

## Commands

- `/start` — welcome message
- `/help` — usage info

Just send a photo (compressed or as a file/document) and the bot replies
with the enhanced version as a file, to preserve quality.

## Local development

```bash
npm install
cp .env.example .env
# fill in BOT_TOKEN from @BotFather
# for local webhook testing, use a tunnel (ngrok http 8000) and set WEBHOOK_URL to it
npm start
