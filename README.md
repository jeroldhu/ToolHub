# Tools Web

一个“用后即退”的个人小工具集合 Web。当前是纯前端实现，适合放置文本处理、编码转换、时间换算、JSON 整理等不需要服务端的小工具。

## Commands

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Tools Structure

每个工具都放在独立目录中：

```text
src/tools/
  tool-id/
    Component.tsx
    index.tsx
```

`Component.tsx` 实现工具页面，`index.tsx` 导出工具在页面上展示的信息，包括 `id`、名称、说明、分类、图标和组件。

## Add A Tool

1. 在 `src/tools/<tool-id>/` 下新增 `Component.tsx` 和 `index.tsx`。
2. 在 `src/tools/toolRegistry.tsx` 中导入并加入该目录导出的 `tool`。
3. 如果是纯函数，优先放在工具目录内，保持工具彼此独立。
