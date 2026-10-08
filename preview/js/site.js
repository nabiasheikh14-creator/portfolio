(function () {
  var KEY = "nowa-bag";
  var drawer = document.querySelector("#drawer");
  var bagBody = document.querySelector("#bag-body");
  var lastFocus = null;

  function read() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    paint();
  }

  function count() {
    return read().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function paintCount() {
    var total = String(count());
    document.querySelectorAll("[data-bag-count]").forEach(function (node) {
      node.textContent = total;
    });
  }

  function paint() {
    paintCount();
    if (!bagBody) return;
    var items = read();
    bagBody.replaceChildren();

    if (!items.length) {
      var empty = document.createElement("p");
      empty.className = "bag-empty";
      empty.textContent = "Your bag is empty.";
      var link = document.createElement("a");
      link.href = "index.html#notebook";
      link.textContent = "Shop the journals";
      bagBody.append(empty, link);
      return;
    }

    var list = document.createElement("ul");
    list.className = "bag-list";
    items.forEach(function (item) {
      var journal = window.NOWA.find(item.id);
      if (!journal) return;
      var row = document.createElement("li");
      var info = document.createElement("div");
      var name = document.createElement("p");
      name.className = "bag-name";
      name.textContent = journal.name;
      var meta = document.createElement("p");
      meta.className = "bag-meta";
      meta.textContent = "Chapter " + journal.chapter + " · " + window.NOWA.formatPrice();
      info.append(name, meta);

      var qty = document.createElement("div");
      qty.className = "qty";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Fewer " + journal.name);
      minus.addEventListener("click", function () {
        change(item.id, -1);
      });
      var value = document.createElement("span");
      value.textContent = String(item.qty);
      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "More " + journal.name);
      plus.addEventListener("click", function () {
        change(item.id, 1);
      });
      qty.append(minus, value, plus);

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-btn";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        change(item.id, -999);
      });

      row.append(info, qty, remove);
      list.append(row);
    });
    bagBody.append(list);
  }

  function change(id, delta) {
    var items = read();
    var next = [];
    var found = false;
    items.forEach(function (item) {
      if (item.id !== id) {
        next.push(item);
        return;
      }
      found = true;
      var qty = item.qty + delta;
      if (qty > 0) next.push({ id: id, qty: qty });
    });
    if (!found && delta > 0) next.push({ id: id, qty: delta });
    write(next);
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add("bag-open");
    var close = drawer.querySelector("[data-close-bag]");
    if (close) close.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove("bag-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-open-bag]").forEach(function (button) {
    button.addEventListener("click", openDrawer);
  });
  document.querySelectorAll("[data-close-bag]").forEach(function (button) {
    button.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer && !drawer.hidden) closeDrawer();
  });

  window.NOWA.add = function (id) {
    change(id, 1);
    openDrawer();
  };
  window.NOWA.openBag = openDrawer;

  paint();
})();
