import sharp from "sharp";
import path from "path";
import fs from "fs";
import { ImageTransformFormat } from "../enum";
import { ImageTransformConfig, ImageTransformOption, ImageTransformOutput } from "../types";

const stringify = (data: unknown) => {
  return JSON.stringify(data, null, 2);
};

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

const formatOutputConfig = (output: string | ImageTransformOutput | ImageTransformOutput[]): ImageTransformOutput[] => {
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

const checkConfigValid = (configs: ImageTransformConfig[], option: ImageTransformOption) => {
  if (!configs.length) {
    console.warn("configs list is empty!!!");
    return;
  }
  configs.forEach((transformConfigItem) => {
    const input = transformConfigItem.input;

    if (!fs.existsSync(input)) {
      throw stringify({
        code: 404,
        message: "input输入的文件不存在",
        errorDirectory: input,
      });
    }

    const outputConfigs = formatOutputConfig(transformConfigItem.output);
    // 校验输出流目录
    if (!option.autoCreateOutputDir) {
      const outputDirNoExist = outputConfigs.filter((output) => {
        const outputDir = path.dirname(output.file);
        return !fs.existsSync(outputDir);
      });
      if (outputDirNoExist.length) {
        const noExistDir = [...new Set(outputDirNoExist.map((output) => path.dirname(output.file)))];
        throw stringify({
          code: 404,
          message:
            "output的文件目录不存在，请先创建errorDirectory列出的目录。也可以在option参数中设置 autoCreateOutputDir 的值为true",
          errorDirectory: noExistDir,
        });
      }
    }
    if (!transformConfigItem.format && outputConfigs.some((output) => !output.format)) {
      if (!option.defaultFormatType) {
        throw stringify({
          code: 400,
          message: "输出流未定义格式format，请定义format",
        });
      }
      console.warn("未配置format字段的输出，将使用默认的format类型");
    }
  });
};

export { transformImageStream, formatOutputConfig, checkConfigValid };
