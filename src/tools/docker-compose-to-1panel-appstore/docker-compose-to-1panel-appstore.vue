<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import MarkdownRender from '@/components/MarkdownRender.vue';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import yaml from 'yaml';
import { Plus as IconPlus, Download as IconDownload } from '@vicons/tabler';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// 参数类型定义
interface AppParam {
  expandTagForm: boolean; // 控制应用参数配置标签部分表单展开状态
  expandDescriptionForm: boolean; // 控制应用参数配置描述部分表单展开状态
  id: number;
  envKey: string;
  type: string;
  default: string;
  required: boolean;
  edit?: boolean;
  random?: boolean;
  labelZh: string;
  labelEn: string;
  label: {
    zh: string;
    zhHant?: string;
    en: string;
    ja?: string;
    ko?: string;
    ms?: string;
    ptBr?: string;
    ru?: string;
    tr?: string;
  };
  description?: {
    zh: string;
    zhHant: string;
    en: string;
    ja: string;
    ko: string;
    ms: string;
    ptBr: string;
    ru: string;
    tr: string;
  };
  child?: {
    default: string;
    envKey: string;
    type: string;
  };
  rule?: string;
  key?: string;
  values?: Array<{ label: string; value: string }>;
}

// 表单数据
const appForm = ref({
  key: 'my-app',
  name: 'My Application',
  description: {
    zh: '',
    zhHant: '',
    en: '',
    ja: '',
    ko: '',
    ms: '',
    ptBr: '',
    ru: '',
  },
  tags: ['Tool'],
  type: 'website',
  crossVersionUpdate: true,
  limit: 0,
  website: 'https://example.com',
  github: 'https://github.com/user/repo',
  document: 'https://docs.example.com',
  memoryRequired: undefined as number | undefined,
  memoryUnit: 'GB',
  architectures: ['amd64', 'arm64'],
});

const PLACEHOLDERS = {
  appKey: 'undefined-app',
  descEn: 'This is an auto-generated application configuration for 1Panel.',
  descZh: '这是为 1Panel 自动生成的应用程序配置。',
  version: 'latest'
};
// 响应式自述文件内容
const enbedDefaultCredentials = ref();
const defaultUsername = ref('');
const defaultPassword = ref('');
const descZh = computed(() => appForm.value.description.zh.trim() || PLACEHOLDERS.descZh);
const descEn = computed(() => appForm.value.description.en.trim() || PLACEHOLDERS.descEn);
const credentialsSectionZH = computed(() => `## 默认账户密码\n\n用户名: \`${defaultUsername.value}\`\n\n密码: \`${defaultPassword.value}\`\n\n`);
const credentialsSectionEN = computed(() => `## Default Credentials\n\nusername: \`${defaultUsername.value}\`\n\npassword: \`${defaultPassword.value}\`\n\n`);
const readmeContentZH = ref('');
const readmeContentEN = ref('');
watch([descZh, enbedDefaultCredentials, defaultUsername, defaultPassword], ([newDescZh]) => {
  if (enbedDefaultCredentials.value) {
    readmeContentZH.value = credentialsSectionZH.value + `## 产品介绍\n\n${newDescZh}\n\n## 主要功能\n\n`;
  } else {
    readmeContentZH.value = `## 产品介绍\n\n${newDescZh}\n\n## 主要功能\n\n`;
  }
}, { immediate: true });
watch([descEn, enbedDefaultCredentials, defaultUsername, defaultPassword], ([newDescEn]) => {
  if (enbedDefaultCredentials.value) {
    readmeContentEN.value = credentialsSectionEN.value + `## Introduction\n\n${newDescEn}\n\n## Features\n\n`;
  } else {
    readmeContentEN.value = `## Introduction\n\n${newDescEn}\n\n## Features\n\n`;
  }
}, { immediate: true });
// Docker Compose 内容
const dockerCompose = ref(`services:
  app:
    image: nginx:alpine
    container_name: my-app
    restart: always
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
      
  database:
    image: mysql:8.0
    container_name: my-database
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: appdb
    volumes:
      - ./data/mysql:/var/lib/mysql`);

// 应用参数配置
const appParams = ref<AppParam[]>([
  {
    expandTagForm: false,
    expandDescriptionForm: false,
    id: Date.now(),
    envKey: 'PANEL_APP_PORT_HTTP',
    type: 'number',
    default: '8080',
    required: true,
    edit: true,
    labelZh: 'HTTP 端口',
    labelEn: 'HTTP Port',
    label: {
      zh: 'HTTP 端口',
      zhHant: 'HTTP 連接埠',
      en: 'HTTP Port',
      ja: 'HTTP ポート',
      ko: 'HTTP 포트',
      ms: 'Port HTTP',
      ptBr: 'Porta HTTP',
      ru: 'HTTP Порт',
      tr: 'HTTP Portu',
    },
    description: {
      zh: '设置应用的 HTTP 访问端口，有效范围: 1-65535',
      zhHant: '設定應用程式的 HTTP 存取連接埠，有效範圍: 1-65535',
      en: 'Set the HTTP access port for the application, valid range: 1-65535',
      ja: 'アプリケーションのHTTPアクセスポートを設定します。有効範囲: 1-65535',
      ko: '애플리케이션의 HTTP 접근 포트를 설정합니다. 유효 범위: 1-65535',
      ms: 'Tetapkan port akses HTTP untuk aplikasi, julat sah: 1-65535',
      ptBr: 'Defina a porta de acesso HTTP para o aplicativo, intervalo válido: 1-65535',
      ru: 'Установите порт доступа HTTP для приложения, допустимый диапазон: 1-65535',
      tr: 'Uygulama için HTTP erişim portunu ayarlayın, geçerli aralık: 1-65535',
    },
    child: {
      default: '',
      envKey: '',
      type: 'service'
    },
    rule: 'paramPort'
  }
]);

