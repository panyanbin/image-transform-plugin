# Image-Transform-Plugin

## 描述

基于 sharp 库，把图片转换输出多张不同格式的图片，支持 SVG/PNG/JPEG/WebP/TIFF 转 PNG/JPEG/WebP/TIFF



## 安装

```bash
npm i image-transform-plugin -D
```



## 使用

```js
new ImageTransformPlugin(config: ImageTransformConfig, option?: ImageTransformOption)
```

把 progress.svg 输出两张图: png 图和 jpeg 图

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

> 注意：在webpack中使用，可以使用包`image-transform-webpack-plugin`


## config参数

#### input

Type: String

配置需转换源图的文件地址，输入源的图片类型支持格式有`SVG`/`PNG`/`JPEG`/`WebP`/`TIFF`。

eg: `./asset/icon.svg`



#### format

Type: ImageTransformFormat  

输出图片的格式类型，可选有`PNG`/`JPEG`/`WebP`/`TIFF`



#### output

Type: ImageTransformOutput | ImageTransformOutput[]

配置转换图的输出列表

ImageTransformOutput 对象属性：

- file：输出的图片地址，eg: `./dist/icon_64x64.png`
- format：输出图片的格式类型，可选值同上format
- width：输出图片的宽，可选
- height：输出图片的高，可选


## option参数

#### autoCreateOutputDir

Type: Boolean  

输出的图片地址目录不存在时，是否自动创建该目录。默认值为true，若改为false且目录不存在时，停止转换

