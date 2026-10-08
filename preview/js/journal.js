(function () {
  var root = document.querySelector("#product");
  if (!root) return;
  var params = new URLSearchParams(window.location.search);
  var journal = window.NOWA.find(params.get("id"));
  var journals = window.NOWA.journals;

  if (!journal) {
    var missing = document.createElement("p");
    missing.textContent = "That journal is not in this preview.";
    var list = document.createElement("ul");
    list.className = "text-index";
    journals.forEach(function (item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "journal.html?id=" + encodeURIComponent(item.id);
      link.textContent = item.name + " · Chapter " + item.chapter + " · " + window.NOWA.formatPrice();
      li.append(link);
      list.append(li);
    });
    root.append(missing, list);
    return;
  }

  document.title = journal.name + " · Nowa Atelier";

  var crumb = document.createElement("p");
  crumb.className = "crumb";
  var shop = document.createElement("a");
  shop.href = "index.html#notebook";
  shop.textContent = "Shop";
  crumb.append(shop, document.createTextNode(" / Chapter " + journal.chapter + " / " + journal.name));

  var layout = document.createElement("div");
  layout.className = "product-layout";

  var field = document.createElement("div");
  field.className = "leather-large";
  field.style.setProperty("--leather", journal.leather);
  field.style.setProperty("--cord", journal.cord);
  var cord = document.createElement("span");
  cord.className = "cord";
  var charm = document.createElement("span");
  charm.className = "charm";
  charm.style.setProperty("--charm", journal.charm);
  field.append(cord, charm);

  var copy = document.createElement("div");
  var eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "No. " + journal.number + " · Chapter " + journal.chapter + " · Karachi";
  var title = document.createElement("h1");
  title.className = "script-name";
  title.textContent = journal.name;
  var price = document.createElement("p");
  price.className = "product-price";
  price.textContent = window.NOWA.formatPrice();
  var sentence = document.createElement("p");
  sentence.className = "product-sentence";
  sentence.textContent = journal.sentence;
  var add = document.createElement("button");
  add.type = "button";
  add.className = "btn btn-maroon";
  add.textContent = "Add to bag";
  add.addEventListener("click", function () {
    window.NOWA.add(journal.id);
  });
  var delivery = document.createElement("p");
  delivery.className = "delivery";
  delivery.textContent = "Karachi delivery, complimentary. Outside Karachi, PKR 200.";

  var nextIndex = (journals.indexOf(journal) + 1) % journals.length;
  var next = journals[nextIndex];
  var nextLink = document.createElement("a");
  nextLink.className = "next-link";
  nextLink.href = "journal.html?id=" + encodeURIComponent(next.id);
  nextLink.textContent = "Next, " + next.name;

  copy.append(eyebrow, title, price, sentence, add, delivery, nextLink);
  layout.append(field, copy);
  root.append(crumb, layout);
})();
