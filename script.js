<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Kansu Code</title>
  <!-- iPhoneで最初から小さめ表示、拡大禁止 -->
  <meta name="viewport" content="width=device-width, initial-scale=0.7, user-scalable=no">
  <style>
    body {
      margin: 10px;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      height: 100vh;       
      overflow: hidden;     
    }

    /* エディタ */
    #editor {
      width: 100%;          
      height: 160px;       
      font-size: 16px;     
      padding: 8px;
      box-sizing: border-box;
      margin-bottom: 8px;  
    }

    /* toolbar */
    #toolbar {
      position: absolute;  
      top: 170px;          
      left: 0;             
      right: 0;            
      display: flex;
      flex-wrap: wrap;      
      justify-content: flex-start;
      background: #f9f9f9;
      border: 1px solid #ccc;
      z-index: 1000;
      padding: 4px;        
    }

    #toolbar button {
      font-size: 16px;      
      padding: 9px 13px;    
      margin: 2px;
      flex: none;           
    }

    /* コピー用ボタンを少し目立たせる */
    #toolbar button#copy {
      background-color: #d0f0ff;
    }
  </style>
</head>
<body>

<textarea id="editor"></textarea>

<div id="toolbar">
  <button>()</button>
  <button>{}</button>
  <button>[]</button>
  <button>+</button>
  <button>-</button>
  <button>*</button>
  <button>/</button>
  <button>&lt;</button>
  <button>&gt;</button>
  <button>=</button>
  <button id="left">←</button>
  <button id="right">→</button>
  <button id="copy">コピー</button>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const buttons = document.querySelectorAll("#toolbar button");
  const toolbar = document.getElementById("toolbar");

  // ----- ボタン入力機能 -----
  buttons.forEach(btn => {
    if (btn.id === "copy") return; // コピーは除外

    btn.addEventListener("click", () => {
      const text = btn.textContent;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      // カーソル移動ボタン
      if (btn.id === "left") {
        editor.setSelectionRange(Math.max(0, start - 1), Math.max(0, start - 1));
        editor.focus();
        return;
      }

      if (btn.id === "right") {
        editor.setSelectionRange(start + 1, start + 1);
        editor.focus();
        return;
      }

      // 文字挿入
      editor.value =
        editor.value.slice(0, start) +
        text +
        editor.value.slice(end);

      editor.setSelectionRange(start + text.length, start + text.length);
      editor.focus();
    });
  });

  // ----- Enter + スニペット + 自動インデント -----
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const lines = editor.value.slice(0, start).split("\n");
      const currentLine = lines[lines.length - 1].trim();

      // スニペット辞書
      const snippets = {
        "for": "for (int i = 0; i < n; i++) {\n    /*カーソル*/\n}",
        "if": "if (condition) {\n    /*カーソル*/\n}"
      };

      if (snippets[currentLine]) {
        e.preventDefault();
        const before = editor.value.slice(0, start - currentLine.length);
        const after = editor.value.slice(end);

        const snippetText = snippets[currentLine];
        const cursorPos = snippetText.indexOf("/*カーソル*/");

        editor.value = before + snippetText.replace("/*カーソル*/", "") + after;
        editor.setSelectionRange(
          before.length + cursorPos,
          before.length + cursorPos
        );
        return;
      }

      // 通常のインデント（スペース4個）
      e.preventDefault();
      const indent = "    ";
      editor.value =
        editor.value.slice(0, start) + "\n" + indent + editor.value.slice(end);
      editor.setSelectionRange(
        start + 1 + indent.length,
        start + 1 + indent.length
      );
    }
  });

  // ----- コピー機能 -----
  const copyBtn = document.getElementById("copy");
  copyBtn.addEventListener("click", () => {
    editor.select();
    navigator.clipboard.writeText(editor.value)
      .then(() => {
        const msg = document.createElement("div");
        msg.textContent = "コードをコピーしました！";
        msg.style.position = "fixed";
        msg.style.top = "20px";
        msg.style.left = "50%";
        msg.style.transform = "translateX(-50%)";
        msg.style.background = "#d0f0ff";
        msg.style.padding = "6px 12px";
        msg.style.border = "1px solid #ccc";
        msg.style.borderRadius = "4px";
        msg.style.zIndex = 2000;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 1200);
      })
      .catch(() => alert("コピーに失敗しました"));
  });

});
</script>

</body>
</html>
