const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
const { Transform } = require('stream');

const dirPathSrc = path.join(__dirname, 'styles');
const dirPathDest = path.join(__dirname, 'project-dist');

fsPromise
  .readdir(dirPathSrc, { withFileTypes: true })
  .then((files) => {
    const writter = fs.createWriteStream(path.join(dirPathDest, 'bundle.css'));
    files
      .sort()
      .forEach((file) => {
        if (file.isFile()) {
          const filePath = path.join(dirPathSrc, file.name);
          const extension = path.extname(filePath).replace('.', '');
          if (extension === 'css') {
            const reader = fs.createReadStream(filePath);
            const transform = new Transform({
              transform(chunk, encoding, callback) {
                this.push(chunk + '\n');
                callback();
              },
            });
            reader.pipe(transform).pipe(writter);
          }
        }
      });
  });