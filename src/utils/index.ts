import sharp from "sharp";
import { ImageTransformFormat } from "../enum";
import { ImageTransformOutput } from "../types";

const transformImageStream = (sharpData: sharp.Sharp, type?: ImageTransformFormat) => {
  if (!type) return sharpData;
  switch (type) {
    case ImageTransformFormat.JPEG:
      return sharpData.jpeg();
    case ImageTransformFormat.PNG:
      return sharpData.png();
    case ImageTransformFormat.WEBP:
      return sharpData.webp();
    case ImageTransformFormat.TIFF:
      return sharpData.tiff();
    default:
      console.warn("format格式有误");
      return sharpData;
  }
};

const normalizeOutputConfig = (
  output: string | ImageTransformOutput | ImageTransformOutput[],
): ImageTransformOutput[] => {
  let outputPipelineData: ImageTransformOutput[];
  if (typeof output === "string") {
    outputPipelineData = [
      {
        file: output,
      },
    ];
  } else if (!Array.isArray(output)) {
    outputPipelineData = [output];
  } else {
    outputPipelineData = output;
  }
  return outputPipelineData;
};

export { transformImageStream, normalizeOutputConfig };
