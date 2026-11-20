import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
async function scan(path) {
  for (const entry of await readdir(path, {withFileTypes:true})) {
    const file = join(path, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(mjs|js)$/.test(file)) {
      const result = spawnSync(process.execPath, ['--check', file], {stdio:'inherit'});
      if (result.status !== 0) process.exitCode = 1;
    }
  }
}
for (const dir of ['explorer', 'examples', 'scripts', 'tests', 'advanced']) {
  try {await scan(dir);} catch (error) {if (error.code !== 'ENOENT') throw error;}
}
