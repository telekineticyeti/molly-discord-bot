const fs = require('fs-extra');

/**
 * Copy asset directories from src modules to dest modules.
 */

const srcDirModules = 'src/lib/modules';
const distDirModules = 'dist/lib/modules';
const botModuleList = fs.readdirSync(srcDirModules);

botModuleList.forEach(mod => {
  const srcItem = `${srcDirModules}/${mod}`;
  const destItem = `${distDirModules}/${mod}`;
  var stat = fs.statSync(srcItem);

  if (stat && stat.isDirectory()) {
    const srcAssets = fs.existsSync(`${srcItem}/assets/`) ? `${srcItem}/assets/` : null;
    const destAssets = `${destItem}/assets/`;

    if (srcAssets) {
      fs.copy(srcAssets, destAssets, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log(`Copied assets from ${srcItem}`);
        }
      });
    }
  }
});
