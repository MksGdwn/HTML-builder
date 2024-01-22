const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
const { Transform, pipeline } = require('stream');

const templatePath = path.join(__dirname,'template.html');
const componentsPath = path.join(__dirname,'components');
const dirPathDest = path.join(__dirname, 'project-dist');
const dirPathSrc = path.join(__dirname, 'assets');
const stylesPath = path.join(__dirname, 'styles');

fsPromise
  .rm(dirPathDest, { force: true, recursive: true })
  .then(() => {
    fsPromise.mkdir(dirPathDest)
  })
  .then(() => {
    fs.createReadStream(templatePath).on('data', (data) => {
      let template = data.toString();
    
      fsPromise
        .readdir(componentsPath)
        .then((files) => {
          files
            .forEach((file) => {
              const filePath = path.join(__dirname, file);
              const basename = path.basename(filePath);
              const extension = path.extname(filePath);
              const fileName = path.basename(filePath).replace(extension, '');

              if (extension === '.html') {
                const htmlPath = path.join(__dirname, 'project-dist', 'index.html');
                const writter = fs.createWriteStream(htmlPath);
                const reader = fs.createReadStream(path.join(__dirname, 'components', basename));
  
                const transform = new Transform({
                  transform(chunk, encoding, callback) {
                    template = template.replace('{{' + fileName + '}}', chunk.toString());
                    this.push(template);
                    callback();
                  },
                });

                reader.pipe(transform).pipe(writter);
              }
            });
        });
    });
  })
  .then(() => {
    fsPromise
      .readdir(stylesPath, { withFileTypes: true })
      .then((files) => {
        const stylePath = path.join(__dirname, 'project-dist', 'style.css');
        const writter = fs.createWriteStream(stylePath);
        files
          .sort()
          .forEach((file) => {
            if (file.isFile()) {
              const filePath = path.join(__dirname, 'styles', file.name);
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
  })
  .then(() => {
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
        );
    const dirAssetsPath = path.join(dirPathDest, 'assets');

    fsPromise.mkdir(dirAssetsPath)
      .then(() => {
        copyFiles(dirPathSrc, dirAssetsPath);
      })
  });
