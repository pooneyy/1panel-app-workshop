import { storeToRefs } from 'pinia';
import { config } from '@/config';
import { base64ToFile, defaultAppParam, defaultLogoBase64 } from '@/composable/aw.defind';
import { useScrollManagement } from '@/composable/aw.ScrollManagement';
import { useReactiveReferenceStore } from '@/stores/aw.store';
export function useLocalStorage() {
  const { t } = useI18n();
  const notification = useNotification();
  const {
    // 卡片展开状态相关
    expandProjectManagement, expandAppForm, expandReadmeEditor, expandReadmeEditorTemplate,
    expandAppDeclaration, expandDockerComposeEditor, expandAppParams, newVarsCollapsed,
    existingVarsCollapsed, ignoredVarsCollapsed,
    // 标签页相关
    projectManagementActiveTab, readmeEditorActiveTab,
    // 自述文件编辑模板卡片表单相关
    defaultUsername, defaultPassword, readmeContentZH, readmeContentEN, readmeSections,
    // 应用参数配置及 DockerCompose 卡片表单相关
    appForm, appParams, dockerCompose,
    // 项目管理卡片相关
    appVersion, appLogo, logoPreview,
    // 滚动监听相关
    scrollPosition,
  } = storeToRefs(useReactiveReferenceStore())
  const { setScrollPosition } = useScrollManagement();
  // 本地存储
  const STORAGE_KEY = config.app.name;
  // 保存数据到本地存储
  const saveToLocalStorage = () => {
    try {
      const dataToSave = {
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
          expandTagForm: param.expandTagForm || false,
          expandDescriptionForm: param.expandDescriptionForm || false
        })),
        // 卡片展开状态
        cardStates: {
          expandProjectManagement: expandProjectManagement.value,
          expandAppForm: expandAppForm.value,
          expandReadmeEditor: expandReadmeEditor.value,
          expandReadmeEditorTemplate: expandReadmeEditorTemplate.value,
          expandAppDeclaration: expandAppDeclaration.value,
          expandDockerComposeEditor: expandDockerComposeEditor.value,
          expandAppParams: expandAppParams.value,
          newVarsCollapsed: newVarsCollapsed.value,
          existingVarsCollapsed: existingVarsCollapsed.value,
          ignoredVarsCollapsed: ignoredVarsCollapsed.value,
        },
        // 标签页状态
        tabStates: {
          projectManagementActiveTab: projectManagementActiveTab.value,
          readmeEditorActiveTab: readmeEditorActiveTab.value
        },
        // 滚动位置
        scrollPosition: scrollPosition.value,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log(t('tools.app-workshop.script.funcs.saveToLocalStorage.success'));
    } catch (error) {
      console.error(`${t('tools.app-workshop.script.funcs.saveToLocalStorage.failed')}: ${error}`);
      notification.error({
        title: t('tools.app-workshop.script.funcs.saveToLocalStorage.failed'),
        content: String(error),
        duration: 30000,
      });
    }
  };
  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) {
        console.log(t('tools.app-workshop.script.funcs.loadFromLocalStorage.noData'));
        return false;
      }
      const parsedData = JSON.parse(savedData);
      // 检查数据是否过期（超过7天）
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsedData.timestamp > ONE_WEEK) {
        console.log(t('tools.app-workshop.script.funcs.loadFromLocalStorage.dataExpired'));
        clearLocalStorage();
        return false;
      }
      // 恢复应用数据
      if (parsedData.appForm) Object.assign(appForm.value, parsedData.appForm);
      if (parsedData.appVersion) appVersion.value = parsedData.appVersion;
      // 恢复LOGO数据
      if (parsedData.logo) {
        try {
          const file = parsedData.logo?.hasCustomLogo && parsedData.logo?.logoPreview ? base64ToFile(parsedData.logo.logoPreview, 'logo.png') : null;
          appLogo.value = file;
          logoPreview.value = file ? parsedData.logo.logoPreview : `data:image/png;base64,${defaultLogoBase64}`;
        } catch (error) {
          appLogo.value = null;
          logoPreview.value = `data:image/png;base64,${defaultLogoBase64}`;
        }
      }
      // 恢复自述文件
      if (parsedData.readmeSections) readmeSections.value = parsedData.readmeSections;
      if (parsedData.defaultUsername !== undefined) defaultUsername.value = parsedData.defaultUsername;
      if (parsedData.defaultPassword !== undefined) defaultPassword.value = parsedData.defaultPassword;
      if (parsedData.readmeContentZH !== undefined) readmeContentZH.value = parsedData.readmeContentZH;
      if (parsedData.readmeContentEN !== undefined) readmeContentEN.value = parsedData.readmeContentEN;
      // 恢复Docker Compose和应用参数
      if (parsedData.dockerCompose) dockerCompose.value = parsedData.dockerCompose;
      if (parsedData.appParams) {
        appParams.value = parsedData.appParams.map((param: any) => ({
          ...defaultAppParam(),
          ...param,
          expandTagForm: param.expandTagForm || false,
          expandDescriptionForm: param.expandDescriptionForm || false
        }));
      }
      // 恢复卡片状态
      if (parsedData.cardStates) {
        const states = parsedData.cardStates;
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
      }
      // 恢复标签页状态
      if (parsedData.tabStates) {
        if (parsedData.tabStates.projectManagementActiveTab) {
          projectManagementActiveTab.value = parsedData.tabStates.projectManagementActiveTab;
        }
        if (parsedData.tabStates.readmeEditorActiveTab) {
          readmeEditorActiveTab.value = parsedData.tabStates.readmeEditorActiveTab;
        }
      }
      // 恢复滚动位置
      if (parsedData.scrollPosition !== undefined) {
        scrollPosition.value = parsedData.scrollPosition;
        setTimeout(() => {
          setScrollPosition();
        }, 100);
      }
      // notification.success({
      //   title: t('tools.app-workshop.script.funcs.loadFromLocalStorage.success'),
      //   duration: 3000
      // });
      return true;
    } catch (error) {
      console.error(`${t('tools.app-workshop.script.funcs.loadFromLocalStorage.failed')}: ${error}`);
      notification.error({
        title: t('tools.app-workshop.script.funcs.loadFromLocalStorage.failed'),
        content: String(error),
        duration: 30000,
      });
      return false;
    }
  };
  /**
   * 清除本地存储
   * 
   * 尝试移除指定键名的本地存储项，并在失败时显示相应的通知
   */
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log(t('tools.app-workshop.script.funcs.clearLocalStorage.success'));
    } catch (error) {
      console.error(`${t('tools.app-workshop.script.errors.clearLocalStorage')}: ${error}`);
      notification.error({
        title: t('tools.app-workshop.script.errors.clearLocalStorage'),
        content: String(error),
        duration: 30000,
      });
    }
  };
  // 自动保存功能 - 使用防抖避免频繁保存
  let saveTimeout: NodeJS.Timeout | null = null;
  const autoSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveToLocalStorage();
    }, 1000); // 1秒防抖
  };
  /**
   * 初始化本地存储监听器
   */
  const initLocalStorageWatchListeners = () => {
    watch([
      () => appLogo.value,
      () => appForm.value,
      () => appVersion.value,
      () => readmeSections.value,
      () => defaultUsername.value,
      () => defaultPassword.value,
      () => readmeContentZH.value,
      () => readmeContentEN.value,
      () => dockerCompose.value,
      () => appParams.value,
      () => expandProjectManagement.value,
      () => expandAppForm.value,
      () => expandReadmeEditor.value,
      () => expandReadmeEditorTemplate.value,
      () => expandAppDeclaration.value,
      () => expandDockerComposeEditor.value,
      () => expandAppParams.value,
      () => newVarsCollapsed.value,
      () => existingVarsCollapsed.value,
      () => ignoredVarsCollapsed.value,
      () => projectManagementActiveTab.value,
      () => readmeEditorActiveTab.value,
      () => scrollPosition.value,
    ], () => {
      autoSave();
    }, { deep: true });
  };
  return { loadFromLocalStorage, clearLocalStorage, initLocalStorageWatchListeners };
}