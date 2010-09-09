Screw.Unit(function () {

  describe("when called without uiElement", function () {

    before(function () {
      var s = document.createElement("script"),
          c = document.createTextNode("ClickpassCurrent('foo');");
      s.type = "text/javascript";
      s.innerHTML = c;
      $('dom_text').append(s);
    });

    it("should insert link in place", function () {
      $('dom_test').html('<script type="text/javascript">ClickpassClient("foofofof");</script>');
      expect($('clickpass_login').html()).to_not(equal, null);
    });
  });

});