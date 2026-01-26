import { storeToRefs } from 'pinia';
import { type AppParam, ignoredVariables } from '@/composable/aw.defind';
import { defaultAppParam } from '@/composable/aw.defind';
import { useReactiveReferenceStore } from '@/stores/aw.store';

export function useDockerComposeEditor() {
  const { t } = useI18n();
  const notification = useNotification();
  const { expandAppParams, appParams, dockerCompose } = storeToRefs(useReactiveReferenceStore())
  // 从 Docker Compose 中提取变量
  const extractVariablesFromDockerCompose = (yamlString = dockerCompose.value) => {
    try {
      // 支持默认值 ${VAR:-default}
      const variableRegex = /\$\{\s*([A-Z_][A-Z0-9_]*)(?:\s*:-\s*([^}]*))?\s*\}/g;
      const matches = yamlString.matchAll(variableRegex);
      const extractedVariables = new Set<string>();
      for (const match of matches) {
        if (match[1]) {
          const variableName = match[1].replace(/\s+/g, '');
          if (variableName && /^[A-Z_][A-Z0-9_]*$/.test(variableName)) {
            extractedVariables.add(variableName);
          }
        }
      }
      return Array.from(extractedVariables);
    } catch (error) {
      notification.error({
        title: t('tools.app-workshop.script.errors.extract-parameters-failed'),
        content: String(error),
        duration: 30000,
      });
      return [];
    }
  };
  /**
   * 自动添加 Docker Compose 中的变量到应用参数配置
   * 
   * 该函数会从 dockerCompose.value 中提取变量，并根据变量类型添加相应的参数配置
   */
  const addDockerComposeParameters = async () => {
    const startTime = performance.now();
    // 修改正则表达式来捕获变量名和默认值
    const variableRegex = /\$\{\s*([A-Z_][A-Z0-9_]*)(?:\s*:-\s*([^}]*))?\s*\}/g;
    const variables = new Map<string, { name: string, defaultValue: string }>();
    const matches = dockerCompose.value.matchAll(variableRegex);
    for (const match of matches) {
      if (match[1]) {
        const variableName = match[1].replace(/\s+/g, '');
        const defaultValue = match[2] ? match[2].trim() : ''; // 提取默认值，如果没有则为空字符串
        if (variableName && /^[A-Z_][A-Z0-9_]*$/.test(variableName)) {
          if (!variables.has(variableName)) {
            variables.set(variableName, {
              name: variableName,
              defaultValue: defaultValue
            });
          }
        }
      }
    }
    const variableArray = [...variables.values()];
    const existingEnvKeys = new Set(appParams.value.map(param => param.envKey));
    const ignoredVariablesSet = new Set(ignoredVariables);
    const hasPanelDbType = existingEnvKeys.has('PANEL_DB_TYPE') || variableArray.some(v => v.name === 'PANEL_DB_TYPE');
    const variablesToAdd = variableArray.filter(variable => {
      if (existingEnvKeys.has(variable.name) || ignoredVariablesSet.has(variable.name)) {
        return false;
      }
      // 如果存在 PANEL_DB_TYPE，则跳过 PANEL_DB_HOST
      if (variable.name === 'PANEL_DB_HOST' && hasPanelDbType) {
        return false;
      }
      return true;
    });
    let addedCount = 0;
    variablesToAdd.forEach(variable => {
      const newParam: AppParam = {
        ...defaultAppParam(),
        id: Date.now() + Math.random(),
        envKey: variable.name,
        default: variable.defaultValue // 设置提取到的默认值
      };
      const lowerVar = variable.name.toLowerCase();
      if (lowerVar.includes('name') || lowerVar.includes('user')) {
        newParam.type = 'text';
        newParam.rule = 'paramCommon';
        newParam.edit = false;
        newParam.random = true;
      }
      if (lowerVar.includes('pass')) {
        newParam.type = 'password';
        newParam.rule = 'paramComplexity';
        newParam.edit = false;
        newParam.random = true;
      }
      if (lowerVar.includes('port')) {
        newParam.edit = true;
        newParam.type = 'number';
        newParam.required = true;
        newParam.rule = 'paramPort';
      }
      switch (variable.name) {
        case 'PANEL_APP_PORT_HTTP':
          newParam.default = '8080'
          newParam.description = {
            en: 'Set the HTTP access port for the application, valid range: 1-65535',
            ja: 'アプリケーションのHTTPアクセスポートを設定します。有効範囲: 1-65535',
            ko: '애플리케이션의 HTTP 접근 포트를 설정합니다. 유효 범위: 1-65535',
            ms: 'Tetapkan port akses HTTP untuk aplikasi, julat sah: 1-65535',
            ptBr: 'Defina a porta de acesso HTTP para o aplicativo, intervalo válido: 1-65535',
            ru: 'Установите порт доступа HTTP для приложения, допустимый диапазон: 1-65535',
            tr: 'Uygulama için HTTP erişim portunu ayarlayın, geçerli aralık: 1-65535',
            zh: '设置应用的 HTTP 访问端口，有效范围: 1-65535',
            zhHant: '設定應用程式的 HTTP 存取連接埠，有效範圍: 1-65535',
          },
          newParam.label = {
            en: 'HTTP Port',
            ja: 'HTTP ポート',
            ko: 'HTTP 포트',
            ms: 'Port HTTP',
            ptBr: 'Porta HTTP',
            ru: 'HTTP Порт',
            tr: 'HTTP Portu',
            zh: 'HTTP 端口',
            zhHant: 'HTTP 連接埠',
          }
          break;
        case 'PANEL_DB_TYPE':
          newParam.edit = false;
          newParam.label = {
            en: 'Database',
            ja: 'データベース',
            ko: '데이터베이스',
            ms: 'Pangkalan Data',
            ptBr: 'Banco de Dados',
            ru: 'База данных',
            tr: 'Veritabanı',
            zh: '数据库',
            zhHant: '資料庫',
          };
          newParam.required = true;
          newParam.type = 'apps';
          if (variableArray.some(v => v.name === 'PANEL_DB_HOST') || existingEnvKeys.has('PANEL_DB_HOST')) {
            newParam.child = {
              ...newParam.child,
              default: '',
              envKey: 'PANEL_DB_HOST',
              type: 'service'
            };
          }
          break;
        case 'PANEL_DB_HOST':
          if (!hasPanelDbType) {
            newParam.edit = false;
            newParam.label = {
              en: 'Database',
              ja: 'データベース',
              ko: '데이터베이스',
              ms: 'Pangkalan Data',
              ptBr: 'Banco de Dados',
              ru: 'База данных',
              tr: 'Veritabanı',
              zh: '数据库',
              zhHant: '資料庫',
            };
            newParam.required = true;
            newParam.type = 'service';
          }
          break;
        case 'PANEL_DB_NAME':
          newParam.label = {
            en: 'Database Name',
            ja: 'データベース名',
            ko: '데이터베이스 이름',
            ms: 'Nama Pangkalan Data',
            ptBr: 'Nome do Banco de Dados',
            ru: 'Имя базы данных',
            tr: 'Veritabanı Adı',
            zh: '数据库名',
            zhHant: '資料庫名稱',
          }
          newParam.required = true;
          break;
        case 'PANEL_DB_USER':
          newParam.label = {
            en: 'Database Username',
            ja: 'データベースユーザー名',
            ko: '데이터베이스 사용자 이름',
            ms: 'Nama Pengguna Pangkalan Data',
            ptBr: 'Nome de Usuário do Banco de Dados',
            ru: 'Имя пользователя базы данных',
            tr: 'Veritabanı Kullanıcı Adı',
            zh: '数据库用户名',
            zhHant: '資料庫使用者名稱',
          }
          newParam.required = true;
          break;
        case 'PANEL_DB_USER_PASSWORD':
          newParam.label = {
            en: 'Database Password',
            ja: 'データベースパスワード',
            ko: '데이터베이스 비밀번호',
            ms: 'Kata Laluan Pangkalan Data',
            ptBr: 'Senha do Banco de Dados',
            ru: 'Пароль базы данных',
            tr: 'Veritabanı Parolası',
            zh: '数据库密码',
            zhHant: '資料庫密碼',
          }
          newParam.required = true;
          break;
        case 'PANEL_REDIS_HOST':
          newParam.edit = false;
          newParam.key = 'redis';
          newParam.label = {
            en: 'Redis Service',
            ja: 'Redisサービス',
            ko: 'Redis 서비스',
            ms: 'Perkhidmatan Redis',
            ptBr: 'Serviço Redis',
            ru: 'Сервис Redis',
            tr: 'Redis Hizmeti',
            zh: 'Redis 服务',
            zhHant: 'Redis 服務',
          }
          newParam.required = true;
          newParam.type = 'service';
          break;
        case 'PANEL_REDIS_ROOT_PASSWORD':
          newParam.label = {
            en: 'Redis Service Password',
            ja: 'Redis サービスパスワード',
            ko: 'Redis 서비스 비밀번호',
            ms: 'Kata Laluan Perkhidmatan Redis',
            ptBr: 'Senha do Serviço Redis',
            ru: 'Пароль службы Redis',
            tr: 'Redis Hizmet Parolası',
            zh: 'Redis 服务密码',
            zhHant: 'Redis 服務密碼',
          }
          newParam.required = true;
          newParam.random = false;
          break;
      }
      appParams.value.push(newParam);
      addedCount++;
    });
    await nextTick(); // 确保DOM更新完成
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(4);
    if (addedCount > 0) {
      notification.success({
        title: t('tools.app-workshop.script.funcs.addDockerComposeParameters.success', { count: addedCount }),
        duration: 3000
      });
      if (parseFloat(processingTime) > 0.5) {
        notification.warning({
          title: t('tools.app-workshop.script.funcs.addDockerComposeParameters.warning'),
          content: t('tools.app-workshop.script.funcs.addDockerComposeParameters.processingTime', { time: processingTime }),
          duration: 10000,
        });
      }
      expandAppParams.value = true;
      setTimeout(() => {
        const appParamsCard = document.querySelector('[app-params-card]');
        if (appParamsCard) {
          appParamsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      notification.success({
        content: t('tools.app-workshop.script.funcs.addDockerComposeParameters.failed'),
        duration: 3000
      });
    }
  };
  /** 在模板中显示提取的变量信息 */
  const extractedVariablesInfo = computed(() => {
    const variables = extractVariablesFromDockerCompose();
    // 收集所有已存在的环境变量（包括主参数和子参数）及其id
    const existingEnvKeys = new Map<string, number>();
    // 遍历所有参数，收集主参数和子参数的 envKey
    appParams.value.forEach(param => {
      // 添加主参数的 envKey
      if (param.envKey) {
        existingEnvKeys.set(param.envKey, param.id);
      }
      // 添加子参数的 envKey（如果存在且不为空）
      if (param.child && param.child.envKey) {
        existingEnvKeys.set(param.child.envKey, param.id);
      }
    });
    const ignoredVars = variables.filter(v => ignoredVariables.includes(v));
    // 过滤出新变量（排除已存在和被忽略的）
    const newVariables = variables.filter(v => 
      !existingEnvKeys.has(v) && !ignoredVariables.includes(v)
    );
    // 过滤出已存在的变量（排除被忽略的）
    const existingVariables = variables
      .filter(v => existingEnvKeys.has(v) && !ignoredVariables.includes(v))
      .map(v => ({
        envKey: v,
        id: existingEnvKeys.get(v)!
      }));
    return {
      total: variables.length,
      new: newVariables.length,
      existing: existingVariables.length,
      ignored: ignoredVars.length,
      newVariables,
      existingVariables,
      ignoredVariables: ignoredVars
    };
  });
  return { extractedVariablesInfo, addDockerComposeParameters };
}