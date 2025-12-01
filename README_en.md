# 1Panel App Workshop

[English](README_en.md) ｜ [中文](README.md)

## Overview

1Panel App Workshop is a specialized version of IT-Tools, designed to provide one-stop local app building support for the 1Panel app store.

## Main Features

- **Complete Multilingual Support**
  - Multilingual pages supporting language switching
  - Chinese and English README file editor
  - Create multilingual application packages compliant with 1Panel standards
- **Project Management**
  - Support exporting projects as zip files
  - Support exporting projects as json files
  - Support importing projects from zip files
  - Support importing projects from json files
  - Support automatic project saving to Local Storage, ensuring data persists after page refresh
- **Metadata Management**
  - Set application name, description, tags, and other metadata
- **README Editor**
  - Chinese and English README file editor
  - Simple template management: add, remove preset paragraphs, and support drag-and-drop to adjust paragraph order
  - Markdown editor with real-time preview
- **Docker Compose Conversion**
  - Automatically convert Docker Compose files to 1Panel AppStore format
  - Recognize parameters like ${ENV} or ${ENV:-123}, support one-click addition to "Application Parameter Configuration" with default value setup
- **Application Parameter Configuration**
  - Support adding, deleting, and modifying parameters
  - Support adjusting parameter order

## Getting Started

### Online Use

Visit: https://pooneyy.github.io/1panel-app-workshop

### Self-hosted

#### Using pre-built packages

[Download Pre-built Package](https://github.com/pooneyy/1panel-app-workshop/releases/latest/download/publish.tgz)

#### Using Docker Run

```bash
docker run -d --name app-workshop -p 8080:80 --pull=always ghcr.io/pooneyy/1panel-app-workshop:latest
```

#### Using Docker Compose

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

Then run:

```bash
docker-compose up -d
```

## Local Development Mode

- Precondition

  [Setup Node.js](https://nodejs.org/en/download)

  ```bash
  npm i -g pnpm
  ```

- Install dependencies

  ```bash
  pnpm i
  ```

- Run development server

  ```bash
  pnpm run dev
  ```

## 1Panel AppStore Format

The converter generates files following the 1Panel AppStore format:

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

## License

This project is licensed under the GNU GPLv3 License - see the LICENSE file for details.

## Acknowledgements

- Based on the IT-Tools project framework
- This project is forked from [arch3rPro/1Panel-Tools&#64;8e557be](https://github.com/arch3rPro/1Panel-Tools/tree/8e557be) and has been further developed.