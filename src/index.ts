import sharp from "sharp";
import fs from "fs";
import path from "path";
import type { WebpackPluginInstance, Compiler, StatsCompilation } from "webpack";

enum ImageTransformFormat {
  PNG = "PNG",
  JPEG = "JPEG",
  WEBP = "WebP",
  TIFF = "TIFF",
}

type ImageTransformOutput = {
  file: string;
  format?: ImageTransformFormat;
  width?: number;
  height?: number;
  options?: { [key: string]: unknown };
};

type ImageTransformConfig = {
  input: string;
  format?: ImageTransformFormat;
  output: string | ImageTransformOutput | ImageTransformOutput[];
};

class ImageTransformPlugin implements WebpackPluginInstance {
  configs: ImageTransformConfig[];

  defaultFormatType = ImageTransformFormat.JPEG;

  constructor(configs: ImageTransformConfig | ImageTransformConfig[]) {
    if (!Array.isArray(configs)) {
      configs = [configs];
    }
    this.checkConfigValid(configs);
    this.configs = configs;
  }

  apply(complier: Compiler) {
    const ID = "ImageTransformPlugin";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    complier.hooks.done.tap(ID, (compilation: StatsCompilation) => {
      this.transform();
    });
  }

  async transform() {
    const configs = this.configs;
    const handlePromises: Promise<ImageTransformOutput>[] = [];
    configs.forEach((transformConfigItem) => {
      let pipeline = sharp(transformConfigItem.input);
      const outputConfigs = this.outputConfigFormat(transformConfigItem.output);
      // 统一格式化
      const isUniFormat = outputConfigs.every((output) => !output.format);
      if (isUniFormat) {
        pipeline = this.format(pipeline, transformConfigItem.format || this.defaultFormatType);
      }
      outputConfigs.forEach((outputConfig) => {
        handlePromises.push(
          new Promise((resolve, reject) => {
            let outputPipeline = pipeline.clone();
            const outputConfigFormat = outputConfig.format || transformConfigItem.format || this.defaultFormatType;
            if (!isUniFormat) {
              outputPipeline = this.format(outputPipeline, outputConfigFormat);
            }
            // resize image
            if (outputConfig.width || outputConfig.height) {
              outputPipeline = outputPipeline.resize(outputConfig.width, outputConfig.height);
            }
            const outputFile = path.resolve(outputConfig.file);

            const outputStream = fs.createWriteStream(outputFile);
            outputPipeline.pipe(outputStream);
            outputPipeline.on("end", () => {
              resolve({
                ...outputConfig,
                format: outputConfig.format || transformConfigItem.format || this.defaultFormatType,
              });
            });
            outputPipeline.on("error", (err) => {
              reject(err);
            });
          }),
        );
      });
    });
    return Promise.all(handlePromises).then(() => console.log("image transform completely!!!"));
  }

  format(sharpData: sharp.Sharp, type?: ImageTransformFormat) {
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
        return sharpData;
    }
  }

  outputConfigFormat(output: string | ImageTransformOutput | ImageTransformOutput[]): ImageTransformOutput[] {
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
  }

  checkConfigValid(configs: ImageTransformConfig[]) {
    if (!configs.length) {
      console.warn("configs list is empty!!!");
      return;
    }
    configs.forEach((transformConfigItem) => {
      const input = transformConfigItem.input;

      if (!fs.existsSync(input)) {
        throw {
          code: 404,
          message: "input file no exist",
          errorDirectory: input,
        };
      }

      const outputConfigs = this.outputConfigFormat(transformConfigItem.output);
      const outputDirNoExist = outputConfigs.filter((output) => {
        const outputDir = path.dirname(output.file);
        return !fs.existsSync(outputDir);
      });
      if (outputDirNoExist.length) {
        throw {
          code: 404,
          message: "output directory no exist",
          errorDirectory: outputDirNoExist.map((output) => output.file),
        };
      }
      if (!transformConfigItem.format && outputConfigs.some((output) => !output.format)) {
        console.warn("未配置format字段的输出将将使用默认的format类型");
      }
    });
  }
}

export { ImageTransformPlugin, ImageTransformFormat };
