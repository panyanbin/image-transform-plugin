import { ImageTransformPlugin, ImageTransformFormat } from "../lib/index";

new ImageTransformPlugin([
  {
    input: "./assets/progress.png",
    output: [
      {
        file: "./dist/progress.png",
        format: ImageTransformFormat.PNG,
        width: 800,
      },
      {
        file: "./dist/dad.jpeg",
        format: ImageTransformFormat.JPEG,
      },
    ],
  },
]).transform();
