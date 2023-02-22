import React from "react";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CodeHighlightPlugin } from "~/plugins/CodeHighlightPlugin/CodeHighlightPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { FloatingLinkEditorPlugin } from "~/plugins/FloatingLinkEditorPlugin/FloatingLinkEditorPlugin";
import { ClickableLinkPlugin } from "~/plugins/ClickableLinkPlugin/ClickableLinkPlugin";
import { ParagraphToolbar } from "~/components/Toolbar/ParagraphToolbar";
import { RichTextEditor } from "~/components/Editor/RichTextEditor";
import { LexicalValue } from "~/types";

interface ParagraphLexicalEditorProps {
    value: LexicalValue;
    onChange?: (value: LexicalValue) => void;
    tag?: "p";
    placeholder?: string;
    onBlur?: (value: LexicalValue) => void;
}

const ParagraphEditor: React.FC<ParagraphLexicalEditorProps> = ({ placeholder, tag, ...rest }) => {
    return (
        <RichTextEditor
            toolbar={<ParagraphToolbar />}
            tag={tag ?? "p"}
            placeholder={placeholder ?? "Enter your text here..."}
            {...rest}
        >
            <LinkPlugin />
            <CodeHighlightPlugin />
            <ClickableLinkPlugin />
            <FloatingLinkEditorPlugin anchorElem={document.body} />
            <ListPlugin />
        </RichTextEditor>
    );
};

export { ParagraphEditor };