// 可选标签
const availableTags = [
  { label: '建站', value: 'Website' },
  { label: '数据库', value: 'Database' },
  { label: 'Web 服务器', value: 'Server' },
  { label: '运行环境', value: 'Runtime' },
  { label: '实用工具', value: 'Tool' },
  { label: '云存储', value: 'Storage' },
  { label: 'AI', value: 'AI' },
  { label: 'BI', value: 'BI' },
  { label: 'CRM', value: 'CRM' },
  { label: '安全', value: 'Security' },
  { label: '开发工具', value: 'DevTool' },
  { label: 'DevOps', value: 'DevOps' },
  { label: '中间件', value: 'Middleware' },
  { label: '多媒体', value: 'Media' },
  { label: '邮件服务', value: 'Email' },
  { label: '休闲游戏', value: 'Game' },
  { label: '本地', value: 'Local' },
];

// 内存需求单位选项
const memoryUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'MB', value: 'MB' },
];

// 架构选项
const architectureOptions = [
  { label: 'amd64', value: 'amd64' },
  { label: 'arm64', value: 'arm64' },
  { label: 'arm/v7', value: 'arm/v7' },
  { label: 'arm/v6', value: 'arm/v6' },
  { label: 'arm/v5', value: 'arm/v5' },
  { label: 'loong64', value: 'loong64' },
  { label: 'mips64', value: 'mips64' },
  { label: 'mips64le', value: 'mips64le' },
  { label: 'ppc64le', value: 'ppc64le' },
  { label: 'riscv64', value: 'riscv64' },
  { label: 's390x', value: 's390x' },
  { label: 'x86 (i386)', value: '386' },
];

// 应用类型选项
const typeOptions = [
  { label: 'Website - 网站类型（支持一键部署）', value: 'website' },
  { label: 'Runtime - 运行环境类型', value: 'runtime' },
  { label: 'Tool - 工具类型', value: 'tool' },
];

// 可选环境变量
const optionalEnvVars = ref([
  { label: 'PANEL_APP_PORT_HTTP', value: 'PANEL_APP_PORT_HTTP' },
  { label: 'PANEL_APP_PORT_HTTPS', value: 'PANEL_APP_PORT_HTTPS' },
  {
    type: 'group',
    label: '数据库',
    children: [
      { label: 'PANEL_DB_TYPE', value: 'PANEL_DB_TYPE' },
      { label: 'PANEL_DB_HOST', value: 'PANEL_DB_HOST' },
      { label: 'PANEL_DB_USER', value: 'PANEL_DB_USER' },
      { label: 'PANEL_DB_USER_PASSWORD', value: 'PANEL_DB_USER_PASSWORD' },
      { label: 'PANEL_DB_NAME', value: 'PANEL_DB_NAME' },
      { label: 'PANEL_DB_ROOT_USER', value: 'PANEL_DB_ROOT_USER' },
      { label: 'PANEL_DB_ROOT_PASSWORD', value: 'PANEL_DB_ROOT_PASSWORD' },
    ]
  },
  {
    type: 'group',
    label: 'Minio',
    children: [
      { label: 'PANEL_MINIO_ROOT_USER', value: 'PANEL_MINIO_ROOT_USER' },
      { label: 'PANEL_MINIO_ROOT_PASSWORD', value: 'PANEL_MINIO_ROOT_PASSWORD' },
    ]
  },
  {
    type: 'group',
    label: 'Redis',
    children: [
      { label: 'PANEL_REDIS_ROOT_PASSWORD', value: 'PANEL_REDIS_ROOT_PASSWORD' },
    ]
  },
  { label: 'PANEL_WEBSITE_DIR', value: 'PANEL_WEBSITE_DIR' },
]);

// 参数类型选项
const paramTypes = [
  { label: 'Text - 文本', value: 'text' },
  { label: 'Password - 密码', value: 'password' },
  { label: 'Number - 数字', value: 'number' },
  { label: 'Apps - 可供选择的服务依赖', value: 'apps' },
  { label: 'Service - 固定的服务依赖', value: 'service' },
  { label: 'Select - 选择器', value: 'select' },
];

// 校验规则选项
const ruleOptions = [
  { label: 'paramPort - 端口范围 1-65535', value: 'paramPort' },
  { label: 'paramExtUrl - HTTP(S) URL格式', value: 'paramExtUrl' },
  { label: 'paramCommon - 英文数字.-_，长度2-30', value: 'paramCommon' },
  { label: 'paramComplexity - 复杂密码，长度6-30', value: 'paramComplexity' },
];

// 键名转换函数
const transformKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyMappings: Record<string, string> = {
        zhHant: 'zh-Hant',
        ptBr: 'pt-br',
      };
      const newKey = keyMappings[key] || key;
      newObj[newKey] = transformKeys(value);
    }
    return newObj;
  }
  return obj;
};
// 处理数字字段
const processNumbersForYaml = (obj) => {
  const result = JSON.parse(JSON.stringify(obj));
  const processValue = (value) => {
    if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
      return Number(value);
    }
    return value;
  };
  const traverse = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        } else {
          obj[key] = processValue(obj[key]);
        }
      }
    }
  };
  traverse(result);
  return result;
};
// 生成应用声明文件 data.yml
const appDeclarationYaml = computed(() => {
  try {
    const chineseTagNames = appForm.value.tags.map(tag => {
      const tagOption = availableTags.find(option => option.value === tag);
      return tagOption ? tagOption.label : tag;
    });
    
    const data = {
      name: appForm.value.name,
      tags: chineseTagNames,
      title: appForm.value.description.zh || appForm.value.name,
      description: appForm.value.description.zh,
      additionalProperties: {
        key: appForm.value.key,
        name: appForm.value.name,
        tags: appForm.value.tags,
        shortDescZh: appForm.value.description.zh,
        shortDescEn: appForm.value.description.en,
        description: {
          en: appForm.value.description.en,
          zh: appForm.value.description.zh,
          zhHant: appForm.value.description.zhHant,
          ja: appForm.value.description.ja,
          ms: appForm.value.description.ms,
          ptBr: appForm.value.description.ptBr,
          ru: appForm.value.description.ru,
          ko: appForm.value.description.ko,
        },
        type: appForm.value.type,
        crossVersionUpdate: appForm.value.crossVersionUpdate,
        limit: appForm.value.limit,
        website: appForm.value.website,
        github: appForm.value.github,
        document: appForm.value.document,
        ...(appForm.value.memoryRequired && appForm.value.memoryRequired > 0 ? {
          memoryRequired: appForm.value.memoryUnit === 'GB' 
            ? appForm.value.memoryRequired * 1024 
            : appForm.value.memoryRequired
        } : {}),
        architectures: appForm.value.architectures,
      }
    };
    const transformedData = transformKeys(data);
    return yaml.stringify(transformedData, { indent: 2, lineWidth: -1 });
  } catch (e) {
    return `# 生成失败: ${e}`;
  }
});

