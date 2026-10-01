const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  // replace the specific searchParams pattern
  content = content.replace(
    /const (?:currentT|t)emplateId = searchParams\.get\(['"]template['"]\) \|\| ['"]main['"];/g, 
    "const templateId = searchParams.get('template') || window.location.hostname;"
  ).replace(
    /const currentTemplateId = searchParams\.get\(['"]template['"]\) \|\| ['"]main['"];/g, 
    "const currentTemplateId = searchParams.get('template') || window.location.hostname;"
  );
  fs.writeFileSync(file, content);
}

patch('src/App.tsx');
patch('src/components/AdminPanel.tsx');
