const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const (?:currentT|t)emplateId = searchParams\.get\(['"]template['"]\) \|\| ['"]main['"];/g, 
    "const $&".replace('const const', 'const').replace("'main'", 'window.location.hostname')
  );
  fs.writeFileSync(file, content);
}

patch('src/App.tsx');
patch('src/components/AdminPanel.tsx');
