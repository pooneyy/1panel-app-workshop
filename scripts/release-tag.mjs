import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

if (!version) {
  throw new Error('package.json 中未找到 version 字段');
}

execFileSync('git', ['tag', '-s', version, '-m', ''], { stdio: 'inherit' });
