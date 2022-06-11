import sharp from "sharp";
import fs from "fs";
import path from "path";
import { WebpackPluginInstance, Compiler, StatsCompilation } from "webpack";

import { ImageTransformConfig, ImageTransformOption, ImageTransformOutput } from "./types";
import { ImageTransformFormat } from "./enum";
import { checkConfigValid, formatOutputConfig, transformImageStream } from "./utils";

const defaultImageTransformOption: ImageTransformOption = {
  defaultFormatType: ImageTransformFormat.JPEG,
  autoCreateOutputDir: true,
};

class ImageTransformPlugin implements WebpackPluginInstance {
  configs: ImageTransformConfig[];

  option: ImageTransformOption;

  constructor(configs: ImageTransformConfig | ImageTransformConfig[], option?: ImageTransformOption) {
    const mergedOption = Object.assign(defaultImageTransformOption, option);

    if (!Array.isArray(configs)) {
      configs = [configs];
    }
    checkConfigValid(configs, mergedOption);
    this.configs = configs;
    this.option = mergedOption;
  }

  /**
   * 仅用于webpack plugin自调用
   * @param complier
   */
  apply(complier: Compiler) {
    const ID = "ImageTransformPlugin";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    complier.hooks.done.tap(ID, (compilation: StatsCompilation) => {
      this.transform();
    });
  }

  async transform() {
    const { configs, option } = this;
    const handlePromises: Promise<ImageTransformOutput>[] = [];

    configs.forEach((transformConfigItem) => {
      let pipeline = sharp(transformConfigItem.input);
      const outputConfigs = formatOutputConfig(transformConfigItem.output);
      // 统一格式化
      const isUniFormat = outputConfigs.every((output) => !output.format);
      if (isUniFormat) {
        pipeline = transformImageStream(pipeline, transformConfigItem.format || option.defaultFormatType);
      }
      outputConfigs.forEach((outputConfig) => {
        handlePromises.push(
          new Promise((resolve, reject) => {
            let outputPipeline = pipeline.clone();
            const outputConfigFormat = outputConfig.format || transformConfigItem.format || option.defaultFormatType;
            if (!isUniFormat) {
              outputPipeline = transformImageStream(outputPipeline, outputConfigFormat);
            }
            // resize image
            if (outputConfig.width || outputConfig.height) {
              outputPipeline = outputPipeline.resize(outputConfig.width, outputConfig.height);
            }
            const outputFile = path.resolve(outputConfig.file);

            if (!fs.existsSync(path.dirname(outputFile))) {
              fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            }

            const outputStream = fs.createWriteStream(outputFile);
            outputPipeline.pipe(outputStream);
            outputPipeline.on("end", () => {
              resolve({
                ...outputConfig,
                format: outputConfig.format || transformConfigItem.format || option.defaultFormatType,
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
}

export { ImageTransformPlugin, ImageTransformFormat };
