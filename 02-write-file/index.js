const fs = require('fs');
const path = require('path');
const { stdin, stdout } = require('process');

const filePath = path.join(__dirname, 'text.txt');
const output = fs.createWriteStream(filePath);

stdout.write('Hello! Enter text:\n');
stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') process.exit();
  output.write(data);
});
process.on('SIGINT', process.exit);
process.on('exit', () => stdout.write('\nGoodbye!'));