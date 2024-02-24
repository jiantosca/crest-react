import { css } from 'lit-element';
// This is from CREST code...

/**
 * A nagging problem with cREST has been performance issue after you submit a lot of requests. Basically,
 * responses were getting slower and slower to render and I finally figured out that it was because
 * of how i used css... each component was defining their own styles which is usually what you want for
 * web components, but in my case in cREST you can have hundreds of responses all with same css, and even
 * if you delete the responses in the UI, chrome was still spending time parsing through css that had
 * been loaded for delted components. Solution is to use lit-element css tag function, and then in the 
 * web components we can reference them via static get styles() that returns an array of css kept in 
 * files like this css.js file. So far performance issue seems to have gone away!! 
 * 
 * https://stackoverflow.com/questions/57706814/lit-element-how-do-i-set-global-reset-css/57722337#57722337
 * https://lit-element.polymer-project.org/guide/styles#inheritance
 * 
 * TODD I really need to clean up CSS throughout the app!! Components that don'e get created over and
 * over (like responses) are find to define their own <style>, but I should really handle everything
 * in a consistent way, and what's I'm doing here for responses is most efficient. 
 * 
 * Would like to support dark mode but have taken a lot of css short cuts while trying to get components to
 * work (like inlining css in html, using <style> in comps, and spreading css files around like this one here).
 * Once I clean up and centralize all CSS, then I can think about refactoring for style changes like dark mode
 * or whatever.
 * 
 * For some reason PaperInputStyle (from paper-input-utils.js) doesn't fully work using css` .
 * 
 * 
 */
export const HostVars_NotNeededIGuess = css`
    :host {
        --content-box-bg-color: #fff;
        --selectable-item-hover-bg-color: #d4d4d4;
        --crest-dark-blue: #276da1;
        --crest-light-blue: #eaf3fa;
        --crest-highlight-green: #690;
        --crest-highlight-blue: #00C3FF;
        --crest-common-font-size: 15px;
        /* --selectable-item-hover-bg-color: black; */
    }
`;

export const CRestAppStyle = css`

    /* XXcan also do [tabindex="1"] for specific index 
    now it seems i don't need this, i had tabindex="1" on the crest-autosuggest
    and below css and the blue box went away, and now that i remove here it isn't
    coming back so I dunno.*/
    [tabindex] {
        outline: none;
    }

    .hidden {
        display: none;
    }

    div.ui-header {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 2px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);

        padding: 0px 16px 16px 16px;
        margin: 0px 24px 24px 24px;
        border-radius: 0px 0px 5px 5px;
        background-color: #fff;
        /* position: -webkit-sticky;
        position: sticky;
        top: 0px; */
    }
    /*flex layout for request stuff*/
    .req-row1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    /* The flex property is a shorthand property for the flex-grow, flex-shrink, and flex-basis properties. */
    .req-row1-col1 {
    /* method drop down */
        flex:0 0 auto; /* Forces side columns to stay same width */
        align-self: flex-end;
    }
    .req-row1-col2 {
        /* url */
        flex:1 1 auto; /* Lets middle column shrink/grow to available width */
        max-width: 100%;
        padding-left: 10px;
        align-self: flex-end;
    }
    .req-row1-col3 {
        /* send button */
        flex:0 0 auto; /* Forces side columns to stay same width */
    }
    .req-row1-col4 {
        /* burger menu */
        flex:0 0 auto; /* Forces side columns to stay same width */
    }
    .method-drop-down-width {
        width: 90px;
    }
    div#body {
        display: none;
    }
`;

export const PrismLineNumbers = css`
    pre[class*="language-"].line-numbers {
        position: relative;
        padding-left: 3.8em;
        counter-reset: linenumber;
    }

    pre[class*="language-"].line-numbers > code {
        position: relative;
        white-space: inherit;
    }

    .line-numbers .line-numbers-rows {
        position: absolute;
        pointer-events: none;
        top: 0;
        font-size: 100%;
        left: -3.8em;
        width: 3em; /* works for line-numbers below 1000 lines */
        letter-spacing: -1px;
        border-right: 1px solid #999;

        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

    }

    .line-numbers-rows > span {
      pointer-events: none;
      display: block;
      counter-increment: linenumber;
    }

      .line-numbers-rows > span:before {
        content: counter(linenumber);
        color: #999;
        display: block;
        padding-right: 0.8em;
        text-align: right;
      }
`;

/**
 * 
 * I just copy/pasted this from css from below. Don't change
 * this one.. keep defaults here and changes in specific
 * elements that import this.
 *
 *prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */
