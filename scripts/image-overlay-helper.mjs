/**
 * Node.js에서 Python Pillow 오버레이를 호출하는 헬퍼
 *
 * 사용법:
 *   import { applyImageOverlay } from './image-overlay-helper.mjs';
 *   const processedBuffer = await applyImageOverlay(imageBuffer, "제목 텍스트");
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = join(__dirname, "image_overlay.py");

/**
 * 이미지 버퍼에 텍스트 오버레이를 적용하고 WebP 버퍼를 반환.
 *
 * @param {Buffer} imageBuffer - 원본 이미지 (PNG/JPEG/WebP)
 * @param {string} text - 삽입할 텍스트 (제목 또는 H2)
 * @param {object} options
 * @param {number} [options.fontSize=64] - 폰트 크기
 * @param {number} [options.brightness=0.85] - 밝기 (0.85 = 15% 어둡게)
 * @param {string} [options.position="bottom"] - "bottom" | "top"
 * @param {string} [options.color="random"] - "random" | "white" | "R,G,B"
 * @returns {Promise<Buffer>} - WebP 이미지 버퍼
 */
export async function applyImageOverlay(imageBuffer, text, options = {}) {
  const { fontSize = 64, brightness = 0.85, position = "bottom", color = "random" } = options;

  const ts = Date.now();
  const inputPath = join(tmpdir(), `blog_img_in_${ts}.png`);
  const outputPath = join(tmpdir(), `blog_img_out_${ts}.webp`);

  try {
    await writeFile(inputPath, imageBuffer);

    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    await execFileAsync(pythonCmd, [
      PYTHON_SCRIPT,
      inputPath,
      outputPath,
      text,
      `--font-size=${fontSize}`,
      `--brightness=${brightness}`,
      `--position=${position}`,
      `--color=${color}`,
    ]);

    const result = await readFile(outputPath);
    return result;
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

/**
 * HTML 콘텐츠에서 H2 텍스트 목록 추출
 */
export function extractH2s(htmlContent) {
  const h2s = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) h2s.push(text);
  }
  return h2s;
}
