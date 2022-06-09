import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { babel } from "@rollup/plugin-babel";
import eslint from "@rollup/plugin-eslint";
import json from "@rollup/plugin-json";
import { DEFAULT_EXTENSIONS } from "@babel/core";
import { terser } from "rollup-plugin-terser";

// umd是兼容amd/cjs/iife的通用打包格式，适合浏览器
const output =
  process.env.NODE_ENV === "production"
    ? [
        { file: "lib/index.js", format: "cjs", name: "ImageTransform" },
        { file: "lib/index.min.js", format: "cjs", name: "ImageTransform", plugins: [terser()] },
        { file: "lib/index.esm.js", format: "esm" },
      ]
    : [{ file: "lib/index.js", format: "cjs", name: "ImageTransform" }];

export default {
  input: "src/index.ts",
  output: output,
  plugins: [
    eslint({
      throwOnError: true,
      include: ["src/**"],
      exclude: ["node_modules/**"],
    }),
    json(),
    resolve({
      preferBuiltins: true,
    }), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript(), // 解析TypeScript
    babel({
      exclude: "node_modules/**", // 只编译我们的源代码
      babelHelpers: "bundled",
      extensions: [...DEFAULT_EXTENSIONS, ".ts", ".tsx"],
    }),
  ],
  // 忽略部分依赖，该依赖不会被打包
  external: ["sharp", "fs", "path"],
};
