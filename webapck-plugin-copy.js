const fs = require("fs-extra");

let paths = []
class CopyDirWebpackPlugin {
    constructor(options) {
        if (!Array.isArray(options)) {
            options = [options];
        }
        this.options = options;
    }

    getOptions(skipts) {
        if (skipts) {
            return {
                filter: (src) => {
                    if (fs.lstatSync(src).isDirectory()) {
                        return true;
                    } else {
                        paths.push(src)
                        return src.indexOf(".ts") < 0
                    }
                }
            }
        } else {
            return {}
        }
    }

    apply(compiler) {
        const opts = this.options;
        compiler.hooks.done.tap(
            'Copy Plugin',
            (
                stats /* stats is passed as an argument when done hook is tapped.  */
            ) => {
                opts.forEach(opt => {
                    fs.copy(
                        opt.from,
                        opt.to,
                        this.getOptions(opt.skipts)
                    ).then(res => {
                        console.log(`完成 copy ${opt.from} to ${opt.to} ${JSON.stringify(res)}`);

                        if (opt.skipts) {
                            //把打包生成js删除
                            paths.forEach((src) => {
                                if (src.indexOf(".js") > -1) {
                                    fs.remove(src, err => {
                                        if (err) return console.error(err)
                                        console.log(src, 'remove success!')
                                    })
                                }
                            })
                            paths = []
                        }
                    })
                })
            }
        );
    }
}
module.exports = CopyDirWebpackPlugin;

