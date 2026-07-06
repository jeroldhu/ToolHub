# Tools Web

一个“用后即退”的个人小工具集合 Web。当前是纯前端实现，适合放置文本处理、编码转换、时间换算、JSON 整理等不需要服务端的小工具。

## Commands

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Add A Tool

1. 在 `src/tools/` 下新增工具组件。
2. 在 `src/tools/toolRegistry.tsx` 中注册 `id`、名称、说明、分类和组件。
3. 如果是纯函数，优先把逻辑放在组件内或同目录的小 helper，保持工具彼此独立。
