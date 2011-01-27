(function() {
  var getVariables, vParser;
  vParser = function() {
    var aggregate, pairier;
    aggregate = function(obj, pair) {
      obj[pair[0]] = pair[1];
      return obj;
    };
    pairier = function(stringPairs, collector) {
      if (stringPairs[0] === void 0) {
        return collector;
      } else {
        return pairier(stringPairs.slice(1, stringPairs.length), aggregate(collector, stringPairs[0].split('-')));
      }
    };
    return pairier(window.location.hash.slice(1).split(':'), {});
  };
  getVariables = vParser();
  if (getVariables['cp.perdata']) {
    window.opener.__cp_data = getVariables;
    window.opener.location.hash = 'finished';
    window.close();
  } else {
    window.opener.location.hash = 'cancelled';
    window.close();
  }
}).call(this);
