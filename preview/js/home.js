(function () {
  var journals = window.NOWA.journals;
  var stage = document.querySelector("#letter-stage");
  var note = document.querySelector("#note");
  var seal = document.querySelector("#seal");
  var hint = document.querySelector("#letter-hint");
  var closeNote = document.querySelector("#close-note");
  var sheet = document.querySelector("#sheet");
  var pageRight = document.querySelector("#page-right");
  var leftChapter = document.querySelector("#left-chapter");
  var leftCount = document.querySelector("#left-count");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var busy = false;

  try {
    var saved = Number(sessionStorage.getItem("nowa-page"));
    if (saved >= 0 && saved < journals.length) index = saved;
  } catch (error) {
    index = 0;
  }

  function openNote() {
    if (!stage || stage.classList.contains("is-open")) return;
    stage.classList.add("is-opening");
    if (seal) seal.setAttribute("aria-expanded", "true");
    var reveal = function () {
      stage.classList.add("is-open");
      if (note) note.hidden = false;
      if (hint) hint.hidden = true;
      if (closeNote) closeNote.focus();
    };
    if (reduce) reveal();
    else window.setTimeout(reveal, 680);
  }

  function shutNote() {
    if (!stage) return;
    stage.classList.remove("is-open", "is-opening");
    if (note) note.hidden = true;
    if (hint) hint.hidden = false;
    if (seal) {
      seal.setAttribute("aria-expanded", "false");
      seal.focus();
    }
  }

  if (seal) seal.addEventListener("click", openNote);
  if (hint) hint.addEventListener("click", openNote);
  if (closeNote) closeNote.addEventListener("click", shutNote);

  function leatherBlock(journal) {
    var block = document.createElement("div");
    block.className = "leather";
    block.style.setProperty("--leather", journal.leather);
    block.style.setProperty("--cord", journal.cord);
    var charm = document.createElement("span");
    charm.className = "charm";
    charm.style.setProperty("--charm", journal.charm);
    block.append(charm);
    return block;
  }

  function fill(node, journal) {
    node.replaceChildren();
    var top = document.createElement("div");
    top.className = "sheet-top";
    var chapter = document.createElement("p");
    chapter.textContent = "Chapter " + journal.chapter;
    var numeral = document.createElement("p");
    numeral.className = "numeral";
    numeral.textContent = journal.number;
    top.append(chapter, numeral);

    var name = document.createElement("h3");
    name.className = "sheet-name";
    name.textContent = journal.name;

    var meta = document.createElement("p");
    meta.className = "sheet-meta";
    meta.textContent = "No. " + journal.number + " · handmade in Karachi";

    var sentence = document.createElement("p");
    sentence.className = "sheet-sentence";
    sentence.textContent = journal.sentence;

    var price = document.createElement("p");
    price.className = "sheet-price";
    price.textContent = window.NOWA.formatPrice();

    var link = document.createElement("a");
    link.className = "sheet-link";
    link.href = "journal.html?id=" + encodeURIComponent(journal.id);
    link.textContent = "View journal";

    node.append(top, leatherBlock(journal), name, meta, sentence, price, link);
  }

  function paintQuiet() {
    var journal = journals[index];
    fill(sheet, journal);
    if (leftChapter) leftChapter.textContent = "Chapter " + journal.chapter;
    if (leftCount) {
      leftCount.textContent = String(index + 1).padStart(2, "0") + " / " + String(journals.length).padStart(2, "0");
    }
    try {
      sessionStorage.setItem("nowa-page", String(index));
    } catch (error) {
      /* ignore */
    }
  }

  function turn(direction) {
    if (!sheet || busy) return;
    var next = (index + direction + journals.length) % journals.length;
    if (reduce) {
      index = next;
      paintQuiet();
      return;
    }
    busy = true;
    var flipper = document.createElement("div");
    flipper.className = "flipper";
    var front = document.createElement("div");
    front.className = "flip-face front";
    var back = document.createElement("div");
    back.className = "flip-face back";
    fill(front, journals[index]);
    fill(back, journals[next]);
    flipper.append(front, back);
    pageRight.append(flipper);
    index = next;
    paintQuiet();
    var finished = false;
    var done = function () {
      if (finished) return;
      finished = true;
      flipper.remove();
      busy = false;
    };
    flipper.addEventListener("transitionend", function (event) {
      if (event.propertyName === "transform") done();
    });
    window.setTimeout(done, 900);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        flipper.classList.add("go");
      });
    });
  }

  document.querySelectorAll("[data-turn]").forEach(function (button) {
    button.addEventListener("click", function () {
      turn(Number(button.getAttribute("data-turn")));
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var notebook = document.querySelector("#notebook");
    if (!notebook) return;
    var rect = notebook.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    turn(event.key === "ArrowRight" ? 1 : -1);
  });

  paintQuiet();
})();
