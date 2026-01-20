$(document).ready(function () {

  function moveToSelected(element) {

    let selected;

    if (element === "next") {
      selected = $(".selected").next();
    } else if (element === "prev") {
      selected = $(".selected").prev();
    } else {
      selected = element;
    }

    if (!selected || !selected.length) return;

    const next = selected.next();
    const prev = selected.prev();
    const prevSecond = prev.prev();
    const nextSecond = next.next();

    selected.attr("class", "selected");
    prev.attr("class", "prev");
    next.attr("class", "next");
    nextSecond.attr("class", "nextRightSecond");
    prevSecond.attr("class", "prevLeftSecond");

    nextSecond.nextAll().attr("class", "hideRight");
    prevSecond.prevAll().attr("class", "hideLeft");
  }

  $("#carousel div").on("click", function () {
    moveToSelected($(this));
  });

$("#carouselPrev").on("click", function () {
  moveToSelected("prev");
});

$("#carouselNext").on("click", function () {
  moveToSelected("next");
});


  $(document).on("keydown", function (e) {
    if (e.which === 37) moveToSelected("prev");
    if (e.which === 39) moveToSelected("next");
  });




});
