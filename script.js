document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const buttons = document.querySelectorAll("#toolbar button");
  const copyBtn = document.getElementById("copy");
  const pasteBtn = document.getElementById("paste");
  const suggestionsDiv = document.getElementById("suggestions");

  // ----- スニペット読み込み -----
  let snippets = {};
  (async () => {
    try {
      const res = await fetch("snippets.json");
      if (res.ok) {
        snippets = await res.json();
      }
    } catch {
      // 読み込み失敗でも無視
      snippets = {};
    }
  })();

  // ----- ボタン入力 -----
  buttons.forEach(btn => {
    if (btn.id === "copy" || btn.id === "paste") return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = btn.textContent;

      if (btn.id === "left") {
        editor.setSelectionRange(Math.max(0, start - 1), Math.max(0, start - 1));
      } else if (btn.id === "right") {
        editor.setSelectionRange(start + 1, start + 1);
      } else {
        editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
        editor.setSelectionRange(start + text.length, start + text.length);
      }
      editor.focus();
    });
  });

  // ----- Enterでスニペット挿入 -----
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const lines = editor.value.slice(0, start).split("\n");
      const currentLine = lines[lines.length - 1].trim();

      if (snippets[currentLine]) {
        e.preventDefault();
        const before = editor.value.slice(0, start - currentLine.length);
        const after = editor.value.slice(end);

        const snippetText = snippets[currentLine].body || snippets[currentLine];
        const cursorPos = snippetText.indexOf("/*カーソル*/");

        editor.value = before + snippetText.replace("/*カーソル*/", "") + after;
        editor.setSelectionRange(before.length + (cursorPos >= 0 ? cursorPos : 0),
                                 before.length + (cursorPos >= 0 ? cursorPos : 0));
        return;
      }

      // 通常の改行
      e.preventDefault();
      editor.value = editor.value.slice(0, start) + "\n" + editor.value.slice(end);
      editor.setSelectionRange(start + 1, start + 1);
    }
  });

  // ----- 候補表示（スマホ対応）-----
  editor.addEventListener("input", () => {
    const word = getCurrentWord();
    const matches = Object.keys(snippets).filter(k => k.startsWith(word));

    if (!word || matches.length === 0) {
      suggestionsDiv.style.display = "none";
      return;
    }

    suggestionsDiv.innerHTML = "";
    matches.forEach(k => {
      const div = document.createElement("div");
      div.textContent = k;
      div.addEventListener("click", () => insertSnippet(k));
      suggestionsDiv.appendChild(div);
    });

    // editor 上に表示
    const rect = editor.getBoundingClientRect();
    suggestionsDiv.style.top = `${rect.top - matches.length * 40}px`; // 上に表示
    suggestionsDiv.style.left = `${rect.left}px`;
    suggestionsDiv.style.display = "block";
  });

  function getCurrentWord() {
    const start = editor.selectionStart;
    const value = editor.value.slice(0, start);
    const match = value.match(/(\S+)$/);
    return match ? match[0] : "";
  }

  function insertSnippet(key) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const word = getCurrentWord();
    const before = editor.value.slice(0, start - word.length);
    const after = editor.value.slice(end);

    const snippetText = snippets[key].body || snippets[key];
    const cursorPos = snippetText.indexOf("/*カーソル*/");

    editor.value = before + snippetText.replace("/*カーソル*/", "") + after;
    editor.setSelectionRange(before.length + (cursorPos >= 0 ? cursorPos : 0),
                             before.length + (cursorPos >= 0 ? cursorPos : 0));
    editor.focus();
    suggestionsDiv.style.display = "none";
  }

  // ----- コピー -----
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editor.select();
    try {
      const success = document.execCommand("copy");
      if (success) showMessage("コードをコピーしました！");
    } catch {
      alert("コピーに失敗しました");
    }
  });

  // ----- ペースト -----
  pasteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + text + editor.value.slice(end);
      editor.setSelectionRange(start + text.length, start + text.length);
      editor.focus();
      showMessage("コードをペーストしました！");
    } catch {
      alert("ペーストに失敗しました。\nHTTPS環境か確認してください。");
    }
  });

  // ----- メッセージ表示 -----
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
