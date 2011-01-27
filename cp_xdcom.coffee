
vParser = () ->
  aggregate = (obj,pair) ->
    obj[pair[0]] = pair[1]
    return obj

  pairier = (stringPairs, collector) ->
    if stringPairs[0] == undefined
      return collector
    else
      return pairier(stringPairs.slice(1,stringPairs.length),aggregate(collector, stringPairs[0].split('-')))

  return pairier(window.location.hash.slice(1).split(':'), {})


getVariables = vParser()
if (getVariables['cp.perdata'])
  window.opener.__cp_data = getVariables
  window.opener.location.hash = 'finished'
  window.close()
else
  window.opener.location.hash = 'cancelled'
  window.close()