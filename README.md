# Image-Transform-Plugin

## 描述

基于 sharp 库，把图片转换输出多张不同格式的图片，支持 SVG/PNG/JPEG/WebP/TIFF 转 PNG/JPEG/WebP/TIFF



## 安装

```bash
npm i sharp -save
npm i image-transform-plugin -D
```



## 使用

把 progress.png 输出 png 图和 jpeg 图

#### webpack plugin 使用

```js
const { ImageTransformPlugin, ImageTransformFormat } = require("image-transform-plugin");

module.exports = {
  //...
  plugins: [
    // ...other plugin
    new ImageTransformPlugin({
      input: "./assets/progress.png",
      output: [
        {
          file: "./dist/progress.png",
          format: ImageTransformFormat.PNG,
          width: 800,
        },
        {
          file: "./dist/progress.jpeg",
          format: ImageTransformFormat.JPEG,
        },
      ],
    }),
  ],
};
```

#### Node 使用

```js
import { ImageTransformPlugin, ImageTransformFormat } from "image-transform-plugin";

const imageTransform = new ImageTransformPlugin({
  input: "./assets/progress.svg",
  output: [
    {
      file: "./dist/progress.png",
      format: ImageTransformFormat.PNG,
      width: 800,
    },
    {
      file: "./dist/progress.jpeg",
      format: ImageTransformFormat.JPEG,
    },
  ],
});
imageTransform.transform();
```



## 配置项

#### input

Type: String

配置需转换源图的文件地址，eg: `./asset/icon.svg`

#### format

Type: ImageTransformFormat
Default: 'JPEG'

输出图片的格式类型，可选格式有`PNG`/`JPEG`/`WebP`/`TIFF`

#### output

Type: ImageTransformOutput | ImageTransformOutput[]

配置转换图的输出列表

ImageTransformOutput 的字段

- file：输出的图片地址，eg: `./dist/icon_64x64.png`
- format：输出图片的格式类型，Type：ImageTransformFormat
- width：输出图片的宽
- height：输出图片的高
