const Jimp = require("jimp");
const path = require("path");

async function processLogo() {
  try {
    console.log("Loading image...");
    const imagePath = path.join(
      "C:", "Users", "ELCOT", "Downloads", "ChatGPT Image Jul 19, 2026, 04_57_08 PM.png"
    );
    const image = await Jimp.read(imagePath);

    console.log("Processing pixels...");
    // Tolerance for white background
    const tolerance = 240;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is white or very close to white, make it transparent
      if (red >= tolerance && green >= tolerance && blue >= tolerance) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel
      }
    });

    console.log("Saving transparent logo...");
    const outputPath = path.join(__dirname, "public", "images", "jansetu-logo.png");
    await image.writeAsync(outputPath);
    console.log("Saved successfully to", outputPath);
  } catch (error) {
    console.error("Error processing logo:", error);
  }
}

processLogo();
