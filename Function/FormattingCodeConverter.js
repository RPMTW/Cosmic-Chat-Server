/*
MD轉換至Minecraft格式化代碼，由猴子#3807提供
*/

function FormattingCodeToMD(src) {
    let result = ""
    let types = ["*", "_", "~"]
    let check = false

    let asteriskItalic = false // * 斜體
    let asteriskBold = false // **  粗體
    let underlineItalic = false // _ 斜體
    let underlineBold = false // __  底線
    let strikeThrough = false // ~~  刪除線
    let checkAll = () => {
        if (!(asteriskItalic && asteriskBold && underlineItalic && underlineBold && strikeThrough)) {
            result += "§r" //重置文字樣式
        }
    }
    for (i in src) {
        if (check) {
            check = !check
            continue
        }
        let next = src.charAt(parseInt(i) + 1)
        let ord = src.charAt(parseInt(i) - 1)
        let nowStr = src.charAt(i)
        if (nowStr == "\\" && ord != "\\") {
            if (!(types.includes(next) || types.includes(ord))) {
                result += nowStr
            }
        } else if (!types.includes(nowStr)) {
            result += nowStr
        } else if (nowStr == "*" && ord != "\\") {
            if (next == "*") {
                if (src.substring(parseInt(i) + 1).indexOf("**") != -1) {
                    result += "§l" //粗體
                    check = true
                    asteriskBold = true
                    continue
                } else if (asteriskBold) {
                    check = true
                    asteriskBold = false
                    checkAll()
                    continue
                }
                result += nowStr
            } else {
                if (src.substring(parseInt(i) + 1).indexOf("*") != -1) {
                    result += "§o" //斜體
                    check = true
                    asteriskItalic = true
                    continue
                } else if (asteriskItalic) {
                    check = true
                    asteriskItalic = false
                    checkAll()
                    continue
                }
                result += nowStr
            }
        } else if (nowStr == "_" && ord != "\\") {
            if (next == "_") {
                if (src.substring(parseInt(i) + 1).indexOf("__") != -1) {
                    result += "§n" //下劃線
                    check = true
                    underlineBold = true
                    continue
                } else if (underlineBold) {
                    check = true
                    underlineBold = false
                    checkAll()
                    continue
                }
                result += nowStr
            } else {
                if (src.substring(parseInt(i) + 1).indexOf("_") != -1) {
                    result += "§o" //斜體
                    check = true
                    underlineItalic = true
                } else if (underlineItalic) {
                    check = true
                    underlineItalic = false
                    checkAll()
                    continue
                }
                result += nowStr
            }
        } else if (nowStr == "~" && next == "~" && ord != "\\") {
            if (src.substring(parseInt(i) + 1).indexOf("~~") != -1) {
                result += "§m" //刪除線
                check = true
                strikeThrough = true
                continue
            } else if (strikeThrough) {
                check = true
                strikeThrough = false
                checkAll()
                continue
            }
            result += nowStr
        } else {
            result += nowStr
        }
    }
    return result
}

exports.FormattingCodeToMD = FormattingCodeToMD
