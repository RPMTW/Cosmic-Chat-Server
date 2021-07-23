/*
MD轉換至Minecraft格式化代碼，由於Minecraft的格式化代碼不同於MD的格式化代碼，因此需要轉換，由3X0DUS - ChAoS#6969提供
*/

function FormattingCodeToMD(source) {
    let regex =
        /(\*[^\*]+\*|\*{2}[^\*{2}]+\*{2}|\*{3}[^\*{3}]+\*{3}|~{2}[^~{2}]+~{2}|_{2}[^_{2}]+_{2})/g;
    let CAS = (str, prefixes) => {
        let test = (text) => regex.test(text);
        let check = (text, regex, template, prefixes) => {
            let s = text.replace(regex, template);

            if (test(s)) {
                return CAS(s, prefixes);
            } else {
                return s;
            }
        };

        switch (str.match(regex)[0][0]) {
            case '*':
                return /\*{3}[^}]+\*{3}/g.test(str)
                    ? check(str, /\*{3}(.*)\*{3}/g, `§l§o$1§r${prefixes.join("")}`, [...prefixes, "§l§o"])
                    : /\*{2}[^]+\*{2}/g.test(str)
                        ? check(str, /\*{2}(.*)\*{2}/g, `§l$1§r${prefixes.join("")}`, [...prefixes, "§l"]) //粗體
                        : check(str, /\*(.*)\*/g, `§o$1§r${prefixes.join("")}`, [...prefixes, "§o"]) //斜體
            case '~':
                return check(str, /~{2}(.*)~{2}/g, `§m$1§r${prefixes.join("")}`, [...prefixes, "§m"]) //刪除線
            case '_':
                return /\_{3}[^}]+\_{3}/g.test(str)
                    ? check(str, /\_{3}(.*)\_{3}/g, `§l§o$1§r${prefixes.join("")}`, [...prefixes, "§o§§n"])
                    : /\_{2}[^]+\_{2}/g.test(str)
                        ? check(str, /\_{2}(.*)\_{2}/g, `§l$1§r${prefixes.join("")}`, [...prefixes, "§n"]) //底線
                        : check(str, /\_(.*)\_/g, `§o$1§r${prefixes.join("")}`, [...prefixes, "§o"]) //斜體
            default:
                return str;
        }
    };
    let msg = source.replace(regex, (_, str) => CAS(str, []));
    return msg;
}

exports.FormattingCodeToMD = FormattingCodeToMD;