export {
  type AppParam, type ReadmeSection, PLACEHOLDERS, memoryUnitOptions,
  architectureOptions, ignoredVariables, defaultLogoBase64, MONACO_EDITOR_OPTIONS,
  processNumbersForYaml, defaultAppParam, transformKeys, base64ToFile,
};
/** 参数类型定义 */
interface AppParam {
  expandTagForm: boolean; // 控制应用参数配置标签部分表单展开状态
  expandDescriptionForm: boolean; // 控制应用参数配置描述部分表单展开状态
  id: number;
  envKey: string;
  type: string;
  default: string;
  required: boolean;
  edit?: boolean;
  disable?: boolean;
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
/** 定义段落类型 */
interface ReadmeSection {
  id: string;
  type: 'credentials' | 'introduction' | 'configUsage' | 'features';
  enabled: boolean;
  title: string;
  contentZH: string;
  contentEN: string;
  hasCustomContent: boolean;
}
/** 打包应用表单占位符 */
const PLACEHOLDERS = {
  appKey: 'undefined-app',
  descEn: '',
  descZh: '',
  version: 'latest'
} as const;
/** 内存需求单位选项 */
const memoryUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'MB', value: 'MB' },
];
/** 架构选项 */
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
/** 忽略的应用变量 */
const ignoredVariables = ['CONTAINER_NAME', 'PANEL_DB_PORT'];
/** 默认 Logo Base64 编码 */
const defaultLogoBase64 = 'iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAMAAAAKE/YAAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAn1BMVEVHcEw9sO1JnN0jqvAYr/Nhl9g/jdsjkusEr/ICqvghpu4jeNQyrekVsPEcRNofsPARMuQjr+4zbdYnZNgEkNwpse4ed9gZbNYSaNYictcUg9odQ+AZPeQjPuAaidsRId8YSfoBsPQAi9kAhtgDJecActgDLOYAbNcBedgBgNgDHecBZdgBOuICM+QAXtkBVtoBQOABTtwAkNsBR94GOvVr8z01AAAAIXRSTlMAPR5w0Q0vA/z+j2pW6lO55qREfPqBrtHql+KzzpXJ9eddCv7DAAAReklEQVR42syciULqOhCGK9IWZBHbw1IVvWwFZAff/9luZrJN2gJJxSUHEBHox88/k6WZ43m3bmHIf/h+SH//yw0I/bvuU7XaalWrj91mRTz4h5EZ3t1Tq1YfsX/swu7UHpt/GhuQm4+10ajGWr3GG/ut2vy7JgGVGTIAY5NqM+6/is2QKk81LjIT9+n+vvvwWGXAIDkzyd3f8wjj8R8QGexwX5GPB/fVEdiFXZ8qfwubffPhfQu9zDWFh6DBvbtHbvJRrev/HWyMvypF1vbFewJ7NGrd/xVr6/grDjj6mf5IROr4Oy8kPGa4J/wD8cfzce3hvGXheV2IRvj3uxHJFRQyPwUXUfAbgUQC19+LSO5VaearXzr28NVfjkgafy2r8JIRiXL/RkSS/m/U6oaW3zY8DyNy9AsRqfs/17iCD/sw+oWINDNY4Hhg9uTgSXjkxyIyH3+h+xtgRI5+KiJDI/5KHlH1kT8TkfjdysHcF75bFZHf30diFJWKvzOx/P0RSdUZ3UAd+NYehUcuDQFuNP7M+jAsj30nO5tviEge8cXxF7pgh0Y/hEq0vqmPxG+SI9cy8QeHqdgeLf9k+AxdiX3LiOTxVyuKPzh89Jq+tq2w4bO/vGeeLHpXHpO3ikgcCovxZzY7IcUmTdPpy/WOEd5o+AHNfHIoIvJ2fSR3Xe1c/PnDDTbGPbwsErwufv/4mCL2MGex2/WRNP5qrRxyGHc2sqXp+/CCSOzx9itDngI1Y3+PCyPyBvNIHX8w/syJ02bIa2gSu9M4czS0EePFJsTu5Kx9iz6SD5lFe6hkzRy9rtf79ZpQb6bTwohEGzHWdCob536NCiPyC/0tn4rKlBFkkSsvDHm/3gtuaZJpmotINHNnOmXRKrG5S96zEannkeX6SDpl5V9WJv4YLW+Seq28PazkzJwyZGzv7N77R6o88jHMZVCyshO6YJtD5kz8sbuNzn5/2u8NbEW9STHIVKu8MNBNKhtTO0VzA/KZiCyxsiOGzLXCLhvNzJB5M8RGcIa+3qSdiuAIvXiTwgcReRGpQe2p5M5HpJwXjRwmGXTInEkZPAucTocDRz7ts9jc3y+Rfknw8vmJxJtUUXNzS4cURqRa2bFJJGTIXMuGMPxteGDI7HqS2Puc2qAcbdErYqf8kqYb1PojJWKfj0iLRGJ02fmUEcYHbCdFTbhFJukwj9IvFGPgP8BG5I30NU3Z77mI9EREjq4Oti+mDMgCg4NuHHtvyM2wCzpzzDZCbIDeTLnWKgHydi4iRyKRFFtbp4xaUcqI+rvDbseuElmJrbHPDJtCw9o6iZjOLopIc/p7eZUrM2bBgwpkQX0gDpHkmXjKvLuytuDWUk8vRGR4aYGF/fpwPmVUkt12J5umNqx9duCh7QXWRuRNJo1MlbfzEckTCZ79yPa1XqUqTvrlRxlhPNgx6K1ANqmFTw7xtV4X3wixU5KxjcEIgg/zkvERCZvZ+OZfglZhfuHxx4C3ihqYdyQeEXtoM77BlIl55DK2GZFyHQ00rRJqpjMwiyyXGcz1t7IpixjYrL0E9qumPCLTC8YujEhcbGAJgmpdhUeyq8ygTI8Qb01jS+4L8Vds7deM2mrkp1s2IiGRYMg9SujQ6+KnqGSR/ZjRrrZbA5xws+th0HCbZqjOJiVDkWle7WxESjc05aPwq6k8hk1jsIK2Xa0kszA34Y7d56Gis8ljf9CkXdBHImbL10KPakGGWSOviNqmS5JyM36cRDBsPWJVYlPsd2NEwO7dQTB2xRGZo0cPXmjG32o1X60EN/UIUsOP3UvwlVVT6GzSNDWxTWfziCQvegJH8BWtANJghSYTP5mv5uxyjhvAB+0vzZlFZ0NMMp0WROSLwXUHu0ju2J3Qa9Zro0f6t2AwnxvMeexBHH5x4Q02AcT/5agNW4NHjIEueKKL0N06vyeZo7lsinvLjY3YcJPcYvlKdDbKJYVZhAUk9YfQN/Qe6iSTAPNsTrFXVG642faCGy0Uis4mFdg6FjPUOjcz1Creo9AssQxmrElkJfZWWmTVj263JBvK4Z/IfcXGjhXcvQF9px7vAfLMNAiR27Uzse1siNQcmVJHnO4MNDPHTDTiEMKc3P40Aw7/lLMVNg3JV08rXVfQdQXdmy241DMzHBG89z0ndERnk+lkKHUkzjdQ6LqAZo4G5gWXOoPNzfxtZydFZ2MunclEMrwIHc0WC6H1zMgiNzdzYWejfS2x+W3ngj1CryGhM1rP4u8+iy2sTW0tpGaXji+h6wVKA7SgnvMLtlJmDkt1NnQyI6x9FXrBobXYrA2in9srEHWmlBo8/flhA72Q0Tjn5FG50/ZBKew27c95JFopvSC+Zm0RlFqUj1aVMpZq02Dk5J+2SmvsRSloz+uvkrLQptYf1+2xXBCH8Jug1MFZZ1QpEYxtYxCCOn/aQkutF2WV7kOnXw46s7QwtVV6pjyyKAPN3gg7/or7rLedG11bKW1oXVLpcLCCfjQpDU20/vyYXoXW1Ch4GaWF0HN3qRGaLAeL+a6N0lrrkvbwudDuUgP0hiyHpFzq60obWpdROvRiNeepuO7aa6fm0jtiW9nja9BMaDWkTUpAk9OOwP1pA73McC8D1wPHZBjuJjVXmmqNK++W9mDMAnvprLQv1k1wHJ64QhNkhX0FejlZLpemrx2VVkKL+aWT1Bx6Y4Azf9hBa2svnZWWjhZz4qQUtHk63UVpfuOmNAhN5mkM2+XlWmlxftdFaQEO2I7QKLSxAJGUgianwSyUJlKLGzep4nlmXuwiNUCvycYopP5MLZSefEVpf4CrJuwSS+rEDVpQk3xtobRhkKUbtBAaWuL1Zs5Sc6XXBBvBrys9MXztqLQ/EMzPoRfIyXziBk236Wzs7DEh2AtHaCJ05PleIqjtpebQgjrdyHGIRSBmxXZQmgnNR+E9PIsmFzJ7jtBKa+EQC6UNsdlPB51iMR/GDgl+5dTWUkt76F1zDNzeHiSL2CuthBYuBoc7SS2VJnvmrJXmJnFVmgsN84aBr5bZuNa2UlPote4Zbe2BSk/c7OEP+Mxy0VCnSfpyNdAB2txVudl8WkITsa2hhdCM+1mfKmvL1Ve7N2EvUHsqNfc16MmYMoPc9kqD0NgiJXTovaE9ZpZSc+i9aZDNxhJaY08mtiI1ZgK6T5o6WWb1Lgi91/tX17bQY5Pa3h4DPa2c0QZKW0pNlNZqf16HVlK7KY1CL/Prl5J7ZiW1UHq/NlOIhT3GhBqapT36emKpTzfN1EkFK6mlPYw9t2sLpYnUHNtOogaZDJP1QI1tI7VSmmy5tYI2bW2rNApNsGeZpXk7qSU02UwOtxZKjw2LWEGrpUsl9XPcTJZmTFpIraCNaFzbQCPy2AXa8/p8liMWMN+a8JJK/KypraQugrZVeuyoNDuWmFLirLIXYceCu7feqLOj62VHDDqzldxC6X+CeexkD6+vVkuWSSBPIuJJsainsftW0JyaSm0FTbnH16FRaN6e42wZHJt29ZRJrkkN0Cel9N4N2uhjLJTuC+SGnzuDjvV8yTPH7l/3GSk1UOU/tkorY19XWgr91vQKT/rDQ/49x25f2/vLoGEDvNz7jth7B3sA8djGHt4bQ+4F58+HY0w2ISb7FkqfjDoD+Oeg9NhO6dBr5qxcfHr/rkfmB5egT6avLZQ+muawUDqJfYvNIJi5k56V0rSEZn9V6bGh9NgKGr98qzEVmNvC01ppofZV6KMGFhebzsVhd4QVtNSa1+LZQ3NPj22gb7flQytNtLZRmmoNNz8LrUo6tK0toI8ZT/889CGj9ckK+mhE409D63K20zl7hDnoYyZ7NH/sv8RhhxmesBTF4D51wqtKAzQF/9f8oY1XsBPykGM+FUE/0X15aA9Ta3a52ebjK9mwQcrwNPapEJoofUSlj2MTezxJfmAzYfR6UCVWRsXj6fWi0tER29hwyAQGJM/fu20TCoFEYdjuYBaXsttX75LSlX9HqfRRp2rAnkzevnWDbKxqBwvKS/UG2bzS7OYN/XGk/piM5brC921FbvdJoVIO+hQVQNc1dFOY2vS1nJ7/+3LRxZmcsSNlSqRME+PxcCrY9E2UhvH8UTvEjEVcDXm+cfrDypGdLlLiFWFm6eChLSXtGtC6kCE4ymb4mjuEWXt50/SH9Y5mURgpwDvxH4mC09UXFBq+Au3qo5mt5bLCzdIflozoarZcRawod9RPf6CFDHVanPMgqHO2Vty3SX8wI0hUnVK23JG3HTIrQXVxDriblkGFD8ci7AlZ4lt+Pf2JSlhdXkULYvkVnZKQA4WyNC707hh0zdi0c3/MJ77MutOy9+X/pivoy7rBVVZr0cuwS8MjHoCCM1FHFLYYtVnaF7wdi5MIXQZulE9/6Ix8uaNZWsqQ+4GB9aiqKEURZcUsSGz809hFSgP1c0mPhLxGc0tr2WRlKaUeNMxyxCYUXHdl3w2V+1XzCZ7PnC2xM3MZveBetsABajSLqwZ3OvuZSYqXiY9aFZUvsFA4zFVrI/aYeoRKjSfPY9/RIzg0AlZdoPl/dWfbmzYQw3EKCUmhHaIDOuUF0oGmLuLdvv+HW8++J9t3SQ4SYHSq1GpV3cP++y5n/0wcxKrfgROmoLVdLdw3S/i6EDirl+Pf6FYkuP1qmyxqkvGMoLXKWH2hHbG0e8m1YH/r3SwISyVZy/BfGxGR4fUoXKFnpEj0DFOw9xX2OZJe708BcjDN7u+kRR//DuBNMLMXjVhtNLs9m3KnczswRcIzXzSZ9fCa1cYFZw1XFqGKDk1c4S3J7yv3TEjITTTaPSRFomfIVljy0t27pZAEA7Ap5hw78fKeNHu+NULiPeQU3unqT70tdOAZpDIyajft3kUejTFsW0nAR7VSKkWLWm6Y1dSxoVahU/5AM1hlpOgqvVyYZMw89TXOUnHeLiE7lRcS79fkVhcvL5KuDcepX1+sOdM49wX1zzY8ErK540hpHnAKWuMYWYxNEgqJyDGmnOWcdG3wjN+/IzbjBzZNf/7gJjvqJCel8AXxfxtFewE/BiPyJK6SfJXWUbY6g2e4+/3IWoPhUjIsdbKXxORge0pSpSGOwWy+EyHVZVy19XEqvCSndcrmJSXDgaL7EOJ2RfcJtJcTkpN0bOvXZ1Rt4hmkx/GLL7Yu65SSUYfU10FMTKeMHCRkhQTj0a11Sz/atf+J+YFXUeBiwz+suhG7DCYZw+mjDhEtmaAgJDKjY3LUyab54EaHa22MtWveJRl5MEgrJEpymZyQyI0qlj01a+qDy0Prbf4TlNrADa6UDI+wqnJ53BTtJUFUO2M2K8Jpd7ztWXv10bfekbqVJr7LqK9GDlPYXlxIeJY5nyMMDXxreEnW96fULuOmkSQhbE9JdqwWEqYhhyQQbbZufEsp1tsIyRgJFO3HKERgWBCRp52X62MnEK38uQtbBqVkjDbUowojkrkZ/CJttr7gMA/5qu69dGvNPn4kU/YYIGoB22Nmrxu92vA4tbfAQguJtrvpSNkjQfj7InLRnHaDGDawoIdvSeSbmtFA7RmpvXwb+qsgbZXiZPQeT79jPPh2rHmZ2oc7ocSTp97EsZ7KpqidVV7nHwuXesLRDKGQ1GPEyxTxl5far0sBxmQ16biR0AdvmhBHTtmb5fT3qmyDfu1b5rbML/eYM5LD0U0GRxE/0k1q9tKf2ssrhtC4LfO+utvsHDbYqcod9zNB/ssWkoyD3F3jL57aHUd3WDBdeWQdPSIdIn8z6OHEw4eFzQiQtvPJ1f3yX1ZqrzvJ1rcM6npYRBJnfkD89aT22EMskkyeZsyqHFoRHv9IMlk80WRYk9rN8XdprDW266kD6vHx1xOR9ebNjb+Y2wnCE+8/b4xI2CDXxXa136+2Ra3U0KmPjzIbc6QebPyq9JBjZURcPfF0Zru1UHaYNFqsikX11HOw9XOQQg+SxnHSr+Dh1dNPHIfoW23+oyHpaHZlNS//AcOw1z+wdV3l+lowAAAAAABJRU5ErkJggg==';
/** monaco编辑器配置 */
const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};
/** 
 * 递归遍历对象，将可转换为数字的字符串值转换为数字类型
 * 
 * 深度克隆输入对象，然后递归遍历所有属性。当遇到字符串类型的值时，
 * 如果该字符串可以解析为有效的数字（非空且可转换），则将其转换为数字类型。
 * 
 * @param {any} obj - 需要处理的对象，可以是任意类型（对象、数组、基本类型）
 * @returns {any} - 返回处理后的新对象（原始对象的深拷贝），其中符合条件的字符串已转换为数字
 */
