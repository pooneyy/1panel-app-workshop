import { BrandDocker } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '1Panel App Workshop',
  path: '/app-workshop',
  description: 'Easily create your own 1Panel local applications.',
  keywords: ['docker', 'compose', '1panel', 'appstore', 'convert'],
  component: () => import('./app-workshop.vue'),
  icon: BrandDocker,
  createdAt: new Date('2025-11-18'),
  category: 'Docker',
});