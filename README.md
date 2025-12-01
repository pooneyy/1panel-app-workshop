# 1Panel 应用工场

[English](README_en.md) ｜ [中文](README.md)

## 概述

1Panel 应用工场是 IT-Tools 的专门版本，旨在为 1Panel 面板应用商店提供一站式的本地应用构建支持。

## 主要功能

- **完整的多语言支持**
  - 多语言页面，支持切换语言
  - 中英文 README 文件编辑器
  - 创建符合 1Panel 标准的多语言应用包
- **项目管理**
  - 支持将项目导出为 zip 文件
  - 支持将项目导出为 json 文件
  - 支持从 zip 文件导入项目
  - 支持从 json 文件导入项目
  - 支持将项目自动保存到 Local Storage, 刷新页面后数据不丢失
- **元数据管理**
  - 设置应用程序名称、描述、标签和其他元数据
- **自述文件编辑器**
  - 中英文 README 文件编辑器
  - 简单的模板管理，可以添加、移除预设的段落，支持拖拽以调整预设段落顺序
  - Markdown 编辑器，支持实时预览
- **Docker Compose 转换**
  - 自动将 Docker Compose 文件转换为 1Panel AppStore 格式
  - 识别到形如 ${ENV} 或 ${ENV:-123} 的参数，支持一键添加到“应用参数配置”中，支持添加默认值
- **应用参数配置**
  - 支持添加、删除、修改参数
  - 支持为参数调整顺序

## 快速开始

### 在线使用

访问：https://pooneyy.github.io/1panel-app-workshop

### 自托管

#### 使用预构建包

[下载预构建包](https://github.com/pooneyy/1panel-app-workshop/releases/latest/download/publish.tgz)

#### 使用 Docker Run

```bash
docker run -d --name app-workshop -p 8080:80 --pull=always ghcr.io/pooneyy/1panel-app-workshop:latest
```

#### 使用 Docker Compose

```yaml
version: '3.8'
services:
  app-workshop:
    container_name: app-workshop
    image: ghcr.io/pooneyy/1panel-app-workshop:latest
    ports:
      - 8080:80
    restart: always
    pull_policy: always
```

然后运行：

```bash
docker-compose up -d
```

## 本地开发模式

- 先决条件

  [安装 Node.js](https://nodejs.org/zh-cn/download)

  ```bash
  npm i -g pnpm
  ```

- 安装依赖

  ```bash
  pnpm i
  ```

- 启动开发服务器

  ```bash
  pnpm dev
  ```

## 1Panel AppStore 格式

1Panel 应用工场生成的软件包遵循 1Panel AppStore 格式：

```
├── app-key/
    ├── logo.png
    ├── data.yml
    ├── README.md
    ├── README_en.md
    └── version/
        ├── data.yml
        └── docker-compose.yml
```

## 许可证

本项目采用 GNU GPLv3 许可证 - 详情请参阅 LICENSE 文件。

## 致谢

- 基于 IT-Tools 项目框架
- 本项目基于 [arch3rPro/1Panel-Tools@8e557be](https://github.com/arch3rPro/1Panel-Tools/tree/8e557be) 进行二次开发。