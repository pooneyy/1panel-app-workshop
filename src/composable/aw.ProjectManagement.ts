import { saveAs } from 'file-saver';
import { storeToRefs } from 'pinia';
import JSZip from 'jszip';
import yaml from 'yaml';
import { config } from '@/config';
import { type AppParam, base64ToFile, defaultAppParam, defaultLogoBase64, fileToBase64, PLACEHOLDERS, svgToPng } from '@/composable/aw.defind';
import { useReactiveReferenceStore } from '@/stores/aw.store';
export function useProjectManagement() {
  const { t } = useI18n();
  const dialog = useDialog();
  const notification = useNotification();
  const {
    appLogo, logoPreview, appForm, appVersion, appDeclarationYaml, appParams,
    appParamsYaml, convertedDockerCompose, dockerCompose,
    readmeContentZH, readmeContentEN, readmeSections,
    defaultUsername, defaultPassword,
    // 卡片展开状态相关
    expandProjectManagement, expandAppForm, expandReadmeEditor, expandReadmeEditorTemplate,
    expandAppDeclaration, expandDockerComposeEditor, expandAppParams, newVarsCollapsed,
    existingVarsCollapsed, ignoredVarsCollapsed, enabledUpdateReadmeWatch,
    // 标签页相关
    projectManagementActiveTab, readmeEditorActiveTab,
  } = storeToRefs(useReactiveReferenceStore())
  const {
    resetParagraphOrder, initializeReadmeSections,
  } = useReactiveReferenceStore()
  const validateImageFile = (file: File) => {
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
        notification.error({
          title: t('tools.app-workshop.script.funcs.handleLogoUpload.no-imagefile'),
          content: uploadedFile.type,
          duration: 30000,
        });
        appLogo.value = null;
        return false;
      }
      validateImageFile(uploadedFile.file).then(async(isValidImage) => {
        if (!isValidImage) {
          notification.error({
            title: t('tools.app-workshop.script.funcs.handleLogoUpload.no-image'),
            duration: 30000,
          });
          appLogo.value = null;
          return false;
        }
        if (uploadedFile.type === 'image/svg+xml') {
          const compressedBase64 = await svgToPng(uploadedFile.file, 180, 180);
          appLogo.value = base64ToFile(compressedBase64, 'logo.png');
          logoPreview.value = compressedBase64;
          return true;
        } else {
          const compressedBase64 = await compressImage(uploadedFile.file)
          appLogo.value = base64ToFile(compressedBase64, 'logo.png');
          // 创建预览
          logoPreview.value = compressedBase64;
          return true;
        }
      }).catch(error => {
        notification.error({  
          title: t('tools.app-workshop.script.errors.validate-error'),
          content: String(error),
          duration: 30000,
        });
        return false;
      });
    } catch (error) {
      notification.error({
        title: t('tools.app-workshop.script.errors.upload-error'),
        content: String(error),
        duration: 30000,
      });
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
          reader.onerror = () => reject(new Error(t('tools.app-workshop.script.errors.read-error')));
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
          reject(new Error(t('tools.app-workshop.script.errors.canvas-context-error')));
        }
      };
      img.onerror = () => reject(new Error(t('tools.app-workshop.script.errors.image-load-error')));
      img.src = URL.createObjectURL(file);
    });
  };
  // 打包下载函数
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
            logoData = await fileToBase64(appLogo.value);
            logoData = logoData.replace(/^data:image\/png;base64,/, '');
          } catch (error) {
            notification.error({
              title: t('tools.app-workshop.script.funcs.downloadAllAsZip.image-compress-failed'),
              content: String(error),
              duration: 30000
            });
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
      notification.error({
        title: t('tools.app-workshop.script.funcs.downloadAllAsZip.package-failed'),
        content: String(error),
        duration: 30000,
      });
    }
  };
  const exportProject = () => {
    try {
      const projectData = {
        // 基本信息
        appForm: { ...appForm.value },
        appVersion: appVersion.value,
        // LOGO数据
        logo: {
          hasCustomLogo: !!appLogo.value,
          logoPreview: logoPreview.value,
        },
        // 自述文件配置
        readmeSections: [...readmeSections.value],
        defaultUsername: defaultUsername.value,
        defaultPassword: defaultPassword.value,
        readmeContentZH: readmeContentZH.value,
        readmeContentEN: readmeContentEN.value,
        // Docker Compose
        dockerCompose: dockerCompose.value,
        // 应用参数
        appParams: appParams.value.map(param => ({
          ...param,
          // 确保所有字段都被包含
          expandTagForm: param.expandTagForm || false,
          expandDescriptionForm: param.expandDescriptionForm || false
        })),
        // 卡片展开状态
        cardStates: {
          // 主卡片状态
          expandProjectManagement: expandProjectManagement.value,
          expandAppForm: expandAppForm.value,
          expandReadmeEditor: expandReadmeEditor.value,
          expandReadmeEditorTemplate: expandReadmeEditorTemplate.value,
          expandAppDeclaration: expandAppDeclaration.value,
          expandDockerComposeEditor: expandDockerComposeEditor.value,
          expandAppParams: expandAppParams.value,
          // Docker Compose变量区域状态
          newVarsCollapsed: newVarsCollapsed.value,
          existingVarsCollapsed: existingVarsCollapsed.value,
          ignoredVarsCollapsed: ignoredVarsCollapsed.value,
          // 应用参数卡片内的子卡片状态（需要遍历每个参数）
          paramCardStates: appParams.value.map(param => ({
            id: param.id,
            expandTagForm: param.expandTagForm,
            expandDescriptionForm: param.expandDescriptionForm
          }))
        },
        // 标签页状态
        tabStates: {
          projectManagementActiveTab: projectManagementActiveTab.value,
          readmeEditorActiveTab: readmeEditorActiveTab.value
        },
        metadata: {
          exportDate: new Date().toISOString(),
          version: config.app.version,
          tool: config.app.name
        }
      };
      // 创建JSON字符串
      const jsonString = JSON.stringify(projectData, null, 2);
      // 创建Blob并下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appForm.value.key || 'app-project'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notification.success({
        title: t('tools.app-workshop.script.funcs.exportProject.success'),
        duration: 3000
      });
    } catch (error) {
      notification.error({
        title: t('tools.app-workshop.script.funcs.exportProject.error'),
        content: String(error),
        duration: 30000
      });
    }
  };
  // 导入项目数据
  const handleProjectImportJson = (options: { file: any }) => {
    try {
      const file = options.file;
      if (!file.type.includes('json')) {
        notification.error({ title: t('tools.app-workshop.script.funcs.importProject.invalidFile'), duration: 30000 });
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          enabledUpdateReadmeWatch.value = false;
          const projectData = JSON.parse(e.target?.result as string);
          if (!projectData.appForm || !projectData.dockerCompose) {
            throw new Error(t('tools.app-workshop.script.funcs.importProject.invalidJsonFormat'));
          }
          // 恢复应用数据
          if (projectData.appForm) Object.assign(appForm.value, projectData.appForm);
          if (projectData.appVersion) appVersion.value = projectData.appVersion;
          // 恢复LOGO
          if (projectData.logo) {
            try {
              const file = projectData.logo?.hasCustomLogo && projectData.logo?.logoPreview ? base64ToFile(projectData.logo.logoPreview, 'logo.png') : null;
              appLogo.value = file;
              logoPreview.value = file ? projectData.logo.logoPreview : `data:image/png;base64,${defaultLogoBase64}`;
            } catch (error) {
              appLogo.value = null;
              logoPreview.value = `data:image/png;base64,${defaultLogoBase64}`;
            }
          }
          // 恢复自述文件
          if (projectData.readmeSections) readmeSections.value = projectData.readmeSections;
          if (projectData.defaultUsername !== undefined) defaultUsername.value = projectData.defaultUsername;
          if (projectData.defaultPassword !== undefined) defaultPassword.value = projectData.defaultPassword;
          if (projectData.readmeContentZH !== undefined) readmeContentZH.value = projectData.readmeContentZH;
          if (projectData.readmeContentEN !== undefined) readmeContentEN.value = projectData.readmeContentEN;
          // 恢复Docker Compose和应用参数
          if (projectData.dockerCompose) dockerCompose.value = projectData.dockerCompose;
          if (projectData.appParams) {
            appParams.value = projectData.appParams.map((param: any) => ({
              ...defaultAppParam(),
              ...param,
              expandTagForm: param.expandTagForm || false,
              expandDescriptionForm: param.expandDescriptionForm || false
            }));
          }
          // 恢复卡片状态
          if (projectData.cardStates) {
            const states = projectData.cardStates;
            expandProjectManagement.value = states.expandProjectManagement ?? true;
            expandAppForm.value = states.expandAppForm ?? true;
            expandReadmeEditor.value = states.expandReadmeEditor ?? false;
            expandReadmeEditorTemplate.value = states.expandReadmeEditorTemplate ?? false;
            expandAppDeclaration.value = states.expandAppDeclaration ?? false;
            expandDockerComposeEditor.value = states.expandDockerComposeEditor ?? false;
            expandAppParams.value = states.expandAppParams ?? false;
            newVarsCollapsed.value = states.newVarsCollapsed ?? true;
            existingVarsCollapsed.value = states.existingVarsCollapsed ?? true;
            ignoredVarsCollapsed.value = states.ignoredVarsCollapsed ?? true;
            if (states.paramCardStates) {
              const paramStatesMap = new Map(states.paramCardStates.map((state: any) => [state.id, state]));
              appParams.value.forEach((param: AppParam) => {
                const savedState = paramStatesMap.get(param.id) as AppParam;
                if (savedState) {
                  param.expandTagForm = savedState.expandTagForm;
                  param.expandDescriptionForm = savedState.expandDescriptionForm;
                }
              });
            }
          }
          // 恢复标签页状态
          if (projectData.tabStates) {
            if (projectData.tabStates.projectManagementActiveTab) {
              projectManagementActiveTab.value = projectData.tabStates.projectManagementActiveTab;
            }
            if (projectData.tabStates.readmeEditorActiveTab) {
              readmeEditorActiveTab.value = projectData.tabStates.readmeEditorActiveTab;
            }
          }
          nextTick(() => { enabledUpdateReadmeWatch.value = true; });
          notification.success({ title: t('tools.app-workshop.script.funcs.importProject.success'), duration: 3000 });
        } catch (parseError) {
          enabledUpdateReadmeWatch.value = true;
          notification.error({ 
            title: t('tools.app-workshop.script.funcs.importProject.parseError'), 
            content: String(parseError), 
            duration: 30000 
          });
        }
      };
      reader.onerror = () => {
        notification.error({ title: t('tools.app-workshop.script.funcs.importProject.readError'), duration: 30000 });
      };
      reader.readAsText(file.file);
      return false;
    } catch (error) {
      notification.error({ 
        title: t('tools.app-workshop.script.funcs.importProject.error'), 
        content: String(error), 
        duration: 30000 
      });
      return false;
    }
  };
  // 从 ZIP 应用包导入项目
  const handleProjectImportZip = async (options: { file: any }) => {
    try {
      const file = options.file;
      if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
        notification.error({ title: t('tools.app-workshop.script.funcs.importProject.invalidZipFile'), duration: 30000 });
        return false;
      }
      const reader = new FileReader();
      const readZipFile = async (zipContent: JSZip, path: string, type: 'text' | 'blob' = 'text') => {
        return zipContent.files[path] ? await zipContent.files[path].async(type) : null;
      };
      const blobToDataURL = (blob: Blob, mimeType: string = 'image/png'): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(blob.type ? blob : new Blob([blob], { type: mimeType }));
        });
      };
      const parseAppParams = (yamlContent: string) => {
        try {
          const data = yaml.parse(yamlContent);
          return data.additionalProperties?.formFields?.map((field: any, index: number) => ({
            ...defaultAppParam(),
            id: Date.now() + index,
            envKey: field.envKey || '',
            type: field.type || 'text',
            default: field.default || '',
            required: field.required || false,
            edit: field.edit !== undefined ? field.edit : true,
            random: field.random || false,
            label: {
              zh: field.label?.zh || field.labelZh || '',
              zhHant: field.label?.['zh-Hant'] || field.label?.zhHant || '',
              en: field.label?.en || field.labelEn || '',
              ja: field.label?.ja || '',
              ko: field.label?.ko || '',
              ms: field.label?.ms || '',
              ptBr: field.label?.['pt-br'] || field.label?.ptBr || '',
              ru: field.label?.ru || '',
              tr: field.label?.tr || '',
            },
            description: {
              zh: field.description?.zh  || '',
              zhHant: field.description?.['zh-Hant'] || field.description?.zhHant || '',
              en: field.description?.en || '',
              ja: field.description?.ja || '',
              ko: field.description?.ko || '',
              ms: field.description?.ms || '',
              ptBr: field.description?.['pt-br'] || field.description?.ptBr || '',
              ru: field.description?.ru || '',
              tr: field.description?.tr || '',
            },
            child: field.child || { default: '', envKey: '', type: 'service' },
            rule: field.rule || '',
            key: field.key || '',
            values: field.values || []
          })) || getDefaultAppParams();
        } catch (error) {
          notification.error({
            title: t('tools.app-workshop.script.funcs.importProject.parseError'),
            content: String(error),
            duration: 30000
          });
          return getDefaultAppParams();
        }
      };
      const fillAppForm = (props: any) => {
        const form = appForm.value;
        form.key = props.key || form.key;
        form.name = props.name || form.name;
        form.tags = props.tags || form.tags;
        form.type = props.type || form.type;
        form.crossVersionUpdate = props.crossVersionUpdate !== undefined ? props.crossVersionUpdate : form.crossVersionUpdate;
        form.limit = props.limit || form.limit;
        form.website = props.website || form.website;
        form.github = props.github || form.github;
        form.document = props.document || form.document;
        if (props.memoryRequired) {
          if (props.memoryRequired >= 1024) {
            form.memoryRequired = props.memoryRequired / 1024;
            form.memoryUnit = 'GB';
          } else {
            form.memoryRequired = props.memoryRequired;
            form.memoryUnit = 'MB';
          }
        }
        form.architectures = props.architectures || form.architectures;
        const desc = props.description || {};
        form.description = {
          zh: desc.zh || props.shortDescZh || '',
          zhHant: desc['zh-Hant'] || desc.zhHant || '',
          en: desc.en || props.shortDescEn || '',
          ja: desc.ja || '',
          ko: desc.ko || '',
          ms: desc.ms || '',
          ptBr: desc['pt-br'] || desc.ptBr || '',
          ru: desc.ru || '',
        };
      };
      const getDefaultDockerCompose = () => `services:
    app:
      image: nginx:alpine
      container_name: my-app
      restart: always
      ports:
        - "8080:80"
      environment:
        NODE_ENV: production`;
      const getDefaultAppParams = () => [{
        ...defaultAppParam(),
        id: Date.now(),
        envKey: 'PANEL_APP_PORT_HTTP',
        type: 'number',
        default: '8080',
        required: true,
        label: { zh: 'HTTP 端口', zhHant: 'HTTP 連接埠', en: 'HTTP Port' },
        description: { zh: '设置应用的 HTTP 访问端口，有效范围: 1-65535', en: 'Set the HTTP access port for the application' },
        rule: 'paramPort'
      }];
      reader.onload = async (e) => {
        try {
          enabledUpdateReadmeWatch.value = false;
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(e.target?.result as ArrayBuffer);
          
          const validation = validateAppPackageStructure(zipContent);
          if (!validation.isValid) {
            notification.error({ title: t('tools.app-workshop.script.funcs.importProject.invalidPackageStructure'), content: validation.message, duration: 30000 });
            return;
          }
          const { rootFolder, versionFolder } = validation as { rootFolder: string; versionFolder: string };
          // 读取文件
          const [appDeclaration, logoBlob, readmeZh, readmeEn, appParamsData, dockerComposeData] = await Promise.all([
            readZipFile(zipContent, `${rootFolder}/data.yml`) as Promise<string>,
            readZipFile(zipContent, `${rootFolder}/logo.png`, 'blob') as Promise<Blob>,
            readZipFile(zipContent, `${rootFolder}/README.md`) as Promise<string>,
            readZipFile(zipContent, `${rootFolder}/README_en.md`) as Promise<string>,
            readZipFile(zipContent, `${rootFolder}/${versionFolder}/data.yml`) as Promise<string>,
            readZipFile(zipContent, `${rootFolder}/${versionFolder}/docker-compose.yml`) as Promise<string>
          ]);
          // 处理Logo
          if (logoBlob && await validateImageFile(new File([logoBlob], 'logo.png'))) {
            const logoFile = new File([logoBlob], 'logo.png', { type: 'image/png' });
            appLogo.value = logoFile;
            logoPreview.value = await blobToDataURL(logoBlob);
          } else {
            appLogo.value = null;
            logoPreview.value = "data:image/png;base64," + defaultLogoBase64;
          }
          // 处理自述文件
          readmeContentZH.value = readmeZh || '';
          readmeContentEN.value = readmeEn || readmeContentEN.value;
          dockerCompose.value = dockerComposeData || getDefaultDockerCompose();
          appParams.value = appParamsData ? parseAppParams(appParamsData) : getDefaultAppParams();
          // 填充应用数据
          if (appDeclaration) {
            const data = yaml.parse(appDeclaration);
            if (data.additionalProperties) fillAppForm(data.additionalProperties);
          }
          appVersion.value = versionFolder;
          await nextTick();
          enabledUpdateReadmeWatch.value = true;
          notification.success({
            title: t('tools.app-workshop.script.funcs.importProject.zipSuccess'),
            duration: 3000
          });
        } catch (error) {
          enabledUpdateReadmeWatch.value = true;
          notification.error({
            title: t('tools.app-workshop.script.funcs.importProject.zipParseError'),
            content: String(error),
            duration: 30000
          });
        }
      };
      reader.onerror = () => notification.error({
        title: t('tools.app-workshop.script.funcs.importProject.zipReadError'),
        duration: 30000
      });
      reader.readAsArrayBuffer(file.file);
      return false;
    } catch (error) {
      notification.error({
        title: t('tools.app-workshop.script.funcs.importProject.zipError'),
        content: String(error),
        duration: 30000
      });
      return false;
    }
  };
  // 验证应用包结构
  const validateAppPackageStructure = (zipContent: JSZip): { 
      isValid: boolean; 
      message?: string; 
      rootFolder?: string; 
      versionFolder?: string;
    } => {
    const files = Object.keys(zipContent.files);
    const rootFolders = files
      .filter(path => zipContent.files[path].dir)
      .map(path => path.split('/')[0])
      .filter((value, index, self) => self.indexOf(value) === index);
    let rootFolder = '';
    for (const folder of rootFolders) {
      const hasDataYml = files.some(file => file === `${folder}/data.yml` || file.startsWith(`${folder}/data.yml`));
      const hasLogo = files.some(file => file === `${folder}/logo.png` || file.startsWith(`${folder}/logo.png`));
      const hasReadmeZh = files.some(file => file === `${folder}/README.md` || file.startsWith(`${folder}/README.md`));
      if (hasDataYml && hasLogo && hasReadmeZh) {
        rootFolder = folder;
        break;
      }
    }
    if (!rootFolder) {
      return {
        isValid: false,
        message: t('tools.app-workshop.script.funcs.validateAppPackageStructure.noRootFolder')
      };
    }
    const versionFolders = new Set<string>();
    files.forEach(path => {
      if (!zipContent.files[path].dir) {
        const parts = path.split('/');
        if (parts.length >= 3 && parts[0] === rootFolder && parts[1] && parts[1] !== '') {
          versionFolders.add(parts[1]);
        }
      }
    });
    const allPossibleVersions = Array.from(versionFolders);
    let foundValidVersion = '';
    for (const versionFolder of allPossibleVersions) {
      const hasVersionData = files.some(file => 
        file === `${rootFolder}/${versionFolder}/data.yml` || 
        file.startsWith(`${rootFolder}/${versionFolder}/data.yml`)
      );
      const hasDockerCompose = files.some(file => 
        file === `${rootFolder}/${versionFolder}/docker-compose.yml` || 
        file.startsWith(`${rootFolder}/${versionFolder}/docker-compose.yml`)
      );
      if (hasVersionData && hasDockerCompose) {
        foundValidVersion = versionFolder;
        break;
      }
    }
    if (!foundValidVersion) {
      return {
        isValid: false,
        message: t('tools.app-workshop.script.funcs.validateAppPackageStructure.noFoundValidVersion')
      };
    }
    return {
      isValid: true,
      rootFolder,
      versionFolder: foundValidVersion
    };
  };
  // 清除所有数据（重置）
  const clearAllData = () => {
    dialog.error({
      title: t('tools.app-workshop.script.funcs.clearAllData.title'),
      content: t('tools.app-workshop.script.funcs.clearAllData.content'),
      positiveText: t('tools.app-workshop.components.confirm'),
      negativeText: t('tools.app-workshop.components.cancel'),
      onPositiveClick: () => {
        // 重置应用基本信息
        appForm.value = {
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
          memoryRequired: undefined,
          memoryUnit: 'GB',
          architectures: ['amd64', 'arm64'],
        };
        // 重置应用版本
        appVersion.value = '1.0.0';
        // 重置自述文件
        resetParagraphOrder();
        initializeReadmeSections();
        defaultUsername.value = '';
        defaultPassword.value = '';
        readmeContentZH.value = '';
        readmeContentEN.value = '';
        // 重置Docker Compose
        dockerCompose.value = `services:
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
        - ./data/mysql:/var/lib/mysql`;
        // 重置应用参数
        appParams.value = [
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
        ];
        // 重置Logo
        appLogo.value = null;
        logoPreview.value = "data:image/png;base64," + defaultLogoBase64;
        notification.success({
          title: t('tools.app-workshop.script.funcs.clearAllData.success'),
          duration: 3000
        });
      }
    });
  };
  return {
    logoPreview, appLogo,
    readmeContentZH, readmeContentEN, readmeSections,
    expandProjectManagement, handleLogoUpload, appVersion, downloadAllAsZip, appForm,
    clearAllData, exportProject, handleProjectImportJson, handleProjectImportZip
  };
};