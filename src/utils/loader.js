import fs from 'fs';
import path from 'path';
import { Collection } from 'discord.js';
import { fileURLToPath } from 'url';

export const loadFiles = (dir) => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(loadFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  }

  return results;
};

export const loadSlashCommands = async (client) => {
  client.slashCommands = new Collection();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const slashDir = path.join(__dirname, '../commands');
  const files = loadFiles(slashDir);

  for (const file of files) {
    const cmd = (await import(`file://${file}`)).default;
    if (!cmd?.data) continue;
    client.slashCommands.set(cmd.data.name, cmd);
  }

  return client.slashCommands;
};
