function FormattingCodeToMD(src) {
    let result = ""
    let types = ["*", "_", "~"]
    let check = false

    let asteriskItalic = false // *
    let asteriskStrong = false // **
    let underlineItalic = false // _
    let underlineStrong = false // __
    let strikeThrough = false // ~~
    let checkAll = () => {
        if (!(asteriskItalic && asteriskStrong && underlineItalic && underlineStrong && strikeThrough)) {
            result += "§r"
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
                    result += "§l"
                    check = true
                    asteriskStrong = true
                    continue
                } else if (asteriskStrong) {
                    check = true
                    asteriskStrong = false
                    checkAll()
                    continue
                }
                result += nowStr
            } else {
                if (src.substring(parseInt(i) + 1).indexOf("*") != -1) {
                    result += "§o"
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
                    result += "§n"
                    check = true
                    underlineStrong = true
                    continue
                } else if (underlineStrong) {
                    check = true
                    underlineStrong = false
                    checkAll()
                    continue
                }
                result += nowStr
            } else {
                if (src.substring(parseInt(i) + 1).indexOf("_") != -1) {
                    result += "§o"
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
                result += "§m"
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
