const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function transcribeAudio(audioPath) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(audioPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error('Файл не найден:', fullPath);
      return resolve(null);
    }

    const tmpDir = path.join(process.env.TEMP || 'C:\\temp', 'whisper_input');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const simpleName = 'voice_' + Date.now() + '.webm';
    const tmpPath = path.join(tmpDir, simpleName);
    
    fs.copyFileSync(fullPath, tmpPath);

    const command = `python -m whisper "${tmpPath}" --model small --language ru --output_format txt --output_dir "${tmpDir}"`;

    console.log('Запускаю Whisper...');
    console.log('Файл:', tmpPath);
    console.log('Папка:', tmpDir);
    
    exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
      // Выводим всё
      console.log('STDOUT:', stdout);
      console.log('STDERR:', stderr);
      
      try { fs.unlinkSync(tmpPath); } catch {}

      if (error) {
        console.error('Ошибка:', error.message);
      }

      const txtPath = path.join(tmpDir, simpleName.replace('.webm', '.txt'));
      console.log('Ищу текстовый файл:', txtPath);

      try {
        if (fs.existsSync(txtPath)) {
          const text = fs.readFileSync(txtPath, 'utf-8').trim();
          fs.unlinkSync(txtPath);
          console.log('Распознано:', text);
          resolve(text || null);
        } else {
          // Покажем, что в папке
          const files = fs.readdirSync(tmpDir);
          console.log('Файлы в папке:', files);
          resolve(null);
        }
      } catch (err) {
        console.error('Ошибка:', err.message);
        resolve(null);
      }
    });
  });
}

module.exports = { transcribeAudio };