const processNumbersForYaml = (obj: any): any => {
  const result = JSON.parse(JSON.stringify(obj));
  const processValue = (value: any) => {
    if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }
    return value;
  };
  const traverse = (obj: any) => {
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
/**
 * 配置默认的应用参数
 * 
 * @returns 返回一个包含默认配置的AppParam对象
 */
const defaultAppParam = (): AppParam => ({
  expandTagForm: false,
  expandDescriptionForm: false,
  id: 0,
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
/**
 * 递归转换对象中的键名
 * 
 * @param obj - 需要转换的对象
 * @returns 转换后的新对象
 */
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
/**
 * 将Base64数据URL转换为File对象
 * 
 * @param dataUrl - Base64数据URL字符串，格式为"data:[MIME类型];base64,[数据]"
 * @param filename - 转换后File对象的文件名（包含扩展名）
 * @returns 转换成功的File对象，如果转换失败则返回null
 */
const base64ToFile = (dataUrl: string, filename: string): File | null => {
  try {
    // 检查是否是有效的data URL
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return null;
    }
    // 解析data URL
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      return null;
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // 创建Blob然后创建File对象
    const blob = new Blob([u8arr], { type: mime });
    return new File([blob], filename, { type: mime });
  } catch (error) {
    console.error('Error converting base64 to File:', error);
    return null;
  }
};