// 转换 Docker Compose（核心转换逻辑）
const convertedDockerCompose = computed(() => {
  try {
    // 反序列化为 JavaScript 对象
    const composeObj = yaml.parse(dockerCompose.value);
    
    // 1. 移除 version 字段
    delete composeObj.version;
    
    // 2. 删除所有 networks 配置
    delete composeObj.networks;
    
    // 3. 处理容器名称和网络配置
    let firstService = true;
    
    if (composeObj.services) {
      Object.keys(composeObj.services).forEach((serviceName, index) => {
        const service = composeObj.services[serviceName];
        
        // 3.1 设置容器名称
        service.container_name = firstService 
          ? '${CONTAINER_NAME}' 
          : `\${CONTAINER_NAME}-${serviceName}`;
        
        // 3.2 处理端口映射（只处理第一个服务的端口）
        if (firstService && service.ports) {
          service.ports = service.ports.map((portMapping: string, portIndex: number) => {
            // 只替换第一个端口映射
            if (portIndex === 0) {
              // 解析端口映射，如 "8080:80" 或 "8080:80/tcp"
              const portParts = portMapping.split(':');
              if (portParts.length >= 2) {
                // 将主机端口替换为变量，保持容器端口不变
                const containerPort = portParts[1];
                return `\${PANEL_APP_PORT_HTTP}:${containerPort}`;
              }
            }
            return portMapping;
          });
        }
        
        // 3.3 添加 networks 配置
        service.networks = ['1panel-network'];
        
        // 3.4 添加 labels
        if (!service.labels) {
          service.labels = {};
        }
        service.labels.createdBy = "Apps";
        
        // 标记第一个服务已处理
        if (firstService) {
          firstService = false;
        }
      });
    }
    
    // 4. 添加全局 networks 配置
    composeObj.networks = {
      '1panel-network': {
        external: true
      }
    };
    
    // 序列化为 YAML
    return yaml.stringify(composeObj, { indent: 2 });
  } catch (e) {
    return `# 转换失败: ${e}\n\n原始内容:\n${dockerCompose.value}`;
  }
});
// 过滤环境变量选项
const getFilteredEnvVarsOptions = (envKey: string) => {
  const inputValue = envKey.toLowerCase().trim();
  const MAX_OPTIONS = 7; // 设置最大选项数
  let count = 0;
  const result = [];
  for (const option of optionalEnvVars.value) {
    if (count >= MAX_OPTIONS) break;
    if (option.type === 'group' && option.children) {
      const matchedChildren = option.children.filter(child =>
        child.label.toLowerCase().includes(inputValue) ||
        child.value.toLowerCase().includes(inputValue)
      );
      if (matchedChildren.length > 0) {
        // 检查添加这个分组是否会超过限制
        if (count + matchedChildren.length <= MAX_OPTIONS) {
          result.push({ ...option, children: matchedChildren });
          count += matchedChildren.length;
        } else {
          // 如果超过限制，只添加部分子项
          const remaining = MAX_OPTIONS - count;
          result.push({ 
            ...option, 
            children: matchedChildren.slice(0, remaining) 
          });
          break;
        }
      }
    } else if (option.type === 'divider') {
      result.push(option);
    } else {
      if (( option.label.toLowerCase().includes(inputValue) ||
            option.value.toLowerCase().includes(inputValue)) && 
            count < MAX_OPTIONS ) {
        result.push(option);
        count++;
      }
    }
  }
  return result;
};
// 生成应用参数配置
const appParamsYaml = computed(() => {
  try {
    const formFields = appParams.value.map(param => {
      const field: any = {
        default: param.default,
        envKey: param.envKey,
        labelZh: param.label.zh,
        labelEn: param.label.en,
        label: param.label,
      };
      
      const child: any = {
        default: '',
        envKey: param.child.envKey,
        required: false,
        type: 'service',
      };

      const description: any = {};
      for (const [key, value] of Object.entries(param.description)) {
        if (value !== undefined && value !== null && value !== '') {
          description[key] = value;
        }
      }
      
      // 只有当有非空标签时才添加 description 字段
      if (Object.keys(description).length > 0) {
        field.description = description;
      }

      field.required = param.required;
      field.type = param.type;
      field.edit = param.edit;
      if (param.rule) field.rule = param.rule;
      if (param.random) field.random = param.random;
      if (param.type === 'service' && param.key) field.key = param.key;
      if ((param.type === 'apps' || param.type === 'select') && param.values && param.values.length > 0) field.values = param.values;
      if (param.type === 'apps') field.child = child;
      return field;
    });
    
    const data = {
      additionalProperties: {
        formFields
      }
    };
    const transformedData = transformKeys(data);
    const processedData = processNumbersForYaml(transformedData);
    return yaml.stringify(processedData, { indent: 2, lineWidth: -1 });
  } catch (e) {
    return `# 生成失败: ${e}`;
  }
});

