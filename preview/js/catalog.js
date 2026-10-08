/* Collection lines are the ones published on the live Nowa Atelier site. */
(function () {
  var journals = [
    {
      id: "chapter-1-manto",
      name: "Manto",
      chapter: "I",
      number: "01",
      sentence: "Chocolate brown leather journal with grain, brown strings and golden charms.",
      leather: "#5c3a2e",
      cord: "#6b4a32",
      charm: "#c6a15b"
    },
    {
      id: "chapter-1-obsidian",
      name: "Obsidian",
      chapter: "I",
      number: "02",
      sentence: "Black crocodile journal with red strings and golden charms.",
      leather: "#1a1a1a",
      cord: "#9a2f2f",
      charm: "#c6a15b"
    },
    {
      id: "chapter-1-jane",
      name: "Jane",
      chapter: "I",
      number: "03",
      sentence: "Plum melting into mauve, strung in pink strings and silver charms.",
      leather: "#6e4458",
      cord: "#d7a0b0",
      charm: "#c5c8ce"
    },
    {
      id: "chapter-1-eden",
      name: "Eden",
      chapter: "I",
      number: "04",
      sentence: "Leafy green organic journal, slightly untamed, with orange strings and golden charms.",
      leather: "#3d5c45",
      cord: "#d06a2b",
      charm: "#c6a15b"
    },
    {
      id: "chapter-1-ember",
      name: "Ember",
      chapter: "I",
      number: "05",
      sentence: "Chocolate brown handmade journal with brown strings and golden charms.",
      leather: "#6a4332",
      cord: "#6b4a32",
      charm: "#c6a15b"
    },
    {
      id: "chapter-1-riptide",
      name: "Riptide",
      chapter: "I",
      number: "06",
      sentence: "Navy blue journal with orange strings and silver charms.",
      leather: "#1e3358",
      cord: "#d06a2b",
      charm: "#c5c8ce"
    },
    {
      id: "chapter-2-manto",
      name: "Manto",
      chapter: "II",
      number: "01",
      sentence: "Chocolate brown leather journal with grain, brown strings and golden charms.",
      leather: "#4e3428",
      cord: "#6b4a32",
      charm: "#c6a15b"
    },
    {
      id: "chapter-2-venom",
      name: "Venom",
      chapter: "II",
      number: "02",
      sentence: "Black leather journal with grain, orange strings and silver charms.",
      leather: "#242424",
      cord: "#d06a2b",
      charm: "#c5c8ce"
    },
    {
      id: "chapter-2-nebula",
      name: "Nebula",
      chapter: "II",
      number: "03",
      sentence: "Blue leather journal with grain, red strings and silver charms.",
      leather: "#3a4d6b",
      cord: "#9a2f2f",
      charm: "#c5c8ce"
    },
    {
      id: "chapter-2-sylvia",
      name: "Sylvia",
      chapter: "II",
      number: "04",
      sentence: "Dark red leather journal with grain, brown strings and golden charms.",
      leather: "#6b2433",
      cord: "#6b4a32",
      charm: "#c6a15b"
    },
    {
      id: "chapter-2-katniss",
      name: "Katniss",
      chapter: "II",
      number: "05",
      sentence: "Dark green leather journal with grain, red strings and golden charms.",
      leather: "#1e3d32",
      cord: "#9a2f2f",
      charm: "#c6a15b"
    }
  ];

  function formatPrice(amount) {
    var value = amount == null ? 3500 : amount;
    return "Rs " + value.toLocaleString("en-PK");
  }

  function find(id) {
    return journals.find(function (journal) {
      return journal.id === id;
    });
  }

  window.NOWA = {
    journals: journals,
    price: 3500,
    formatPrice: formatPrice,
    find: find
  };
})();
