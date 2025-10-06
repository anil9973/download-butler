import "../../collections/js/reset.js";
import "../../collections/components/utils/atom-icon.js";
import "../components/file-types.js"
import "../components/folders-table.js"
import "../components/container.js"
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
import fileFormatCss from "../style/file-format.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss, fileFormatCss);
