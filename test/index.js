const { ImageTransformPlugin, ImageTransformFormat } = require("../lib/index");

new ImageTransformPlugin({
  input: "./assets/images.svg",
  output: [
    {
      file: "./dist/images_800.png",
      format: ImageTransformFormat.PNG,
      width: 800,
    },
    {
      file: "./dist/images.jpeg",
      format: ImageTransformFormat.JPEG,
    },
  ],
}).transform();
