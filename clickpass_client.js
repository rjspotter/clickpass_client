(function() {
  window.ClickpassClient = function() {
    var clickpassAttributes, config, cryptedSalt, ele, encrypt, hashIs, isFun, opUrl, salt;
    config = arguments[0];
    encrypt = function(str) {
      var rsa;
      rsa = new RSAKey();
      rsa.setPublic(config.key, "3");
      return rsa.encrypt(str);
    };
    salt = config.uuid || uuid();
    cryptedSalt = encrypt(salt);
    isFun = function(a) {
      return typeof a === 'function';
    };
    hashIs = function(check) {
      return window.location.hash === check;
    };
    opUrl = function() {
      switch (config.cpEnvType) {
        case 'next':
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id;
        case 'current':
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id;
        case 'dev':
          return 'http://dev.clickpass.com:3000/endpoint?cp.id=' + config.id + '&cp.csec=' + cryptedSalt;
        default:
          return 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id;
      }
    };
    clickpassAttributes = function() {
      var data, isValidData, stripJunk;
      stripJunk = function(str) {
        if (str[str.length - 1] === "}") {
          return str;
        } else {
          return stripJunk(str.slice(0, -1));
        }
      };
      isValidData = function() {
        var data, hmac;
        data = stripJunk(decode64(window.__cp_data['cp.perdata']));
        hmac = Crypto.HMAC(Crypto.SHA256, data, salt);
        return window.__cp_data['cp.sig'] === hmac;
      };
      if (isValidData()) {
        return eval("(" + stripJunk(decode64(window.__cp_data['cp.perdata'])) + ")");
      } else {
        data = stripJunk(decode64(window.__cp_data['cp.perdata']));
        alert("hmac(" + salt + " , " + data + ') -> ' + Crypto.HMAC(Crypto.SHA256, data, salt) + ' != ' + window.__cp_data['cp.sig']);
        return alert('failed verification');
      }
    };
    ele = document.getElementById(config.uiElement);
    return ele.onclick = function() {
      var authPop, oldHash;
      console.log(opUrl());
      oldHash = window.location.hash;
      authPop = window.open(opUrl(), 'authPop', 'width="450",height="500",location="true"');
      if (window.focus) {
        authPop.focus();
      }
      return window.onfocus = function() {
        if (hashIs('#finished') && clickpassAttributes()) {
          createCookie('cpdata', clickpassAttributes());
          createCookie('cprawdata', window.__cp_data['cp.perdata']);
          createCookie('cpsig', window.__cp_data['cp.sig']);
          createCookie('cpsecsig', window.__cp_data['cp.secsig']);
          if (isFun(config.onSuccess)) {
            config.onSuccess(clickpassAttributes());
          }
        } else if (isFun(config.onFailure)) {
          config.onFailure();
        }
        window.location.hash = oldHash;
        return window.onfocus = null;
      };
    };
  };
}).call(this);
