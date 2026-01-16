document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const buttons = document.querySelectorAll("#toolbar button");
  const toolbar = document.getElementById("toolbar");

  // ----- ボタン入力機能 -----
  buttons.forEach(btn => {
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

  // ----- スニペット定義 -----
  const snippets = {
    "for": "for (int i = 0; i < n; i++) {\n    |\n}",
    "if": "if (condition) {\n    |\n}"
  };

  // ----- Enter + スニペット + 自動インデント -----
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      const lines = editor.value.slice(0, start).split("\n");
      const currentLine = lines[lines.length - 1].trim();

      // スニペット判定
      if (snippets[currentLine]) {
        e.preventDefault();
        const before = editor.value.slice(0, start - currentLine.length);
        const after = editor.value.slice(end);

        const snippetText = snippets[currentLine];
        const cursorPos = snippetText.indexOf("|");
        const finalText = snippetText.replace("|", "");

        editor.value = before + finalText + after;

        // カーソル位置をマーカー位置に
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

  // ----- iPhone向け: toolbar をエディタ下に固定 -----
  const updateToolbarPosition = () => {
    const editorRect = editor.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    toolbar.style.position = "absolute";
    toolbar.style.top = (editorRect.bottom + scrollY + 5) + "px"; 
    toolbar.style.left = editorRect.left + "px";
  };

  // 初期位置
  updateToolbarPosition();

  // フォーカス時・blur時に toolbar の位置を再計算
  editor.addEventListener("focus", updateToolbarPosition);
  editor.addEventListener("blur", updateToolbarPosition);

  // 画面サイズ変更時も toolbar を再配置
  window.addEventListener("resize", updateToolbarPosition);
  window.addEventListener("scroll", updateToolbarPosition);
});
