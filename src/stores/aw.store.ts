import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import yaml from 'yaml';
import type { AppParam, ReadmeSection } from '@/composable/aw.defind';
import { processNumbersForYaml, transformKeys } from '@/composable/aw.defind';
export const useReactiveReferenceStore = defineStore('appWorkshop', () => {
  const { t } = useI18n();
  // 卡片展开状态
  const expandProjectManagement = ref(false); // 控制下载应用包卡片表单展开状态
  const expandAppForm = ref(true); // 控制应用基本信息表单展开状态
  const expandReadmeEditor = ref(false); // 控制自述文件编辑卡片表单展开状态
  const expandReadmeEditorTemplate = ref(false); // 控制自述文件编辑模板卡片表单展开状态
  const expandAppDeclaration = ref(false); // 控制应用声明卡片表单展开状态
  const expandDockerComposeEditor = ref(false); // 控制Docker Compose文件编辑卡片展开状态
  const expandAppParams = ref(false); // 控制应用参数配置卡片表单展开状态
  // const expandTagForm = ref(false); // 控制应用参数配置标签部分表单展开状态
  // const expandDescriptionForm = ref(false); // 控制应用参数配置描述部分表单展开状态
  const newVarsCollapsed = ref(true); // 控制新变量部分展开状态
  const existingVarsCollapsed = ref(true); // 控制已存在变量部分展开状态
  const ignoredVarsCollapsed = ref(true); // 控制已忽略变量部分展开状态
  const enabledUpdateReadmeWatch = ref(true); // 自述文件内容更新监听器开关
  const projectManagementActiveTab = ref('package-project'); // 项目管理卡片激活标签页
  const readmeEditorActiveTab = ref('zh'); // 自述文件编辑卡片激活标签页
  const scrollPosition = ref(0); // 记录滚动位置
  // 表单数据
  const appForm = ref({
    key: 'my-app',
    name: 'My Application',
    description: {
      zh: t('tools.app-workshop.cards.ReadmeEditor.sections.introduction.defalt', {}, { locale: 'zh' }),
      zhHant: '',
      en: t('tools.app-workshop.cards.ReadmeEditor.sections.introduction.defalt', {}, { locale: 'en' }),
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
  // 响应式自述文件内容
  const defaultUsername = ref('');
  const defaultPassword = ref('');
  // 计算描述内容
  const descZh = computed(() => appForm.value.description.zh.trim());
  const descEn = computed(() => appForm.value.description.en.trim());
  // 动态生成自述文件内容
  const readmeContentZH = ref('');
  const readmeContentEN = ref('');
  // 修改公用段落配置，初始化时设置默认内容
  const readmeSections = ref<ReadmeSection[]>([]);
  // 拖拽相关状态
  const dragStartIndex = ref<number | null>(null);
  // 拖拽相关响应式数据
  const draggedSection = ref<ReadmeSection | null>(null);
  const dragOverIndex = ref<number | null>(null);
  const isDragging = ref(false);
  // 位置交换的视觉反馈
  const swapPositions = ref<{from: number, to: number} | null>(null);
  // 用于强制刷新列表的计数器
  const listRefreshCounter = ref(0);
  // 控制是否抑制列表强制刷新（避免输入过程中重建节点导致焦点丢失）
  const suppressListRefresh = ref(false);
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
  const appVersion = ref('1.0.0');
  const appLogo = ref<File | null>(null);
  const logoPreview = ref<string>('');
  // 监听滚动事件
  const showBackToTop = ref(false);
  // 可选标签
  const availableTags = computed(() => [
    { label: t('tools.app-workshop.options.availableTags.ai'), value: 'AI' },
    { label: t('tools.app-workshop.options.availableTags.website'), value: 'Website' },
    { label: t('tools.app-workshop.options.availableTags.database'), value: 'Database' },
    { label: t('tools.app-workshop.options.availableTags.server'), value: 'Server' },
    { label: t('tools.app-workshop.options.availableTags.runtime'), value: 'Runtime' },
    { label: t('tools.app-workshop.options.availableTags.tool'), value: 'Tool' },
    { label: t('tools.app-workshop.options.availableTags.storage'), value: 'Storage' },
    { label: t('tools.app-workshop.options.availableTags.bi'), value: 'BI' },
    { label: t('tools.app-workshop.options.availableTags.crm'), value: 'CRM' },
    { label: t('tools.app-workshop.options.availableTags.security'), value: 'Security' },
    { label: t('tools.app-workshop.options.availableTags.devtool'), value: 'DevTool' },
    { label: t('tools.app-workshop.options.availableTags.devops'), value: 'DevOps' },
    { label: t('tools.app-workshop.options.availableTags.middleware'), value: 'Middleware' },
    { label: t('tools.app-workshop.options.availableTags.media'), value: 'Media' },
    { label: t('tools.app-workshop.options.availableTags.email'), value: 'Email' },
    { label: t('tools.app-workshop.options.availableTags.game'), value: 'Game' },
    { label: t('tools.app-workshop.options.availableTags.local'), value: 'Local' },
  ]);
  // 应用类型选项
  const typeOptions = computed(() => [
    { label: t('tools.app-workshop.options.typeOptions.website'), value: 'website' },
    { label: t('tools.app-workshop.options.typeOptions.runtime'), value: 'runtime' },
    { label: t('tools.app-workshop.options.typeOptions.tool'), value: 'tool' },
  ]);
  // 可选环境变量
  const optionalEnvVars = computed(() => [
    { label: 'PANEL_APP_PORT_HTTP', value: 'PANEL_APP_PORT_HTTP' },
    { label: 'PANEL_APP_PORT_HTTPS', value: 'PANEL_APP_PORT_HTTPS' },
    {
      type: 'group',
      label: t('tools.app-workshop.options.optionalEnvVars.database'),
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
        { label: 'PANEL_REDIS_HOST', value: 'PANEL_REDIS_HOST'},
        { label: 'PANEL_REDIS_ROOT_PASSWORD', value: 'PANEL_REDIS_ROOT_PASSWORD' },
      ]
    },
    // { label: 'PANEL_WEBSITE_DIR', value: 'PANEL_WEBSITE_DIR' },
  ]);
  // 参数类型选项
  const paramTypes = computed(() => [
    { label: t('tools.app-workshop.options.paramTypes.text'), value: 'text' },
    { label: t('tools.app-workshop.options.paramTypes.password'), value: 'password' },
    { label: t('tools.app-workshop.options.paramTypes.number'), value: 'number' },
    { label: t('tools.app-workshop.options.paramTypes.apps'), value: 'apps' },
    { label: t('tools.app-workshop.options.paramTypes.service'), value: 'service' },
    { label: t('tools.app-workshop.options.paramTypes.select'), value: 'select' },
  ]);
  // 校验规则选项
  const ruleOptions = computed(() => [
    { label: t('tools.app-workshop.options.ruleOptions.paramPort'), value: 'paramPort' },
    { label: t('tools.app-workshop.options.ruleOptions.paramExtUrl'), value: 'paramExtUrl' },
    { label: t('tools.app-workshop.options.ruleOptions.paramCommon'), value: 'paramCommon' },
    { label: t('tools.app-workshop.options.ruleOptions.paramComplexity'), value: 'paramComplexity' },
  ]);
  // 参数可编辑状态选项
  const editableOptions = computed(() => [
    { 
      label: t('tools.app-workshop.options.editableOptions.install-editable-post-editable'), 
      value: 'install-editable-post-editable',
      disable: false,
      edit: true
    },
    { 
      label: t('tools.app-workshop.options.editableOptions.install-editable-post-locked'), 
      value: 'install-editable-post-locked',
      disable: false,
      edit: false
    },
    { 
      label: t('tools.app-workshop.options.editableOptions.install-locked-post-editable'), 
      value: 'install-locked-post-editable',
      disable: true,
      edit: true
    },
    { 
      label: t('tools.app-workshop.options.editableOptions.install-locked-post-locked'), 
      value: 'install-locked-post-locked',
      disable: true,
      edit: false
    }
  ]);
  // 生成应用声明文件 data.yml
  const appDeclarationYaml = computed(() => {
    try {
      const chineseTagNames = appForm.value.tags.map(tag => {
        const tagOption = availableTags.value.find(option => option.value === tag);
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
      return `# ${t('tools.app-workshop.script.errors.generation-failed')}: ${e}`;
    }
  });
  // 生成应用参数配置
  const appParamsYaml = computed(() => {
    try {
      const formFields = appParams.value.map((param: AppParam) => {
        const field: any = {
          default: param.default,
          envKey: param.envKey,
          labelZh: param.label.zh,
          labelEn: param.label.en,
        };
        const child: any = {
          default: '',
          envKey: param.child?.envKey,
          required: param.required,
          type: 'service',
        };
        const label: any = {}
        for (const [key, value] of Object.entries(param.label ?? {})) {
          if (key === 'zh' || key === 'en') { label[key] = value; }
          if (value !== undefined && value !== null && value !== '') { label[key] = value; }
        }
        const description: any = {};
        for (const [key, value] of Object.entries(param.description ?? {})) {
          if (value !== undefined && value !== null && value !== '') {
            description[key] = value;
          }
        }
        field.label = label;
        if (Object.keys(description).length > 0) {
          field.description = description;
        }
        if (Object.keys(description).length > 0) {
          field.description = description;
        }
        field.required = param.required;
        field.type = param.type;
        if (param.edit !== undefined && param.edit === true) field.edit = param.edit;
        if (param.disable !== undefined && param.disable === true) field.disabled = param.disable;
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
      return `# ${t('tools.app-workshop.script.errors.generation-failed')}: ${e}`;
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
      // 5. 序列化为 YAML
      let convertedYaml = yaml.stringify(composeObj, { indent: 2 });
      // 6. 确保所有变量都使用统一的格式 ${VAR_NAME}，并处理变量名中的空格
      convertedYaml = convertedYaml.replace(/\$\{\s*([A-Z_][A-Z0-9_]*(\s+[A-Z0-9_]+)*)\s*\}/g, (match, variableName) => {
        const normalizedVarName = variableName.replace(/\s+/g, '');
        return `\${${normalizedVarName}}`;
      });
      // 7. 移除环境变量中的默认值
      convertedYaml = convertedYaml.replace(/\$\{([A-Z_][A-Z0-9_]*)\s*:-[^}]*\}/g, (match, variableName) => {
        return `\${${variableName}}`;
      });
      return convertedYaml;
    } catch (e) {
      return `# ${t('tools.app-workshop.script.errors.conversion-failed')}: ${e}\n\n${t('tools.app-workshop.script.funcs.convertedDockerCompose.note1')}:\n${dockerCompose.value}`;
    }
  });
  // 自述文件重置为默认顺序
  const resetParagraphOrder = () => {
    // 保存当前的自定义内容
    const customContents = new Map();
    readmeSections.value.forEach(section => {
      if (section.hasCustomContent) {
        customContents.set(section.id, {
          contentZH: section.contentZH,
          contentEN: section.contentEN,
          hasCustomContent: true
        });
      }
    });
    // 重新初始化段落
    initializeReadmeSections();
    // 恢复自定义内容
    readmeSections.value.forEach(section => {
      const customContent = customContents.get(section.id);
      if (customContent) {
        section.contentZH = customContent.contentZH;
        section.contentEN = customContent.contentEN;
        section.hasCustomContent = true;
      }
    });
    if (enabledUpdateReadmeWatch.value) {
      updateReadmeContent();
    }
  };
  // 初始化段落内容
  const initializeReadmeSections = () => {
    readmeSections.value = [
      {
        id: 'credentials',
        type: 'credentials',
        enabled: false,
        title: 'tools.app-workshop.cards.ReadmeEditor.sections.credentials.title',
        contentZH: '',
        contentEN: '',
        hasCustomContent: false
      },
      {
        id: 'introduction', 
        type: 'introduction',
        enabled: true,
        title: 'tools.app-workshop.cards.ReadmeEditor.sections.introduction.title',
        contentZH: '',
        contentEN: '',
        hasCustomContent: false
      },
      {
        id: 'features',
        type: 'features',
        enabled: true,
        title: 'tools.app-workshop.cards.ReadmeEditor.sections.features.title',
        contentZH: '',
        contentEN: '',
        hasCustomContent: false
      },
      {
        id: 'configUsage',
        type: 'configUsage',
        enabled: false,
        title: 'tools.app-workshop.cards.ReadmeEditor.sections.configUsage.title',
        contentZH: '',
        contentEN: '',
        hasCustomContent: false
      }
    ];
    // 设置初始默认内容
    updateDefaultContent();
  };
  // 更新自述文件内容
  const updateReadmeContent = () => {
    const zhContent = readmeSections.value
      .filter(section => section.enabled)
      .map(section => {
        // 对于介绍段落，始终使用应用描述，忽略保存的内容
        if (section.type === 'introduction') {
          const content = descZh.value;
          return `## ${t(section.title, {}, { locale: 'zh' })}\n\n${content}`;
        }
        let content = '';
        if (section.hasCustomContent && section.contentZH.trim()) {
          content = section.contentZH;
        } else {
          switch (section.type) {
            case 'credentials':
              content = `${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-user', {}, { locale: 'zh' })}: \`${defaultUsername.value}\`\n\n${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-pass', {}, { locale: 'zh' })}: \`${defaultPassword.value}\``;
              break;
            case 'configUsage':
              content = t('tools.app-workshop.cards.ReadmeEditor.sections.configUsage.defalt', {}, { locale: 'zh' });
              break;
            case 'features':
              content = t('tools.app-workshop.cards.ReadmeEditor.sections.features.defalt', {}, { locale: 'zh' });
              break;
          }
          section.contentZH = content;
        }
        return `## ${t(section.title, {}, { locale: 'zh' })}\n\n${content}`;
      })
      .filter(section => section.trim())
      .join('\n\n');
    readmeContentZH.value = zhContent;
    const enContent = readmeSections.value
      .filter(section => section.enabled)
      .map(section => {
        // 对于介绍段落，始终使用应用描述，忽略保存的内容
        if (section.type === 'introduction') {
          const content = descEn.value;
          return `## ${t(section.title, {}, { locale: 'en' })}\n\n${content}`;
        }
        let content = '';
        if (section.hasCustomContent && section.contentEN.trim()) {
          content = section.contentEN;
        } else {
          switch (section.type) {
            case 'credentials':
              content = `username: \`${defaultUsername.value}\`\n\npassword: \`${defaultPassword.value}\``;
              break;
            case 'configUsage':
              content = t('tools.app-workshop.cards.ReadmeEditor.sections.configUsage.defalt', {}, { locale: 'en' });
              break;
            case 'features':
              content = t('tools.app-workshop.cards.ReadmeEditor.sections.features.defalt', {}, { locale: 'en' });
              break;
          }
          section.contentEN = content;
        }
        return `## ${t(section.title, {}, { locale: 'en' })}\n\n${content}`;
      })
      .filter(section => section.trim())
      .join('\n\n');
    readmeContentEN.value = enContent;
    // 强制刷新列表以确保视图正确渲染（受抑制开关控制）
    if (!suppressListRefresh.value) {
      listRefreshCounter.value += 1;
    }
  };
  // 更新默认内容（只在初始化或重置时调用）
  const updateDefaultContent = () => {
    readmeSections.value.forEach(section => {
      if (!section.hasCustomContent) {
        switch (section.type) {
          case 'credentials':
            section.contentZH = `${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-user', {}, { locale: 'zh' })}: \`${defaultUsername.value}\`\n\n${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-pass', {}, { locale: 'zh' })}: \`${defaultPassword.value}\``;
            section.contentEN = `username: \`${defaultUsername.value}\`\n\npassword: \`${defaultPassword.value}\``;
            break;
          case 'introduction':
            section.contentZH = t('tools.app-workshop.cards.ReadmeEditor.sections.introduction.defalt', {}, { locale: 'zh' });
            section.contentEN = t('tools.app-workshop.cards.ReadmeEditor.sections.introduction.defalt', {}, { locale: 'en' });
            break;
          case 'configUsage':
            section.contentZH = t('tools.app-workshop.cards.ReadmeEditor.sections.configUsage.defalt', {}, { locale: 'zh' });
            section.contentEN = t('tools.app-workshop.cards.ReadmeEditor.sections.configUsage.defalt', {}, { locale: 'en' });
            break;
          case 'features':
            section.contentZH = t('tools.app-workshop.cards.ReadmeEditor.sections.features.defalt', {}, { locale: 'zh' });
            section.contentEN = t('tools.app-workshop.cards.ReadmeEditor.sections.features.defalt', {}, { locale: 'en' });
            break;
        }
      }
    });
  };
  return {
    // 卡片展开状态相关
    expandProjectManagement, expandAppForm, expandReadmeEditor, expandReadmeEditorTemplate,
    expandAppDeclaration, expandDockerComposeEditor, expandAppParams, newVarsCollapsed,
    existingVarsCollapsed, ignoredVarsCollapsed, enabledUpdateReadmeWatch,
    // 标签页相关
    projectManagementActiveTab, readmeEditorActiveTab,
    // 自述文件编辑模板卡片表单相关
    defaultUsername, defaultPassword, readmeContentZH, readmeContentEN, readmeSections,
    dragStartIndex, draggedSection, dragOverIndex, isDragging, swapPositions,
    // 强制刷新列表
    listRefreshCounter, suppressListRefresh,
    // 自述文件编辑器卡片相关
    descZh, descEn, resetParagraphOrder, initializeReadmeSections, updateReadmeContent,
    updateDefaultContent,
    // 应用参数配置及 DockerCompose 卡片表单相关
    appForm, appParams, dockerCompose, appDeclarationYaml, appParamsYaml,
    convertedDockerCompose,
    // 项目管理卡片相关
    appVersion, appLogo, logoPreview,
    // 滚动监听相关
    showBackToTop, scrollPosition,
    // 下拉菜单相关
    availableTags, typeOptions, optionalEnvVars, paramTypes, ruleOptions, editableOptions,
  }
})