export const PrismDefaultTheme = css`
    code[class*="language-"],
    pre[class*="language-"] {
        color: black;
        background: none;
        text-shadow: 0 1px white;
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;

        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
    }

    pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
    code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
    code[class*="language-"]::selection, code[class*="language-"] ::selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    @media print {
        code[class*="language-"],
        pre[class*="language-"] {
            text-shadow: none;
        }
    }

    /* Code blocks */
    pre[class*="language-"] {
        padding: 1em;
        margin: .5em 0;
        overflow: auto;
    }

    :not(pre) > code[class*="language-"],
    pre[class*="language-"] {
        background: #f5f2f0;
    }

    /* Inline code */
    :not(pre) > code[class*="language-"] {
        padding: .1em;
        border-radius: .3em;
        white-space: normal;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
        color: slategray;
    }

    .token.punctuation {
        color: #999;
    }

    .namespace {
        opacity: .7;
    }

    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol,
    .token.deleted {
        color: #905;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
        color: #690;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
        color: #9a6e3a;
        background: hsla(0, 0%, 100%, .5);
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
        color: #07a;
    }

    .token.function,
    .token.class-name {
        color: #DD4A68;
    }

    .token.regex,
    .token.important,
    .token.variable {
        color: #e90;
    }

    .token.important,
    .token.bold {
        font-weight: bold;
    }
    .token.italic {
        font-style: italic;
    }

    .token.entity {
        cursor: help;
    }


    /** override prism stuff here: **/
    /* keeps code area same background as div containing it (#fff) */
    :not(pre) > code[class*="language-"],
    pre[class*="language-"] {
        background: var(--content-box-bg-color);
    }
`;


export const ResponseStyles = css`
    
    
    div#content {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
        padding: 16px;
        margin: 24px;
        border-radius: 5px;
        background-color: var(--content-box-bg-color);
    }
    div.resp-bar {
        /* background-color: var(--content-box-bg-color); */
        width: 100%;
        /* display: flex; */
        /* border: 1px solid green; */
    }
    div.resp-bar div {
        vertical-align: top;
        white-space: nowrap;
        z-index: 1020; /* for paper-menu-button (floating actions is 1010*/
    }
    div.resp-bar div.url {
        overflow: hidden;
        text-overflow: ellipsis;
    }
    div.resp-bar div.buttons {
        float:right;
        margin-top: -5px;
        /* margin-right: -5px; */
        position: sticky;
        position: -webkit-sticky;
        top: 0px;
    }
    
    span.ok {
        background-color: #8ebb37;
    }
    span.notok {
        background-color: #ff4d4d;
    }
    span.status {
        /* background-color: var(--crest-highlight-green); */
        padding: 1px;
        border-radius: 3px;
        display: inline-block;
        /* font-weight: bold; */
        /* filter: brightness(125%); */
    }
    
    /* match div with id ending in "entity" */
    div[id$="entity"] {
    /*div#resp-entity {*/
        position:relative;
        /* font-size: 80.27%; */
        font-size: calc(var(--crest-common-font-size) - 2px);
        /* line-height: 1.2;             */
    }
    button#copy {
        position: absolute;
        /* position: relateive; */
        top: 5px;
        right: 0px;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
        background: #e0e0e0;
        outline: none;
        z-index: 1000;
    }

    .fade-visible {
        visibility: visible;
        opacity: 1;
        transition: opacity .3s linear;
    }

    .fade-hidden {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s .5s, opacity .5s linear;
    }
    .debugBorder {
        border: 1px solid black;
    }

    /* color: var(--crest-dark-blue); margin-left: 3px; */
    paper-icon-button {
        width: 30px;
        height: 30px; 
        margin: 0px;
        padding: 3px;
    }
    
    paper-icon-button:hover {
        color: var(--crest-highlight-green);
        /* border-radius: 50%; */
        /* border: 1px solid var(--crest-highlight-green); */
    }

    paper-icon-button.hover-red:hover {
        color: #e60000;
    }

    paper-icon-button.share, iron-icon.share {
        /*flip horizontal*/
        transform: scaleX(-1);
    }
    paper-icon-button.reload, iron-icon.reload {
        /*flip horizontal*/
        transform: rotate(90deg);
    }        
    paper-menu-button div paper-item {
        padding-left: 10px;
    }

    paper-dropdown-menu-light paper-item:hover,
    paper-menu-button paper-item:hover {
        background-color: var(--selectable-item-hover-bg-color);
        cursor: pointer;
    }
`;

export const AutoSuggestStyle = css`
    * {
        box-sizing: border-box;
    }

    /*body {
        font: 16px Arial;  
    }*/

    /*the container must be positioned relative:*/
    .autocomplete {
        position: relative;
        display: inline-block;
        /* width:100%; */
    }
    .autocomplete-items {
        position: absolute;
        border: 1px solid #d4d4d4;
        
        /* need this font-size so bundle editor doesn't default to 14px from paper-dialogs */
        font-size: var(--crest-common-font-size);
        border-bottom: none;
        border-top: none;
        z-index: 99;
        /*position the autocomplete items to be the same width as the container:*/
        top: 100%;
        /* font-size: var(--crest-common-font-size); */
        /*this neg value aligns the auto suggest with bottom of paper input better*/
        margin-top: -8px;
        left: 0;
        right: 0;
    }

    .autocomplete-items div {
        padding: 10px;
        cursor: pointer;
        background-color: #fff; 
        border-bottom: 1px solid #d4d4d4; 
    }

    /*when hovering an item:
    .autocomplete-items div:hover {
        background-color: #e9e9e9; 
    }*/

    /*when navigating through the items using the arrow keys:*/
    .autocomplete-active {
        /* background-color: #00C3FF !important;  */
        background-color: var(--selectable-item-hover-bg-color) !important; 
        /* color: #ffffff;  */
    }
`;
