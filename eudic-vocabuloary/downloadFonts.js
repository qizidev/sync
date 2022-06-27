const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const SrcCss = 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap';
const FontDir = path.resolve(__dirname, 'fonts');

(async function () {
    const data = await fetch(SrcCss).then(res => res.text())
    const fonts = data.match(/https:\/\/fonts.gstatic.com\/s\/.*?\.ttf/g)

    fs.mkdirSync(FontDir, { recursive: true });

    for (let i = 0; i < fonts.length; i++) {
        const font = await fetch(fonts[i]).then(res => res.buffer())
        fs.writeFileSync(`${FontDir}/${fonts[i].split('/').slice(-1)[0]}`, font);
    }
    console.log(`${fonts.length} fonts downloaded`);

    fs.writeFileSync(path.resolve(__dirname, 'vocabulary-font.css'), data.replace(/https:\/\/fonts.gstatic.com\/s\/.*\/(.*\.ttf)/g, (all, match) => `fonts/${match}`));
    console.log('CSS file updated');
})()
