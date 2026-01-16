document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const buttons = document.querySelectorAll("#toolbar button");
  const toolbar = document.getElementById("toolbar");

  // ----- ボタン入力機能 -----
  buttons.forEach(btn => {
    // コピー・ペーストは別で処理
    if (btn.id === "copy" || btn.id === "paste") return;

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
    try {
      const success = document.execCommand("copy");
      if (success) {
        showMessage("コードをコピーしました！");
      } else {
        alert("コピーに失敗しました");
      }
    } catch (err) {
      alert("コピーに失敗しました");
    }
  });

  // ----- ペースト機能 -----
  const pasteBtn = document.getElementById("paste");
  pasteBtn.addEventListener("click", async () => {
    try {
      // navigator.clipboardを使う（HTTPSまたはlocalhostで動作）
      const text = await navigator.clipboard.readText();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value =
        editor.value.slice(0, start) +
        text +
        editor.value.slice(end);
      editor.setSelectionRange(start + text.length, start + text.length);
      editor.focus();
      showMessage("コードをペーストしました！");
    } catch (err) {
      alert("ペーストに失敗しました");
    }
  });

  // ----- メッセージ表示補助 -----
  function showMessage(msgText) {
    const msg = document.createElement("div");
    msg.textContent = msgText;
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
  }
});
