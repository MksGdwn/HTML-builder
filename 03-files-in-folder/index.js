const fsPromise = require('fs/promises');
const path = require('path');
const { stdout } = require('process');

const dirPath = path.join(__dirname, 'secret-folder');

fsPromise
  .readdir(dirPath, { withFileTypes: true })
  .then((files) => {
    files.forEach((file) => {
      if (!file.isDirectory()) {
        fsPromise
          .stat(path.join(dirPath, file.name))
          .then((value) => {
            const filePath = path.join(__dirname, 'secret-folder', file.name);
            const extension = path.extname(filePath);
            const name = path.basename(filePath).replace(extension, '');
            stdout.write(`${name} - ${extension.replace('.', '')} - ${value.size}\n`);
          });
      }
    });
  });
