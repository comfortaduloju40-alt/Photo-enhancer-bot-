/**
 * Core image enhancement logic using sharp.
 *
 * Kept separate from the Telegram handlers so the enhancement pipeline
 * is independently testable and reusable.
 *
 * Enhancement pipeline (applied in this order):
 *   1. median(3)   — denoise: smooths sensor noise/grain without heavy blur
 *   2. normalize() — auto contrast stretch: expands the tonal range to
 *                    use the full black-to-white spectrum
 *   3. modulate()  — slight saturation/brightness lift for a more vivid result
 *   4. sharpen()   — restores edge definition lost during denoising
 */

const sharp = require("sharp");
const logger = require("./logger");

const MAX_DIMENSION = 4000; // safety cap so huge images don't blow up memory/time

async function enhanceImage(inputBuffer) {
  const image = sharp(inputBuffer, { failOn: "none" });
  const metadata = await image.metadata();

  logger.debug("Enhancing image", {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  });

  let pipeline = image
    .rotate() // auto-orients based on EXIF, then strips EXIF orientation to avoid double-rotation downstream
    .median(3)
    .normalize()
    .modulate({ brightness: 1.05, saturation: 1.1 })
    .sharpen({ sigma: 1.2 });

  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Output as high-quality JPEG regardless of input format — keeps
  // output predictable and file size reasonable for Telegram.
  const outputBuffer = await pipeline.jpeg({ quality: 92, mozjpeg: true }).toBuffer();

  logger.info("Image enhanced", {
    inputBytes: inputBuffer.length,
    outputBytes: outputBuffer.length,
  });

  return outputBuffer;
}

module.exports = { enhanceImage };
