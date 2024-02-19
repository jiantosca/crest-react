import { HttpExchangeContext } from "../support/RestClientUtils"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const HttpFormatter = ({headersAndBody}: {headersAndBody: string}) => {
    return (
        <SyntaxHighlighter language='http' style={solarizedlight} showLineNumbers>
            {/* https://www.dhiwise.com/post/crafting-beautiful-code-blocks-with-react-syntax-highlighter */}
            {headersAndBody}
        </SyntaxHighlighter>
    )
}