import { storeToRefs } from 'pinia';
import { type AppParam, defaultAppParam } from '@/composable/aw.defind';
import { useReactiveReferenceStore } from '@/stores/aw.store';
export interface AppParams {
  /**
   * 过滤环境变量选项
   * 
   * 根据输入的环境变量键值过滤并返回可选的环境变量选项
   * 函数支持分组结构，并限制最大显示数量，
   * 但是当前的最大显示数量为动态获取的 optionalEnvVars(可选环境变量)数组长度
   * 
   * @param {string} envKey - 要过滤的环境变量键值
   * @returns {Array} 过滤后的环境变量选项数组
   */
  getFilteredEnvVarsOptions: (envKey: string) => any;
  /**
   * 添加新参数
   * 
   * 向appParams数组中添加一个新的参数对象
   * 新参数对象包含默认参数、唯一ID和展开表单的标记
   */
  addParam: () => void;
  /**
   * 将指定索引处的参数向上移动一位
   * @param index - 当前参数的索引位置
   */
  moveParamUp: (index: number) => void
  /**
   * 将指定索引处的参数向下移动一位
   * 
   * @param index - 当前参数的索引位置
   */
  moveParamDown: (index: number) => void
  /**
   * 滚动到指定参数元素
   * 
   * @param paramId - 参数元素的唯一标识ID
   */
  handleScrollToParam: (paramId: number) => void;
  /**
   * 移除指定索引的参数
   * 
   * @param index - 要移除的参数索引
   */
  removeParam: (index: number) => void
  /**
   * 为 Select 类型添加选项一个选项
   * 
   * @param param 应用参数对象，values 数组，结构为 { label: '', value: '' }
   */
  addOption: (param: AppParam) => void
  /**
   * 从参数选项中移除指定索引的选项
   * @param param - 应用参数对象，包含values属性
   * @param index - 要移除的选项在values数组中的索引位置
   */
  removeOption: (param: AppParam, index: number) => void
}
/**
 * 应用参数管理组合式函数，提供参数列表的增删改查、排序、过滤以及参数选项管理功能
 * 
 * 封装应用参数管理的核心逻辑:
 * 1. 从响应式存储中获取参数数据和环境变量配置
 * 2. 提供环境变量选项的智能过滤功能（支持分组和搜索）
 * 3. 参数列表的CRUD操作（添加、删除、上下移动）
 * 4. 参数选项的管理（添加、删除选项）
 * 5. 自动滚动到指定参数卡片的辅助功能
 * 
 * @returns {Object} 应用参数管理的方法集合
 * @property {Function} getFilteredEnvVarsOptions - 根据关键字过滤环境变量选项，返回匹配的选项列表（支持分组结构）
 * @property {Function} addParam - 添加新的应用参数到列表，并自动展开编辑表单
 * @property {Function} moveParamUp - 将指定索引的参数向上移动一位，并滚动到新位置
 * @property {Function} moveParamDown - 将指定索引的参数向下移动一位，并滚动到新位置
 * @property {Function} removeParam - 移除指定索引的参数
 * @property {Function} addOption - 为指定参数添加一个新的选项（包含label和value字段）
 * @property {Function} removeOption - 移除指定参数的指定索引的选项
 * 
 * @see {@link AppParams} 应用参数类型定义
 * @see {@link useReactiveReferenceStore} 响应式存储引用
 */
export function useAppParams(): AppParams {
  const { expandAppParams, appParams, optionalEnvVars } = storeToRefs(useReactiveReferenceStore())
  const optionalEnvVarsCount = computed(() => {
    return optionalEnvVars.value.reduce((total, item) => {
      if (item.type === 'group' && item.children) {
        return total + item.children.length;
      } else {
        return total + 1;
      }
    }, 0);
  });
  const getFilteredEnvVarsOptions = (envKey: string) => {
    const inputValue = envKey.toLowerCase().trim();
    const MAX_OPTIONS = optionalEnvVarsCount.value; // 展示的最大选项数
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
      } else {
        if (( option.label.toLowerCase().includes(inputValue) ||
              option.value?.toLowerCase().includes(inputValue)) && 
              count < MAX_OPTIONS ) {
          result.push(option);
          count++;
        }
      }
    }
    return result;
  };
  const addParam = () => {
    appParams.value.push({
      ...defaultAppParam(),
      id: Date.now(),
      expandTagForm: true
    });
  };
  const moveParamUp = async (index: number) => {
    if (index > 0) {
      [appParams.value[index], appParams.value[index - 1]] = [appParams.value[index - 1], appParams.value[index]];
      await nextTick();
      scrollToParam(appParams.value[index - 1].id, 'smooth');
    }
  };
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
  const removeParam = (index: number) => {
    appParams.value.splice(index, 1);
  };
  const addOption = (param: AppParam) => {
    if (!param.values) {
      param.values = [];
    }
    param.values.push({ label: '', value: '' });
  };
  const removeOption = (param: AppParam, index: number) => {
    if (param.values) {
      param.values.splice(index, 1);
    }
  };
  const handleScrollToParam = (paramId: number) => {
    expandAppParams.value = true;
    nextTick(() => {
      scrollToParam(paramId, 'smooth');
    });
  };
  return {
    getFilteredEnvVarsOptions, addParam, moveParamUp, moveParamDown, handleScrollToParam,
    removeParam, addOption, removeOption
  };
}
