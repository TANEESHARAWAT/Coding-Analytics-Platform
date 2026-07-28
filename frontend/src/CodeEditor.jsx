import EditorImport from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";

const Editor = EditorImport.default || EditorImport;

function CodeEditor({ code, setCode, language }) {
  const grammar = language === "python" ? languages.python : languages.cpp;
  const grammarName = language === "python" ? "python" : "cpp";

  return (
    <div className="code-editor-wrap">
      <Editor
        value={code}
        onValueChange={(c) => setCode(c)}
        highlight={(c) => highlight(c, grammar, grammarName)}
        padding={16}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          minHeight: 220,
        }}
        placeholder="// paste your solution here"
      />
    </div>
  );
}

export default CodeEditor;