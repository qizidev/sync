async function insertVocabulary() {
  // indexDb framework
  await appendScript("localforage.min.js");

  const word = document.getElementsByTagName("title")[0].innerText;
  if (!word) return;

  let isFetch = false;
  const html = await localforage.getItem(word).then(async (value) => {
    if (typeof value === "string" && value.startsWith("@redirect:")) {
      const redirect = value.split("@redirect:")[1];
      value = await localforage.getItem(redirect);
    }
    if (value) return value.html;
    return fetch(
      `https://www.vocabulary.com/dictionary/definition.ajax?search=${word}&lang=en`
    )
      .then((res) => res.text())
      .then((data) => {
        isFetch = true;
        return data;
      });
  });

  if (!html) return;

  function parseHtml(html) {
    if (html.match("noresults")) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    // if no short def, return
    if (tempDiv.querySelector(".short").children.length === 0) return;

    const removeChild = [
      tempDiv.querySelector(".test-prep"),
      tempDiv.querySelector(".sign-up-area"),
      tempDiv.querySelector(".col-2"),
      tempDiv.querySelector(".word-definitions"),
    ];
    removeChild.forEach(
      (child) => child && child.parentNode.removeChild(child)
    );

    const container = document.createElement("div");
    container.id = "IDVocabulary";
    container.classList.add("explain_wrap_styleless");
    container.innerHTML = `
            <div class="expHead"><a href="#" onclick="expandIt('IDVocabulary'); return false" class=""><span class="explain_collapse" id="IDVocabularyImg"></span>Vocabulary.com</a></div>
            <div id="IDVocabularychild" class="expDiv" style="display: block;">${tempDiv.innerHTML}</div>
        `;

    if (document.querySelector(".spellHint")) {
      document
        .querySelector(".spellHint")
        .insertAdjacentElement("afterend", container);
    } else {
      document
        .getElementById("NoteTop")
        .insertAdjacentElement("afterend", container);
    }
    document.head.appendChild(createCssLink("vocabulary.css"));
    document.head.appendChild(createCssLink("vocabulary-font.css"));

    return tempDiv.querySelector("div[data-word]").getAttribute("data-word");
  }

  const vword = parseHtml(html);

  if (isFetch) {
    if (!vword) {
      localforage.setItem(word, "NULL");
    } else if (vword !== word) {
      localforage.getItem(vword).then((value) => {
        if (!value)
          localforage.setItem(vword, {
            created: new Date(),
            html,
          });
      });
      localforage.setItem(word, `@redirect:${vword}`);
    } else {
      localforage.setItem(word, {
        created: new Date(),
        html,
      });
    }
  }
}
function createCssLink(url) {
  const link = document.createElement("link");
  link.href = url;
  link.type = "text/css";
  link.rel = "stylesheet";
  return link;
}
async function appendScript(url) {
  const script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  });
}
insertVocabulary();