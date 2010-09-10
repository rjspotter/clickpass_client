/*

ClickpassClient("YourClickpassRPID", {
 
  uiElement : #id-of-element,
  onSuccess : function () {},
  onFailure : function () {},
  cpEnvType : (one of 'dev', 'next', 'current') default === current

 });

*/
function ClickpassClient() {
  
  var rpid   = arguments[0],
      config = arguments[1];

  function n0p () {}

  function isFun (a) {return typeof a === 'function';}

  function hashIs (check) {return window.location.hash === check;}

  function opUrl () {
    return config.cpEnvType === 'next'    ? 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid :
           config.cpEnvType === 'current' ? 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid :
           config.cpEnvType === 'dev'     ? 'http://dev.clickpass.com/server?m=s&cp.rpid=' + rpid  :
           'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid ;
  }


  (function () {
    var ele = document.getElementById(config.uiElement);
    ele.onclick = function () {
      var oldHash = window.location.hash,
          authPop = window.open(opUrl(), 'authPop', 'width="450",height="500",location="true"');
      if (window.focus) {authPop.focus();}
      window.onfocus = function () {
        if ( hashIs('#finished') && isFun(config.onSuccess)) { 
          config.onSuccess();
        } else if ( isFun(config.onFailure) ) {
          config.onFailure();
        }
        window.location.hash = oldHash;
        window.onfocus = null;
      };
      

    };
    
  })(); // default action
  
}