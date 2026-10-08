(function () {
  var form = document.querySelector("#custom-form");
  if (!form) return;

  var fields = ["leather", "size", "cord", "detail", "finish"];
  var summary = {
    leather: document.querySelector("#sum-leather"),
    size: document.querySelector("#sum-size"),
    cord: document.querySelector("#sum-cord"),
    detail: document.querySelector("#sum-detail"),
    finish: document.querySelector("#sum-finish")
  };

  function selected(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function paint() {
    var emboss = form.emboss.value.trim();
    summary.leather.textContent = selected("leather");
    summary.size.textContent = selected("size");
    summary.cord.textContent = selected("cord");
    summary.detail.textContent = selected("detail");
    summary.finish.textContent = emboss ? emboss + " · " + selected("finish") : "None";
  }

  form.addEventListener("input", paint);
  form.addEventListener("change", paint);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var confirm = document.querySelector("#custom-confirm");
    var submit = form.querySelector("[type=submit]");
    if (confirm) confirm.hidden = false;
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sent";
    }
  });

  paint();
})();
