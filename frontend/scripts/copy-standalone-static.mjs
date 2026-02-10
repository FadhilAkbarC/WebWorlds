import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');
const staticDir = path.join(root, '.next', 'static');
const publicDir = path.join(root, 'public');
const targetStatic = path.join(standaloneDir, '.next', 'static');
const targetPublic = path.join(standaloneDir, 'public');

const exists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const copyDir = async (src, dest) => {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
};

const main = async () => {
  if (!(await exists(standaloneDir))) {
    return;
  }

  if (await exists(targetStatic)) {
    await fs.rm(targetStatic, { recursive: true, force: true });
  }
  if (await exists(targetPublic)) {
    await fs.rm(targetPublic, { recursive: true, force: true });
  }

  if (await exists(staticDir)) {
    await copyDir(staticDir, targetStatic);
  }

  if (await exists(publicDir)) {
    await copyDir(publicDir, targetPublic);
  }
};

main().catch((error) => {
  console.error('Failed to copy standalone assets:', error);
  process.exitCode = 1;
});
