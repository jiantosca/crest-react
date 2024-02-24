import { CSSProperties } from "react";


export const lightMode: { [key: string]: React.CSSProperties } = {
  // placeholder
}
const background = 'inherit'; //orig: #2f2f2f
const fontSize = '.95em'; //orig: '1em'


console.log("TODO calc witdh of pre more dynamically??");
//from /Users/jon/Projects/react/rest-client/node_modules/react-syntax-highlighter/src/styles/prism/vsc-dark-plus.js
export const darkModeVsPlus: { [key: string]: React.CSSProperties } = {
    "pre[class*=\"language-\"]": {
        //need to calc with based on whatever padding we have splus if 
        //drawer is expanded.
        //"width": "calc(100vw - 75px)", //jpi ... pre must have width to enable scrolling.
        "color": "#d4d4d4",
        "fontSize": `${fontSize}`,//jpi
        "textShadow": "none",
        "fontFamily": "Menlo, Monaco, Consolas, \"Andale Mono\", \"Ubuntu Mono\", \"Courier New\", monospace",
        "direction": "ltr",
        "textAlign": "left",
        "whiteSpace": "pre",
        "wordSpacing": "normal",
        "wordBreak": "normal",
        "lineHeight": "1.5",
        "MozTabSize": "4",
        "OTabSize": "4",
        "tabSize": "4",
        "WebkitHyphens": "none",
        "MozHyphens": "none",
        "msHyphens": "none",
        "hyphens": "none",
        "padding": "1em",
        "margin": ".5em 0",
        "overflow": "auto",//jpi auto or hidden when word wrapping
        "background": `${background}` //jpi


    },

    //crest for word wrapping....
//    this.entityCode.style['white-space'] = 'pre-wrap';
//    this.entityCode.style['word-wrap'] = 'break-word';
    "code[class*=\"language-\"]": {
        "color": "#d4d4d4",
        "fontSize": `${fontSize}`,
        "textShadow": "none",
        "fontFamily": "Menlo, Monaco, Consolas, \"Andale Mono\", \"Ubuntu Mono\", \"Courier New\", monospace",
        "direction": "ltr",
        "textAlign": "left",
        "whiteSpace": "pre", //jpi comment for word wrap testing
        //"whiteSpace": "pre-wrap", // jpi don't think i need this for word wrap but crest does it for some reason.
        //"wordWrap": "break-word", //jpi forces word wrap!!!! yes!!
        "wordWrap": "inherit",
        "wordSpacing": "normal",
        "wordBreak": "normal",
        "lineHeight": "1.5",
        "MozTabSize": "4",
        "OTabSize": "4",
        "tabSize": "4",
        "WebkitHyphens": "none",
        "MozHyphens": "none",
        "msHyphens": "none",
        "hyphens": "none"
    },
    "pre[class*=\"language-\"]::selection": {
        "textShadow": "none",
        "background": "#264F78"
    },
    "code[class*=\"language-\"]::selection": {
        "textShadow": "none",
        "background": "#264F78"
    },
    "pre[class*=\"language-\"] *::selection": {
        "textShadow": "none",
        "background": "#264F78"
    },
    "code[class*=\"language-\"] *::selection": {
        "textShadow": "none",
        "background": "#264F78"
    },
    ":not(pre) > code[class*=\"language-\"]": {
        "padding": ".1em .3em",
        "borderRadius": ".3em",
        "color": "#db4c69",
        "background": "#1e1e1e"
    },
    ".namespace": {
        "opacity": ".7"
    },
    "doctype.doctype-tag": {
        "color": "#569CD6"
    },
    "doctype.name": {
        "color": "#9cdcfe"
    },
    "comment": {
        "color": "#616161" //JPI for line numbers orig: "#6a9955"
    },
    "prolog": {
        "color": "#6a9955"
    },
    "punctuation": {
        "color": "#d4d4d4"
    },
    ".language-html .language-css .token.punctuation": {
        "color": "#d4d4d4"
    },
    ".language-html .language-javascript .token.punctuation": {
        "color": "#d4d4d4"
    },
    "property": {
        "color": "#9cdcfe"
    },
    "tag": {
        "color": "#569cd6"
    },
    "boolean": {
        "color": "#569cd6"
    },
    "number": {
        "color": "#b5cea8"
    },
    "constant": {
        "color": "#9cdcfe"
    },
    "symbol": {
        "color": "#b5cea8"
    },
    "inserted": {
        "color": "#b5cea8"
    },
    "unit": {
        "color": "#b5cea8"
    },
    "selector": {
        "color": "#d7ba7d"
    },
    "attr-name": {
        "color": "#9cdcfe"
    },
    "string": {
        "color": "#ce9178"
    },
    "char": {
        "color": "#ce9178"
    },
    "builtin": {
        "color": "#ce9178"
    },
    "deleted": {
        "color": "#ce9178"
    },
    ".language-css .token.string.url": {
        "textDecoration": "underline"
    },
    "operator": {
        "color": "#d4d4d4"
    },
    "entity": {
        "color": "#569cd6"
    },
    "operator.arrow": {
        "color": "#569CD6"
    },
    "atrule": {
        "color": "#ce9178"
    },
    "atrule.rule": {
        "color": "#c586c0"
    },
    "atrule.url": {
        "color": "#9cdcfe"
    },
    "atrule.url.function": {
        "color": "#dcdcaa"
    },
    "atrule.url.punctuation": {
        "color": "#d4d4d4"
    },
    "keyword": {
        "color": "#569CD6"
    },
    "keyword.module": {
        "color": "#c586c0"
    },
    "keyword.control-flow": {
        "color": "#c586c0"
    },
    "function": {
        "color": "#dcdcaa"
    },
    "function.maybe-class-name": {
        "color": "#dcdcaa"
    },
    "regex": {
        "color": "#d16969"
    },
    "important": {
        "color": "#569cd6"
    },
    "italic": {
        "fontStyle": "italic"
    },
    "class-name": {
        "color": "#4ec9b0"
    },
    "maybe-class-name": {
        "color": "#4ec9b0"
    },
    "console": {
        "color": "#9cdcfe"
    },
    "parameter": {
        "color": "#9cdcfe"
    },
    "interpolation": {
        "color": "#9cdcfe"
    },
    "punctuation.interpolation-punctuation": {
        "color": "#569cd6"
    },
    "variable": {
        "color": "#9cdcfe"
    },
    "imports.maybe-class-name": {
        "color": "#9cdcfe"
    },
    "exports.maybe-class-name": {
        "color": "#9cdcfe"
    },
    "escape": {
        "color": "#d7ba7d"
    },
    "tag.punctuation": {
        "color": "#808080"
    },
    "cdata": {
        "color": "#808080"
    },
    "attr-value": {
        "color": "#ce9178"
    },
    "attr-value.punctuation": {
        "color": "#ce9178"
    },
    "attr-value.punctuation.attr-equals": {
        "color": "#d4d4d4"
    },
    "namespace": {
        "color": "#4ec9b0"
    },
    "pre[class*=\"language-javascript\"]": {
        "color": "#9cdcfe"
    },
    "code[class*=\"language-javascript\"]": {
        "color": "#9cdcfe"
    },
    "pre[class*=\"language-jsx\"]": {
        "color": "#9cdcfe"
    },
    "code[class*=\"language-jsx\"]": {
        "color": "#9cdcfe"
    },
    "pre[class*=\"language-typescript\"]": {
        "color": "#9cdcfe"
    },
    "code[class*=\"language-typescript\"]": {
        "color": "#9cdcfe"
    },
    "pre[class*=\"language-tsx\"]": {
        "color": "#9cdcfe"
    },
    "code[class*=\"language-tsx\"]": {
        "color": "#9cdcfe"
    },
    "pre[class*=\"language-css\"]": {
        "color": "#ce9178"
    },
    "code[class*=\"language-css\"]": {
        "color": "#ce9178"
    },
    "pre[class*=\"language-html\"]": {
        "color": "#d4d4d4"
    },
    "code[class*=\"language-html\"]": {
        "color": "#d4d4d4"
    },
    ".language-regex .token.anchor": {
        "color": "#dcdcaa"
    },
    ".language-html .token.punctuation": {
        "color": "#808080"
    },
    "pre[class*=\"language-\"] > code[class*=\"language-\"]": {
        "position": "relative",
        "zIndex": "1"
    },
    ".line-highlight.line-highlight": {
        "background": "#f7ebc6",
        "boxShadow": "inset 5px 0 0 #f7d87c",
        "zIndex": "0"
    }
}