// 添加新参数
const addParam = () => {
  appParams.value.push({
    expandTagForm: true,
    expandDescriptionForm: false,
    id: Date.now(),
    envKey: '',
    type: 'text',
    default: '',
    required: false,
    edit: true,
    random: false,
    labelZh: '',
    labelEn: '',
    label: {
      zh: '',
      zhHant: '',
      en: '',
      ja: '',
      ko: '',
      ms: '',
      ptBr: '',
      ru: '',
      tr: '',
    },
    description: {
      zh: '',
      zhHant: '',
      en: '',
      ja: '',
      ko: '',
      ms: '',
      ptBr: '',
      ru: '',
      tr: '',
    },
    child: {
      default: '',
      envKey: '',
      type: '',
    },
    rule: '',
    key: '',
    values: []
  });
};
// 上移参数
const moveParamUp = async (index: number) => {
  if (index > 0) {
    [appParams.value[index], appParams.value[index - 1]] = [appParams.value[index - 1], appParams.value[index]];
    await nextTick();
    scrollToParam(appParams.value[index - 1].id, 'smooth');
  }
};
// 下移参数
const moveParamDown = async (index: number) => {
  if (index < appParams.value.length - 1) {
    [appParams.value[index], appParams.value[index + 1]] = [appParams.value[index + 1], appParams.value[index]];
    await nextTick();
    scrollToParam(appParams.value[index + 1].id, 'smooth');
  }
};
// 滚动到指定的参数卡片
const scrollToParam = (paramId: number, behavior: ScrollBehavior = 'smooth') => {
  const element = document.querySelector(`[data-param-id="${paramId}"]`) as HTMLElement;
  if (element) { element.scrollIntoView({ behavior, block: 'start' });}
};
// 删除参数
const removeParam = (index: number) => {
  appParams.value.splice(index, 1);
};

// 为 Select 类型添加选项
const addOption = (param: AppParam) => {
  if (!param.values) {
    param.values = [];
  }
  param.values.push({ label: '', value: '' });
};

// 删除选项
const removeOption = (param: AppParam, index: number) => {
  if (param.values) {
    param.values.splice(index, 1);
  }
};

// 下载功能
const readmeContentZHBase64 = computed(() => `data:text/markdown;base64,${textToBase64(readmeContentZH.value)}`);
const readmeContentENBase64 = computed(() => `data:text/markdown;base64,${textToBase64(readmeContentEN.value)}`);
const appDeclarationBase64 = computed(() => `data:text/yaml;base64,${textToBase64(appDeclarationYaml.value)}`);
const convertedDockerComposeBase64 = computed(() => `data:text/yaml;base64,${textToBase64(convertedDockerCompose.value)}`);
const appParamsBase64 = computed(() => `data:text/yaml;base64,${textToBase64(appParamsYaml.value)}`);

