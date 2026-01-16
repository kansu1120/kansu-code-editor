document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const buttons = document.querySelectorAll("#toolbar button");
  const copyBtn = document.getElementById("copy");
  const pasteBtn = document.getElementById("paste");
  const suggestionsDiv = document.getElementById("suggestions");

  // ----- スニペット定義 -----
  const snippets = {
  "c": "cout << /*カーソル*/ << endl;",
  "vi": "vector<int>/*カーソル*/",
  "vs": "vector<string>/*カーソル*/",
  "vc": "vector<char>/*カーソル*/",
  "vvi": "vector<vector<int>>/*カーソル*/",
  "vvs": "vector<vector<string>>/*カーソル*/",
  "vvc": "vector<vector<char>>/*カーソル*/",
  "tmp": "#include <bits/stdc++.h>\n#include <atcoder/all>\nusing namespace atcoder;\nusing namespace std;\nusing ll = long long;\n#define rep(i , n) for(int i=0; i< (int)(n); i++)\n#define int long long\nconst ll INF = 1e18;\nconst int inf = 1e9;\nconst int mod = 998244353;\nconst int MOD = 1000000007;\ntemplate<class T>\nvoid chmin(T& a, T b){ if(a > b) a = b; }\ntemplate<class T>\nvoid chmax(T& a, T b){ if(a < b) a = b; }\nvoid yes(){cout << \"Yes\" << endl;}\nvoid no(){cout << \"No\" << endl;}\nusing mint = modint998244353;\nint32_t main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    /*カーソル*/\n}",
  "f": "first/*カーソル*/",
  "se": "second/*カーソル*/",
  "cy": "cout << \"Yes\" << endl;/*カーソル*/",
  "cn": "cout << \"No\" << endl;/*カーソル*/",
  "pi": "pair<int,int>/*カーソル*/",
  "pl": "pair<ll,ll>/*カーソル*/",
  "vp": "vector<pair<int,int>>/*カーソル*/",
  "vpl": "vector<pair<ll,ll>>/*カーソル*/",
  "ce": "cout << endl;/*カーソル*/",
  "pb": "push_back(/*カーソル*/);",
  "iin": "int n; cin >> n;/*カーソル*/",
  "li": "ll /*カーソル*/; cin >> /*カーソル*/;",
  "im": "int m; cin >> m;/*カーソル*/",
  "vl": "vector<ll>/*カーソル*/",
  "t": "#include <bits/stdc++.h>\nusing namespace std;\nusing ll = long long;\n#define rep(i , n) for(int i=0; i< (int)(n); i++)\nconst ll INF = 1e18;\nconst int inf = 1e9;\nint main(){\n    /*カーソル*/\n}",
  "nm": "int n,m; cin >> n >> m;/*カーソル*/",
  "hw": "int h,w; cin >> h >> w;/*カーソル*/",
  "iq": "int q; cin >> q;/*カーソル*/",
  "vb": "vector<bool>/*カーソル*/"
  };

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

        const snippetText = snippets[currentLine];
        const cursorPos = snippetText.indexOf("/*カーソル*/");

        editor.value = before + snippetText.replace("/*カーソル*/", "") + after;
        editor.setSelectionRange(before.length + cursorPos, before.length + cursorPos);
        return;
      }

      // 通常の改行
      e.preventDefault();
      editor.value = editor.value.slice(0, start) + "\n" + editor.value.slice(end);
      editor.setSelectionRange(start + 1, start + 1);
    }
  });

  // ----- 候補表示 -----
  editor.addEventListener("keyup", () => {
    const word = getCurrentWord();
    const matches = Object.keys(snippets).filter(k => k.startsWith(word));
    if (matches.length === 0 || word === "") {
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

    updateSuggestionsPosition();
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

    const snippetText = snippets[key];
    const cursorPos = snippetText.indexOf("/*カーソル*/");

    editor.value = before + snippetText.replace("/*カーソル*/", "") + after;
    editor.setSelectionRange(before.length + cursorPos, before.length + cursorPos);
    editor.focus();
    suggestionsDiv.style.display = "none";
  }

  // ----- 候補位置調整 -----
  function updateSuggestionsPosition() {
    const toolbar = document.getElementById("toolbar");
    const rect = toolbar.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    let top = scrollY + rect.top - suggestionsDiv.offsetHeight - 5; // ツールバー上に表示
    if (top < 0) top = 5; // 画面上端より上にならない
    let left = scrollX + rect.left;

    suggestionsDiv.style.top = top + "px";
    suggestionsDiv.style.left = left + "px";
  }

  // ----- コピー -----
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editor.select();
    try {
      const success = document.execCommand("copy");
      if (success) showMessage("コードをコピーしました！");
      else alert("コピーに失敗しました");
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
