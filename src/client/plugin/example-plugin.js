/**
 * Example plugin extension for Reveal.js
 */
(function () {
  function fragmentShown() {
      // do something
  }

  // Whenever a Reveal fragment is shown, this event handler is called
  Reveal.addEventListener('fragmentshown',  fragmentShown);
}());