/**
 * I pulled this css from <SyntaxHighlighter> code so i can customize. Maybe better
 * way to go about this, but the <SyntaxHighlighter> comp doesn't seem to have a 
 * simpler way. I basicallly lift/shifted from the <SyntaxHighlighter> comp code...
 * 
 * It's declared/exported from here (search for material-dark):
 * 
 * node_modules/@types/react-syntax-highlighter/index.d.ts
 * 
 * And the actual exported style can be found here: 
 * 
 * node_modules/react-syntax-highlighter/dist/esm/styles/prism/material-dark.js
 * 
 * Search for "JPI" below for all tweaks i made from the <SyntaxHighlighter> version.
 * 
 * NOTE: On the fly/update styles maybe here: 
 * https://stackoverflow.com/questions/53024769/how-can-i-create-new-global-css-classes-on-the-fly-in-react
 */
export const darkMode: { [key: string]: React.CSSProperties } = {
  "code[class*=\"language-\"]": {
    "textAlign": "left",
    "whiteSpace": "pre",
    "wordSpacing": "normal",
    "wordBreak": "normal",
    "wordWrap": "normal",
    "color": "#eee",
    //JPI
    "background": `${background}`,
    "fontFamily": "Roboto Mono, monospace",
    //JPI
    "fontSize": `${fontSize}`,
    "lineHeight": "1.5em",
    "MozTabSize": "4",
    "OTabSize": "4",
    "tabSize": "4",
    "WebkitHyphens": "none",
    "MozHyphens": "none",
    "msHyphens": "none",
    "hyphens": "none"
  },
  "pre[class*=\"language-\"]": {
    "textAlign": "left",
    "whiteSpace": "pre",
    "wordSpacing": "normal",
    "wordBreak": "normal",
    "wordWrap": "normal",
    "color": "#eee",
    //JPI 
    "background": `${background}`,
    "fontFamily": "Roboto Mono, monospace",
    //JPI
    "fontSize": `${fontSize}`,
    "lineHeight": "1.5em",
    "MozTabSize": "4",
    "OTabSize": "4",
    "tabSize": "4",
    "WebkitHyphens": "none",
    "MozHyphens": "none",
    "msHyphens": "none",
    "hyphens": "none",
    "overflow": "auto",
    "position": "relative",
    "margin": "0.5em 0",
    "padding": "1.25em 1em"
  },
  "code[class*=\"language-\"]::-moz-selection": {
    "background": "#363636"
  },
  "pre[class*=\"language-\"]::-moz-selection": {
    "background": "#363636"
  },
  "code[class*=\"language-\"] ::-moz-selection": {
    "background": "#363636"
  },
  "pre[class*=\"language-\"] ::-moz-selection": {
    "background": "#363636"
  },
  "code[class*=\"language-\"]::selection": {
    "background": "#363636"
  },
  "pre[class*=\"language-\"]::selection": {
    "background": "#363636"
  },
  "code[class*=\"language-\"] ::selection": {
    "background": "#363636"
  },
  "pre[class*=\"language-\"] ::selection": {
    "background": "#363636"
  },
  ":not(pre) > code[class*=\"language-\"]": {
    "whiteSpace": "normal",
    "borderRadius": "0.2em",
    "padding": "0.1em"
  },
  ".language-css > code": {
    "color": "#fd9170"
  },
  ".language-sass > code": {
    "color": "#fd9170"
  },
  ".language-scss > code": {
    "color": "#fd9170"
  },
  "[class*=\"language-\"] .namespace": {
    //JPI had to chanage from Opacity to opacity
    "opacity": "0.7"
  },
  "atrule": {
    "color": "#c792ea"
  },
  "attr-name": {
    "color": "#ffcb6b"
  },
  "attr-value": {
    "color": "#a5e844"
  },
  "attribute": {
    "color": "#a5e844"
  },
  "boolean": {
    "color": "#c792ea"
  },
  "builtin": {
    "color": "#ffcb6b"
  },
  "cdata": {
    "color": "#80cbc4"
  },
  "char": {
    "color": "#80cbc4"
  },
  "class": {
    "color": "#ffcb6b"
  },
  "class-name": {
    "color": "#f2ff00"
  },
  "comment": {
    "color": "#616161"
  },
  "constant": {
    "color": "#c792ea"
  },
  "deleted": {
    "color": "#ff6666"
  },
  "doctype": {
    "color": "#616161"
  },
  "entity": {
    "color": "#ff6666"
  },
  "function": {
    "color": "#c792ea"
  },
  "hexcode": {
    "color": "#f2ff00"
  },
  "id": {
    "color": "#c792ea",
    "fontWeight": "bold"
  },
  "important": {
    "color": "#c792ea",
    "fontWeight": "bold"
  },
  "inserted": {
    "color": "#80cbc4"
  },
  "keyword": {
    "color": "#c792ea"
  },
  "number": {
    "color": "#fd9170"
  },
  "operator": {
    "color": "#89ddff"
  },
  "prolog": {
    "color": "#616161"
  },
  "property": {
    "color": "#80cbc4"
  },
  "pseudo-class": {
    "color": "#a5e844"
  },
  "pseudo-element": {
    "color": "#a5e844"
  },
  "punctuation": {
    "color": "#89ddff"
  },
  "regex": {
    "color": "#f2ff00"
  },
  "selector": {
    "color": "#ff6666"
  },
  "string": {
    "color": "#a5e844"
  },
  "symbol": {
    "color": "#c792ea"
  },
  "tag": {
    "color": "#ff6666"
  },
  "unit": {
    "color": "#fd9170"
  },
  "url": {
    "color": "#ff6666"
  },
  "variable": {
    "color": "#ff6666"
  }
};
