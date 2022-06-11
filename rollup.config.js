import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import eslint from "@rollup/plugin-eslint";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: [
    { file: "lib/index.js", format: "cjs" },
    { file: "lib/index.es.js", format: "esm" },
  ],
  plugins: [
    eslint({
      throwOnError: true,
      include: ["src/**"],
      exclude: ["node_modules/**"],
    }),
    json(),
    nodeResolve({
      preferBuiltins: true,
    }), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript({
      useTsconfigDeclarationDir: true,
    }), // 解析TypeScript
  ],
  // 忽略部分依赖，该依赖不会被打包
  external: ["sharp", "fs", "path"],
};
