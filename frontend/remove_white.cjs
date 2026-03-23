const jimpPkg = require('jimp');
const Jimp = jimpPkg.Jimp || jimpPkg.default || jimpPkg;

async function removeWhiteBackground(inputPath) {
  try {
    const image = await Jimp.read(inputPath);
    
    // distance is a threshold (0 - 100)
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      // If pixel is very close to white
      if (red > 210 && green > 210 && blue > 210) {
        // Set alpha to 0 and colors to white
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write(inputPath);
    console.log('Processed', inputPath);
  } catch (err) {
    console.error('Error processing', inputPath, err);
  }
}

async function run() {
  await removeWhiteBackground('public/images/Tharuka/doc_pose_1.png');
  await removeWhiteBackground('public/images/Tharuka/doc_pose_2.png');
  await removeWhiteBackground('public/images/Tharuka/doc_pose_3.png');
}

run();
