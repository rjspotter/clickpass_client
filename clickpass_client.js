(function() {
  window.ClickpassClient = function() {
    var config, ele, hashIs, isFun, opUrl, rpid, sregAttributes;
    rpid = arguments[0];
    config = arguments[1];
    isFun = function(a) {
      return typeof a === 'function';
    };
    hashIs = function(check) {
      return window.location.hash === check;
    };
    opUrl = function() {
      switch (config.cpEnvType) {
        case 'next':
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid;
        case 'current':
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid;
        case 'dev':
          return 'http://dev.clickpass.com/server?m=s&cp.rpid=' + rpid;
        default:
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid;
      }
    };
    sregAttributes = function() {
      var aD, cdr, extract, fG;
      cdr = function(arr) {
        return arr.slice(1, arr.length);
      };
      fG = function(k) {
        return window.__cp_data['openid.sreg.' + k];
      };
      aD = function(col, k, v) {
        col[k] = v;
        return col;
      };
      extract = function(lst, col) {
        return lst[0] === undefined ? col : (fG(lst[0]) === undefined ? extract(cdr(lst), col) : extract(cdr(lst), aD(col, lst[0], unescape(fG(lst[0])))));
      };
      return extract(['nickname', 'fullname', 'email', 'dob', 'gender', 'timezone', 'language', 'country', 'postcode'], {});
    };
    ele = document.getElementById(config.uiElement);
    return (ele.onclick = function() {
      var authPop, oldHash;
      oldHash = window.location.hash;
      authPop = window.open(opUrl(), 'authPop', 'width="450",height="500",location="true"');
      if (window.focus) {
        authPop.focus();
      }
      return (window.onfocus = function() {
        if (hashIs('#finished') && isFun(config.onSuccess)) {
          config.onSuccess(sregAttributes());
        } else if (isFun(config.onFailure)) {
          config.onFailure();
        }
        window.location.hash = oldHash;
        return (window.onfocus = null);
      });
    });
  };
}).call(this);
