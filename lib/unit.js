const path = require("path");
const fs = require("fs-extra");
function _path(dir) {
  return path.join(process.cwd(), dir);
}

function arrayToUpperCase(arr) {
  const r = [];
  arr.forEach((key) => {
    r.push(key.slice(0, 1).toUpperCase() + key.slice(1));
  });
  return r.join("");
}

class UnitLib {
  getFilesList(dir, c) {
    const list = [];
    const failList = [];

    function getDirTree(inputPath, callback) {
      let files = fs.readdirSync(inputPath);
      files.forEach((file) => {
        let filePath = (inputPath + "/" + file).replace("//", "/");
        let fileState = fs.statSync(filePath);
        if (fileState.isDirectory()) {
          // 如果是目录 递归
          getDirTree(filePath);
        } else {
          const { name, ext } = path.parse(file);
          let genre = "default";
          if (ext == ".js") {
            let RelativeName = path
              .relative(_path(dir), filePath)
              .replace(".js", "")
              .replace(/\//g, "\\")
              .split("\\");
            if (RelativeName[0].indexOf("@") >= 0) {
              const r = RelativeName[0].split("@");
              genre = r[1];
              RelativeName[0] = r[0];
            }
            if (/^[a-zA-Z]{1}[a-zA-Z\d]{0,16}$/.test(name)) {
              list.push({
                path: filePath,
                file,
                genre,
                name,
                RelativeName: arrayToUpperCase(RelativeName),
                Name: arrayToUpperCase([name]),
              });
            } else {
              failList.push(filePath);
            }
          }
        }
      });
      callback && callback.call(this, { list, failList });
    }
    getDirTree(_path(dir), function (ret) {
      c(ret);
    });
  }
}

module.exports = new UnitLib();
