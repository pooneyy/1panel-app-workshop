import { storeToRefs } from 'pinia';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import { useReactiveReferenceStore } from '@/stores/aw.store';
export function useDownloadFile() {
  const {
    appDeclarationYaml, appParamsYaml, convertedDockerCompose, 
    readmeContentZH, readmeContentEN
  } = storeToRefs(useReactiveReferenceStore())
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
  return {
    downloadReadmeZH, downloadReadmeEN, downloadAppDeclaration, downloadDockerCompose,
    downloadAppParams
  };
}