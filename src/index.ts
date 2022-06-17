import sharp from "sharp";
import fs from "fs";
import path from "path";

import { ImageTransformConfig, ImageTransformOption, ImageTransformOutput } from "./types";
import { ImageTransformFormat } from "./enum";
import { normalizeOutputConfig, transformImageStream } from "./utils";
import { Logger } from "./entity";

const defaultImageTransformOption: ImageTransformOption = {
  defaultFormatType: ImageTransformFormat.JPEG,
  autoCreateOutputDir: true,
  context: ".",
};

interface TransformPipelineData {
  data: sharp.Sharp;
  output: ImageTransformOutput;
  config: ImageTransformConfig;
}

/**
 * 初始化后，transform输入流的文件转换输出
 */
class ImageTransformPlugin {
  configs: ImageTransformConfig[];

  option: ImageTransformOption;

  private _context: string;

  private _logger: Logger;

  constructor(configs: ImageTransformConfig | ImageTransformConfig[], option?: ImageTransformOption) {
    const mergedOption = Object.assign(defaultImageTransformOption, option);

    if (!Array.isArray(configs)) {
      configs = [configs];
    }
    this.configs = configs;
    this.option = mergedOption;
    this._context = mergedOption.context;
    this._logger = Logger;
  }

  private async checkConfigAndNormalizeOutput() {
    const logger = this.getLogger();
    const context = this.getContext();
    const { configs, option } = this;
    const isSkipCheckOutputDir = option?.autoCreateOutputDir;
    if (!configs.length) {
      logger.warn("configs list is empty!!!");
      return;
    }
    for (let index = 0; index < configs.length; index++) {
      const transformConfigItem = configs[index];
      const input = transformConfigItem.input;

      const inputFileIsExist = await this.checkFileOrDirIsExists(input, context);

      if (!inputFileIsExist) {
        throw {
          code: 404,
          message: "input输入的文件不存在",
          errorDirectory: input,
        };
      }
      const inputFileIsAllow = await this.checkFileIsAllow(input, context);

      if (!inputFileIsAllow) {
        throw {
          code: 400,
          message: "input输入不是文件类型",
          errorDirectory: input,
        };
      }

      const outputConfigs = normalizeOutputConfig(transformConfigItem.output);
      transformConfigItem.output = outputConfigs;

      // 校验输出流目录
      if (!isSkipCheckOutputDir) {
        const outputDirNoExist = await Promise.all(
          outputConfigs.map((output) => this.checkFileOrDirIsExists(path.dirname(output.file), context)),
        ).then((outputDirIsExistList) => outputDirIsExistList.map((_, i) => outputConfigs[i]).filter(Boolean));

        if (outputDirNoExist.length) {
          const noExistDir = [...new Set(outputDirNoExist.map((output) => path.dirname(output.file)))];
          throw {
            code: 404,
            message:
              "output的文件目录不存在，请先创建errorDirectory列出的目录。也可以在option参数中设置 autoCreateOutputDir 的值为true",
            errorDirectory: noExistDir,
          };
        }
      }
      if (!transformConfigItem.format && outputConfigs.some((output) => !output.format)) {
        if (!option.defaultFormatType) {
          throw {
            code: 400,
            message: "输出流未定义格式format，请定义format",
          };
        }
        logger.warn("未配置format字段的输出，将使用默认的format类型");
      }
    }
  }

  /**
   * 生成转换数据流
   * @returns
   */
  private createTransformPipelines(): Promise<TransformPipelineData[]> {
    const { configs, option } = this;
    const transformPipeline: Promise<TransformPipelineData>[] = [];

    configs.forEach((transformConfigItem) => {
      let pipeline = sharp(transformConfigItem.input);
      const outputConfigs = normalizeOutputConfig(transformConfigItem.output);
      // 统一格式化
      const isUniFormat = outputConfigs.every((output) => !output.format);
      if (isUniFormat) {
        pipeline = transformImageStream(pipeline, transformConfigItem.format || option.defaultFormatType);
      }
      outputConfigs.forEach((outputConfig) => {
        let outputPipeline = pipeline.clone();
        const outputConfigFormat = outputConfig.format || transformConfigItem.format || option.defaultFormatType;
        if (!isUniFormat) {
          outputPipeline = transformImageStream(outputPipeline, outputConfigFormat);
        }
        // resize image
        if (outputConfig.width || outputConfig.height) {
          outputPipeline = outputPipeline.resize(outputConfig.width, outputConfig.height);
        }

        const handleSave = Promise.resolve(true)
          .then(() => {
            return this.store(outputPipeline, outputConfig, transformConfigItem);
          })
          .then(() => {
            return {
              data: outputPipeline,
              output: outputConfig,
              config: transformConfigItem,
            };
          });
        transformPipeline.push(handleSave);
      });
    });

    return Promise.all(transformPipeline);
  }

  /**
   * 检查转化输入文件的地址是否存在
   * @param filePath 转化输入文件的路径
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkFileOrDirIsExists(filePath: string, context: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  /**
   * 检查转化输入文件是否可用，默认逻辑仅检查是否为文件类型
   * @param inputPath 转化输入文件的路径
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkFileIsAllow(filePath: string, context: string): Promise<boolean> {
    return fs.statSync(filePath).isFile();
  }

  /**
   * 启动转换
   * @returns
   */
  async transform() {
    this.checkConfigAndNormalizeOutput();
    const pipelinesTasks = this.createTransformPipelines();
    return pipelinesTasks.then(() => console.log("image transform completely!!!"));
  }

  /**
   * 文件上下文地址
   * @returns
   */
  getContext(): string {
    return this._context || "./";
  }

  /**
   * logger打印
   * @returns
   */
  getLogger(): Logger {
    return this._logger || Logger;
  }

  /**
   * 保存转换的数据
   * @param sharpData
   * @param output
   * @param config
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async store(sharpData: sharp.Sharp, output: ImageTransformOutput, config: ImageTransformConfig): Promise<boolean> {
    const outputFile = path.resolve(output.file);
    const logger = this.getLogger();

    if (!fs.existsSync(path.dirname(outputFile))) {
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }
    const outputStream = fs.createWriteStream(outputFile);
    sharpData.pipe(outputStream);
    return new Promise((resolve, reject) => {
      sharpData.on("end", () => {
        resolve(true);
      });
      sharpData.on("error", (err) => {
        logger.error(err);
        reject(err);
      });
    });
  }
}

export {
  ImageTransformPlugin,
  ImageTransformFormat,
  ImageTransformConfig,
  ImageTransformOutput,
  ImageTransformOption,
  Logger,
};