const { download: downloadReadmeZH } = useDownloadFileFromBase64({ source: readmeContentZHBase64, filename: 'README.md' });
const { download: downloadReadmeEN } = useDownloadFileFromBase64({ source: readmeContentENBase64, filename: 'README_en.md' });
const { download: downloadAppDeclaration } = useDownloadFileFromBase64({ source: appDeclarationBase64, filename: 'data.yml' });
const { download: downloadDockerCompose } = useDownloadFileFromBase64({ source: convertedDockerComposeBase64, filename: 'docker-compose.yml' });
const { download: downloadAppParams } = useDownloadFileFromBase64({ source: appParamsBase64, filename: 'data.yml' });

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};
const expandDownloadAppPackage = ref(true); // 控制下载应用包卡片表单展开状态
const expandAppForm = ref(true); // 控制应用基本信息表单展开状态
const expandReadmeEditor = ref(false); // 控制自述文件编辑卡片表单展开状态
const expandAppDeclaration = ref(false); // 控制应用声明卡片表单展开状态
const expandDockerComposeEditor = ref(false); // 控制Docker Compose文件编辑卡片展开状态
const expandAppParams = ref(false); // 控制应用参数配置卡片表单展开状态
// const expandTagForm = ref(false); // 控制应用参数配置标签部分表单展开状态
// const expandDescriptionForm = ref(false); // 控制应用参数配置描述部分表单展开状态
const appVersion = ref('1.0.0');
const appLogo = ref<File | null>(null);
const defaultLogoBase64 = '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';
const logoPreview = ref<string>('');
const validateImageFile = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // 图片成功加载，说明是有效的图片文件
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // 图片加载失败，说明不是有效的图片文件
      resolve(false);
    };
      img.src = url;
  });
};
const handleLogoUpload = (options: { file: any }) => {
  try {
    const uploadedFile = options.file;
    // 检查文件类型 - 接受所有图片格式
    if (!uploadedFile.type.startsWith('image/')) {
      alert(`请上传图片文件，当前文件类型: ${uploadedFile.type}`);
      appLogo.value = null;
      return false;
    }
    validateImageFile(uploadedFile.file).then(isValidImage => {
      if (!isValidImage) {
        alert('上传的文件不是有效的图片文件，请检查文件内容');
        appLogo.value = null;
        return false;
      }
      appLogo.value = uploadedFile.file;
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(uploadedFile.file);
      return true;
    }).catch(error => {
      alert(`验证图片文件时发生错误: ${error}`);
      return false;
    });
  } catch (error) {
    alert(`上传文件时发生错误: ${error}`);
    return false;
  }
};
// 压缩图片
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      // 如果宽和高都小于等于180，直接返回原图
      if (width <= 180 && height <= 180) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsDataURL(file);
        return;
      }
      // 如果宽或高大于180，进行重绘
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // 保持宽高比
      const ratio = Math.min(180 / width, 180 / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // 转换为base64
        const compressedBase64 = canvas.toDataURL('image/png');
        resolve(compressedBase64);
      } else {
        reject(new Error('无法创建canvas上下文'));
      }
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};
// 修改打包下载函数
const downloadAllAsZip = async () => {
  try {
    const zip = new JSZip();
    const appKey = appForm.value.key.trim() || PLACEHOLDERS.appKey;
    const version = appVersion.value.trim() || PLACEHOLDERS.version;
    // 创建根目录
    const rootFolder = zip.folder(appKey);
    if (rootFolder) {
      // 添加根目录文件
      rootFolder.file('data.yml', appDeclarationYaml.value);
      // 处理logo
      let logoData = defaultLogoBase64;
      if (appLogo.value) {
        try {
          logoData = await compressImage(appLogo.value);
          logoData = logoData.replace(/^data:image\/png;base64,/, '');
        } catch (error) {
          console.error('图片压缩失败，使用默认logo:', error);
          logoData = defaultLogoBase64;
        }
      }
      rootFolder.file('logo.png', logoData, { base64: true });
      rootFolder.file('README.md', readmeContentZH.value);
      rootFolder.file('README_en.md', readmeContentEN.value);
      // 创建版本目录
      const versionFolder = rootFolder.folder(version);
      if (versionFolder) {
        // 添加版本目录文件
        versionFolder.file('data.yml', appParamsYaml.value);
        versionFolder.file('docker-compose.yml', convertedDockerCompose.value);
      }
    }
    // 生成 ZIP 文件并下载
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${appKey}.zip`);
  } catch (error) {
    console.error('打包下载失败:', error);
  }
};
// 回到顶部
const scrollToTop = () => {
  const topElement = document.querySelector('h1') as HTMLElement;
  topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
// 监听滚动事件
const showBackToTop = ref(false);
const handleScroll = () => {
  const elements = document.querySelectorAll('.n-layout-scroll-container');
  showBackToTop.value = (elements[elements.length - 1] as HTMLElement)?.scrollTop > 650;
};
// 添加和移除滚动事件监听器
const manageScrollListeners = () => {
  const elements = document.querySelectorAll('.n-layout-scroll-container');
  elements.forEach(el => {
    const element = el as HTMLElement;
    if (element.scrollHeight > element.clientHeight) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    }
  });
};
onMounted(() => {
  logoPreview.value = "data:image/png;base64," + defaultLogoBase64;
  setTimeout(() => {
    manageScrollListeners();
    setTimeout(handleScroll, 100);
  }, 500);
});
</script>

<template>
  <div>
    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandDownloadAppPackage = !expandDownloadAppPackage"
        >
          <span class="expand-collapse-card-title">打包下载应用配置</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandDownloadAppPackage = !expandDownloadAppPackage"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandDownloadAppPackage" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandDownloadAppPackage ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandDownloadAppPackage">
        <n-alert type="info" mb-4>
          上传 Logo，输入应用版本号，将所有配置文件打包为 ZIP 文件下载。
        </n-alert>
        <n-grid cols="2" x-gap="12" mb-4>
          <n-gi>
            <!-- 应用Logo上传区域 -->
            <div class="logo-upload-section">
              <n-text>应用 Logo</n-text>
              <n-form-item class="logo-upload-form-item">
                <n-upload accept="image/*" :show-file-list="false" @before-upload="handleLogoUpload">
                  <n-upload-dragger class="upload-dragger">
                    <div style="margin-bottom: 12px">
                      <n-icon size="48" :depth="3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </n-icon>
                    </div>
                    <n-text style="font-size: 16px">
                      点击或拖动图片到此区域
                    </n-text>
                    <n-p depth="3" style="margin: 8px 0 0 0">
                      建议上传180x180像素的图片，如果尺寸大于180x180将自动压缩
                    </n-p>
                  </n-upload-dragger>
                </n-upload>
              </n-form-item>
            </div>
          </n-gi>
          <n-gi>
            <!-- Logo预览区域 -->
            <div class="logo-preview-section">
              <n-text>Logo 预览</n-text>
              <div class="preview-container">
                <img :src="logoPreview" alt="Logo预览" class="logo-image" />
              </div>
            </div>
          </n-gi>
        </n-grid>
        <n-grid cols="3" x-gap="12">
          <n-gi span="2">
            <n-form-item label="应用版本" required>
              <n-input v-model:value="appVersion" placeholder="例如: 1.0.0" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label=" ">
              <n-button 
                @click="downloadAllAsZip" 
                type="primary" 
                block
              >
                <template #icon>
                  <n-icon><IconDownload /></n-icon>
                </template>
                打包下载所有配置
              </n-button>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-alert type="warning" class="mt-4">
          <div>打包后的 ZIP 文件结构：</div>
          <pre class="file-tree">{{ appForm.key || 'undefined-app' }}/
├── data.yml (应用声明文件)
├── logo.png (应用图标)
├── README.md (中文说明文档)
├── README_en.md (英文说明文档)
└── {{ appVersion || 'latest' }}/
      ├── data.yml (参数配置文件)
      └── docker-compose.yml (Docker Compose 配置)</pre>
        </n-alert>
      </div>
    </n-card>

    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandAppForm = !expandAppForm"
        >
          <span class="expand-collapse-card-title">应用基本信息</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandAppForm = !expandAppForm"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandAppForm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandAppForm ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandAppForm">
        <n-form label-placement="left" label-width="140px">
          <n-form-item label="应用Key" required>
            <n-input v-model:value="appForm.key" placeholder="仅限英文，用于Linux创建文件夹" />
          </n-form-item>
          
          <n-form-item label="应用名称" required>
            <n-input v-model:value="appForm.name" placeholder="应用显示名称" />
          </n-form-item>
          
          <n-form-item label="英文描述" required>
            <n-input v-model:value="appForm.description.en" placeholder="English description" />
          </n-form-item>
          
          <n-form-item label="简体中文描述" required>
            <n-input v-model:value="appForm.description.zh" placeholder="中文描述，不要超过30个字" />
          </n-form-item>
          
          <n-form-item label="繁体中文描述" required>
            <n-input v-model:value="appForm.description.zhHant" placeholder="" />
          </n-form-item>
          
          <n-form-item label="日本语描述" required>
            <n-input v-model:value="appForm.description.ja" placeholder="" />
          </n-form-item>
          
          <n-form-item label="韩语描述" required>
            <n-input v-model:value="appForm.description.ko" placeholder="" />
          </n-form-item>
          
          <n-form-item label="马来语描述" required>
            <n-input v-model:value="appForm.description.ms" placeholder="" />
          </n-form-item>
          
          <n-form-item label="巴西葡萄牙语描述" required>
            <n-input v-model:value="appForm.description.ptBr" placeholder="" />
          </n-form-item>
          
          <n-form-item label="俄罗斯语描述" required>
            <n-input v-model:value="appForm.description.ru" placeholder="" />
          </n-form-item>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item label="应用标签">
                <n-select
                  v-model:value="appForm.tags"
                  multiple
                  :options="availableTags"
                  placeholder="选择应用标签"
                />
              </n-form-item>
            </n-gi>
            
            <n-gi>
              <n-form-item label="应用类型" required>
                <n-select v-model:value="appForm.type" :options="typeOptions" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item label="跨版本升级">
                <n-switch v-model:value="appForm.crossVersionUpdate" />
              </n-form-item>
            </n-gi>
            
            <n-gi>
              <n-form-item label="安装数量限制">
                <n-input-number v-model:value="appForm.limit" :min="0" placeholder="0代表无限制" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-form-item label="官网地址">
            <n-input v-model:value="appForm.website" placeholder="https://example.com" />
          </n-form-item>
          
          <n-form-item label="GitHub地址">
            <n-input v-model:value="appForm.github" placeholder="https://github.com/user/repo" />
          </n-form-item>
          
          <n-form-item label="文档地址">
            <n-input v-model:value="appForm.document" placeholder="https://docs.example.com" />
          </n-form-item>

          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item label="内存需求">
                <n-input-group>
                  <n-input-number v-model:value="appForm.memoryRequired" :min="0" placeholder="留空表示没有内存需求" />
                  <n-select 
                    v-model:value="appForm.memoryUnit" 
                    :options="memoryUnitOptions" 
                    style="width: 100px"
                    placeholder="单位"
                  />
                </n-input-group>
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="支持架构">
                <n-select v-model:value="appForm.architectures" multiple :options="architectureOptions" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>
      </div>
    </n-card>

    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandReadmeEditor = !expandReadmeEditor"
        >
          <span class="expand-collapse-card-title">编辑自述文件</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandReadmeEditor = !expandReadmeEditor"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandReadmeEditor" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandReadmeEditor ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandReadmeEditor">
        <n-alert type="info" mb-2>
          编辑应用描述或模板后自述文件内容会被重置。
        </n-alert>
        <n-card title="模板" class="mb-4">
          <n-grid cols="3" x-gap="12" mb-4>
            <n-gi>
              <n-form-item label="默认账户密码">
                <n-switch v-model:value="enbedDefaultCredentials" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="用户名">
                <n-input v-model:value="defaultUsername" placeholder="默认用户名" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="密码">
                <n-input v-model:value="defaultPassword" placeholder="默认密码" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-card>
        <n-grid cols="2" x-gap="12" mb-4>
          <n-gi>
            <c-label label="编辑中文自述文件" mb-2>
              <div relative w-full>
                <c-monaco-editor
                  v-model:value="readmeContentZH"
                  theme="vs"
                  language="markdown"
                  height="300px"
                  :options="MONACO_EDITOR_OPTIONS"
                />
              </div>
            </c-label>
            <div mb-4>
              <n-button @click="downloadReadmeZH" type="primary" block>
                <template #icon>
                  <n-icon><IconDownload /></n-icon>
                </template>
                下载自述文件 (README.md)
              </n-button>
            </div>
            <MarkdownRender :value="readmeContentZH" language="markdown" />
          </n-gi>
          <n-gi>
            <c-label label="编辑英文自述文件" mb-2>
              <div relative w-full>
                <c-monaco-editor
                  v-model:value="readmeContentEN"
                  theme="vs"
                  language="markdown"
                  height="300px"
                  :options="MONACO_EDITOR_OPTIONS"
                />
              </div>
            </c-label>
            <div mb-4>
              <n-button @click="downloadReadmeEN" type="primary" block>
                <template #icon>
                  <n-icon><IconDownload /></n-icon>
                </template>
                下载自述文件 (README_en.md)
              </n-button>
            </div>
            <MarkdownRender :value="readmeContentEN" language="markdown" />
          </n-gi>
        </n-grid>
      </div>
    </n-card>

    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandAppDeclaration = !expandAppDeclaration"
        >
          <span class="expand-collapse-card-title">应用声明文件 (data.yml)</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandAppDeclaration = !expandAppDeclaration"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandAppDeclaration" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandAppDeclaration ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandAppDeclaration">
        <n-alert type="info" mb-2>
          放置在应用主目录下，用于声明应用的基本信息。
        </n-alert>
        <div mb-4>
          <n-button @click="downloadAppDeclaration" type="primary" block>
            <template #icon>
              <n-icon><IconDownload /></n-icon>
            </template>
            下载应用声明文件 (data.yml)
          </n-button>
        </div>
        <TextareaCopyable :value="appDeclarationYaml" language="yaml" :download-file-name="''" />
      </div>
    </n-card>

    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandDockerComposeEditor = !expandDockerComposeEditor"
        >
          <span class="expand-collapse-card-title">Docker Compose 配置</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandDockerComposeEditor = !expandDockerComposeEditor"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandDockerComposeEditor" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandDockerComposeEditor ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandDockerComposeEditor">
        <c-label label="编辑 Docker Compose YAML 内容" mb-2>
          <div relative w-full>
            <c-monaco-editor
              v-model:value="dockerCompose"
              theme="vs"
              language="yaml"
              height="300px"
              :options="MONACO_EDITOR_OPTIONS"
            />
          </div>
        </c-label>
        <n-alert type="info" mb-2>
          转换器会自动将通用的Docker Compose格式转换为1Panel标准配置。
        </n-alert>
        <div mb-4>
          <n-button @click="downloadDockerCompose" type="primary" block>
            <template #icon>
              <n-icon><IconDownload /></n-icon>
            </template>
            下载 Docker Compose 配置 (docker-compose.yml)
          </n-button>
        </div>
        <TextareaCopyable :value="convertedDockerCompose" language="yaml" :download-file-name="''" />
      </div>
    </n-card>

    <n-card mb-4>
      <template #header>
        <div 
          class="expand-collapse-card-header"
          @click="expandAppParams = !expandAppParams"
        >
          <span class="expand-collapse-card-title">应用参数配置</span>
          <n-button 
            type="primary" 
            size="small"
            text
            @click.stop="expandAppParams = !expandAppParams"
          >
            <template #icon>
              <n-icon>
                <svg v-if="expandAppParams" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </n-icon>
            </template>
            {{ expandAppParams ? '折叠' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="expandAppParams">
        <n-alert type="info" mb-4>
          配置应用安装时需要用户填写的参数，如端口、数据库连接信息等。
        </n-alert>
        
        <div v-for="(param, index) in appParams" :key="param.id" class="param-form" :data-param-id="param.id">
          <n-card :title="`参数 ${index + 1}`" class="mb-4">
            <template #header-extra>
              <n-button @click="moveParamUp(index)" 
                :disabled="index === 0"
                type="default" size="small">
                上移
              </n-button>
              <n-button @click="moveParamDown(index)" 
                :disabled="index === appParams.length - 1"
                type="default" size="small" >
                下移
              </n-button>
              <n-button @click="removeParam(index)" type="error" size="small">删除</n-button>
            </template>
            
            <n-grid cols="2" x-gap="12">
              <n-gi>
                <n-form-item label="环境变量Key" required>
                  <n-auto-complete
                      v-model:value="param.envKey"
                      :options="getFilteredEnvVarsOptions(param.envKey)"
                      :placeholder="param.type === 'apps' || param.type === 'service' ? '如: PANEL_DB_TYPE' : '如: PANEL_APP_PORT_HTTP'"
                    />
                </n-form-item>
              </n-gi>
              
              <n-gi>
                <n-form-item label="参数类型" required>
                  <n-select v-model:value="param.type" :options="paramTypes" />
                </n-form-item>
              </n-gi>
            </n-grid>
            
            <n-grid v-if="param.type === 'select' || param.type === 'apps' || param.type === 'service'" cols="2" x-gap="12">
              <n-gi v-if="param.type === 'apps'" span="2">
                <n-alert type="info" title="可供选择的服务依赖" class="mb-4">
                  用户可以通过一级菜单选择依赖的服务(App)，例如：MySQL、MariaDB、PostgreSQL 等，通过子菜单选择已安装的服务实例。
                  <br>一级菜单的选项值必须填写官方应用商店中应用的Key，默认值必须填写已设定的服务依赖选项值
                </n-alert>
              </n-gi>
              <n-gi v-if="param.type === 'select' || param.type === 'apps'" :span="param.type === 'apps' ? '1' : '2'">
                <n-form-item :label="param.type === 'apps' ? '服务依赖选项' : '选择器选项'" required>
                  <div class="options-container">
                    <div v-for="(option, optionIndex) in param.values" :key="optionIndex" class="param-form">
                      <n-grid :cols="param.type === 'apps' ? '4' : '3'" x-gap="8">
                        <n-gi>
                          <n-input
                            v-model:value="option.label"
                            placeholder="显示标签"
                          />
                        </n-gi>
                        <n-gi :span="param.type === 'apps' ? '2' : '1'">
                          <n-input
                            v-model:value="option.value"
                            :placeholder="param.type === 'apps' ? '选项值: 官方应用商店中应用的Key' : '选项值'"
                          />
                        </n-gi>
                        <n-gi>
                          <n-button
                            @click="removeOption(param, optionIndex)"
                            type="error"
                            quaternary
                          >
                            删除选项
                          </n-button>
                        </n-gi>
                      </n-grid>
                    </div>
                    <n-button
                      @click="addOption(param)"
                      type="primary"
                      dashed
                    >
                      添加选项
                    </n-button>
                  </div>
                </n-form-item>
              </n-gi>
              <n-gi v-if="param.type === 'apps'">
                <n-card title="可选的服务依赖子菜单" class="mb-4">
                  <n-form-item label="环境变量Key" required>
                    <n-auto-complete
                      v-model:value="param.child.envKey"
                      :options="getFilteredEnvVarsOptions(param.child.envKey)"
                      placeholder="如: PANEL_DB_HOST"
                    />
                  </n-form-item>
                </n-card>
              </n-gi>
              
              <n-gi v-if="param.type === 'service'">
                <n-form-item label="依赖Key">
                  <n-input v-model:value="param.key" placeholder="如: mysql, redis, 值必须填写官方应用商店中应用的Key" />
                </n-form-item>
              </n-gi>
            </n-grid>
            
            <n-grid cols="2" x-gap="12">
              <n-gi>
                <n-form-item label="默认值">
                  <n-input v-model:value="param.default" :placeholder="param.type === 'apps' ? '此项必须填写' : '默认值'" />
                </n-form-item>
              </n-gi>
              
              <n-gi>
                <n-form-item label="校验规则">
                  <n-select v-model:value="param.rule" :options="ruleOptions" clearable />
                </n-form-item>
              </n-gi>
            </n-grid>
            <n-card class="mb-4">
              <template #header>
                <div 
                  class="expand-collapse-card-header"
                  @click="param.expandTagForm = !param.expandTagForm"
                >
                  <span class="expand-collapse-card-title">表单标签 (必填)</span>
                  <n-button 
                    type="primary" 
                    size="small"
                    text
                    @click.stop="param.expandTagForm = !param.expandTagForm"
                  >
                    <template #icon>
                      <n-icon>
                        <svg v-if="param.expandTagForm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </n-icon>
                    </template>
                    {{ param.expandTagForm ? '折叠' : '展开' }}
                  </n-button>
                </div>
              </template>
              <div v-show="param.expandTagForm">
                <n-grid cols="3" x-gap="12">
                  <n-gi>
                    <n-form-item label="简体中文标签">
                      <n-input v-model:value="param.label.zh" placeholder="简体中文标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="繁体中文标签">
                      <n-input v-model:value="param.label.zhHant" placeholder="繁体中文标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="英文标签">
                      <n-input v-model:value="param.label.en" placeholder="英文标签" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="3" x-gap="12">
                  <n-gi>
                    <n-form-item label="日本语标签">
                      <n-input v-model:value="param.label.ja" placeholder="日本语标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="韩语标签">
                      <n-input v-model:value="param.label.ko" placeholder="韩语标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="马来语标签">
                      <n-input v-model:value="param.label.ms" placeholder="马来语标签" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="3" x-gap="12">
                  <n-gi>
                    <n-form-item label="葡萄牙语 (巴西) 标签">
                      <n-input v-model:value="param.label.ptBr" placeholder="葡萄牙语 (巴西) 标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="俄罗斯语标签">
                      <n-input v-model:value="param.label.ru" placeholder="俄罗斯语标签" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="土耳其语标签">
                      <n-input v-model:value="param.label.tr" placeholder="土耳其语标签" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
              </div>
            </n-card>

            <n-card class="mb-4">
              <template #header>
                <div 
                  class="expand-collapse-card-header"
                  @click="param.expandDescriptionForm = !param.expandDescriptionForm"
                >
                  <span class="expand-collapse-card-title">表单描述 (可选)</span>
                  <n-button 
                    type="primary" 
                    size="small"
                    text
                    @click.stop="param.expandDescriptionForm = !param.expandDescriptionForm"
                  >
                    <template #icon>
                      <n-icon>
                        <svg v-if="param.expandDescriptionForm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </n-icon>
                    </template>
                    {{ param.expandDescriptionForm ? '折叠' : '展开' }}
                  </n-button>
                </div>
              </template>
              <div v-show="param.expandDescriptionForm">
                <n-grid cols="2" x-gap="12">
                  <n-gi>
                    <n-form-item label="简体中文描述">
                      <n-input v-model:value="param.description.zh" placeholder="简体中文描述" />
                    </n-form-item>
                  </n-gi>
                  <n-gi>
                    <n-form-item label="繁体中文描述">
                      <n-input v-model:value="param.description.zhHant" placeholder="繁体中文描述" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="2" x-gap="12">
                  <n-gi>
                    <n-form-item label="英文描述">
                      <n-input v-model:value="param.description.en" placeholder="英文描述" />
                    </n-form-item>
                  </n-gi>
                
                  <n-gi>
                    <n-form-item label="日本语描述">
                      <n-input v-model:value="param.description.ja" placeholder="日本语描述" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="2" x-gap="12">
                  <n-gi>
                    <n-form-item label="韩语描述">
                      <n-input v-model:value="param.description.ko" placeholder="韩语描述" />
                    </n-form-item>
                  </n-gi>

                  <n-gi>
                    <n-form-item label="马来语描述">
                      <n-input v-model:value="param.description.ms" placeholder="马来语描述" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="2" x-gap="12">
                  <n-gi>
                    <n-form-item label="葡萄牙语 (巴西) 描述">
                      <n-input v-model:value="param.description.ptBr" placeholder="葡萄牙语 (巴西) 描述" />
                    </n-form-item>
                  </n-gi>
                
                  <n-gi>
                    <n-form-item label="俄罗斯语描述">
                      <n-input v-model:value="param.description.ru" placeholder="俄罗斯语描述" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
                
                <n-grid cols="2" x-gap="12">
                  <n-gi>
                    <n-form-item label="土耳其语描述">
                      <n-input v-model:value="param.description.tr" placeholder="土耳其语描述" />
                    </n-form-item>
                  </n-gi>
                </n-grid>
              </div>
            </n-card>
            
            <n-grid cols="4" x-gap="12">
              <n-gi>
                <n-form-item label="是否必填">
                  <n-switch v-model:value="param.required" />
                </n-form-item>
              </n-gi>
              
              <n-gi>
                <n-form-item label="可编辑">
                  <n-switch v-model:value="param.edit" />
                </n-form-item>
              </n-gi>
              
              <n-gi>
                <n-form-item label="随机字符">
                  <n-switch v-model:value="param.random" />
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-card>
        </div>
        
        <n-button @click="addParam" type="primary" dashed block size="large" mb-4>
          <template #icon>
            <n-icon><IconPlus /></n-icon>
          </template>
          添加参数
        </n-button>
        
        <n-divider>参数配置预览</n-divider>
        
        <div mb-4>
          <n-button @click="downloadAppParams" type="primary" block>
            <template #icon>
              <n-icon><IconDownload /></n-icon>
            </template>
            下载参数配置 (data.yml)
          </n-button>
        </div>
        
        <TextareaCopyable :value="appParamsYaml" language="yaml" :download-file-name="''" />
      </div>
    </n-card>
    <!-- 添加回到顶部的浮动按钮 -->
    <transition name="fade">
      <div
        v-if="showBackToTop"
        class="back-to-top-btn"
        @click="scrollToTop"
      >
        <n-button type="primary" circle size="large">
          <template #icon>
            <n-icon>
              <!-- 可以使用一个向上的箭头图标 -->
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </n-icon>
          </template>
        </n-button>
        <div class="btn-text">返回打包下载</div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
:deep(.logo-upload-form-item) {
  --n-label-height: 0 !important;
  --n-feedback-height: 0 !important;
}
.logo-upload-section .n-form-item { margin-bottom: 0; }

.logo-upload-section,
.logo-preview-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
.logo-upload-section .n-text,
.logo-preview-section .n-text {
  margin-bottom: 8px;
  font-weight: 500;
}
.upload-dragger {
  height: 100%;
  min-height: 206px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.preview-container {
  flex: 1;
  margin-top: 0; /* 移除上边距 */
  padding: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 206px;
  height: 100%;
}
.logo-image {
  max-width: 180px;
  max-height: 180px;
}
.param-form {
  margin-bottom: 16px;
  overflow-anchor: none;
  overscroll-behavior: contain;
}
@supports not (overflow-anchor: none) {
  .param-form {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
}
.expand-collapse-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  cursor: pointer;
}
.expand-collapse-card-title {
  font-weight: 500;
  font-size: 16px;
}
/* 添加回到顶部按钮的样式 */
.back-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.back-to-top-btn:hover {
  transform: translateY(-2px);
}
.btn-text {
  margin-top: 8px;
  font-size: 12px;
  color: #18a058;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>