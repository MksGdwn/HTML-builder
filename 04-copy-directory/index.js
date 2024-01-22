const fsPromise = require('fs/promises');
const path = require('path');

const dirPathSrc = path.join(__dirname, 'files');
const dirPathDest = path.join(__dirname, 'files-copy');

fsPromise
  .rm(dirPathDest, { force: true, recursive: true })
  .then(() => fsPromise.mkdir(dirPathDest))
  .then(() => {
    copyFiles(dirPathSrc, dirPathDest);
  });

const copyFiles = (dirSrc, dirDest) => 
  new Promise((resolve, reject) => 
    fsPromise.readdir(dirSrc, { withFileTypes: true })
      .then((files) => {
        files.forEach((file) => {
          const filePath = path.join(dirSrc, file.name);

          if (file.isDirectory()) {
            const dirPath = path.join(dirDest, file.name);

            fsPromise.mkdir(dirPath)
              .then(() => copyFiles(filePath, dirPath));
          } else {
            fsPromise.copyFile(filePath, path.join(dirDest, file.name));
          }
        })
      })
      .catch((error) => reject(error))
    )