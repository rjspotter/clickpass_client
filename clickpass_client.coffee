# This client works with the next version of Clickpass
# api simplicity is the goal:
#  * a single include
#  * a single function call with...
#  * a single identifier
#  * a single object for passing callbacks and configuration

# The API is modeled on jQuery's $.ajax() call with some of the old FB api for spice.
# this is an experimental release.
window.ClickpassClient = () ->

  # parse out the arguments.  having an explicit function signature ala
  # ClickpassClient(rpid,config) would lock us in.  Taking arbitrary args and parsing
  # them out is a lot more flexible
  rpid   = arguments[0]
  config = arguments[1]

  # Later on were going to want to be able to branch code or reject input based on
  # it's type or value.  So we need to know if it's a function before calling it.
  isFun = (a) ->
    return typeof a == 'function'

  # Or, we need to know what the value of the hash is in the url
  # So far we only need to know if the hash has a particular value
  # thus hashIs takes an argument to compare against
  hashIs = (check) ->
    return window.location.hash == check

  # Since we expect there to be multiple versions of Clickpass existing in parallel
  # at very least we expect a bleeding edge (next), a stable (current), and development (dev)
  # version to be running we use a short reference url mapper (opUrl => OpenID Provider URL).
  opUrl = () ->
    return switch config.cpEnvType
      when 'next'    then 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid
      when 'current' then 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid
      when 'dev'     then 'http://dev.clickpass.com/server?m=s&cp.rpid=' + rpid
      else 'http://next.clickpass.com/server?m=s&cp.rpid=' + rpid


  sregAttributes = () ->
    cdr = (arr) ->
      return arr.slice(1,arr.length)
    # fromGlobal returns an sreg attribute from the Clickpass Data stored
    fG = (k) ->
      return window.__cp_data['openid.sreg.' + k]
    # appenD to a passed collection
    aD = (col,k,v) ->
      col[k] = v
      return col

    extract = (lst, col) ->
       return if lst[0] == undefined then col else
              if fG(lst[0]) == undefined
                extract(cdr(lst), col)
              else
                extract(cdr(lst), aD(col,lst[0],unescape(fG(lst[0]))))


    return extract([
      'nickname',
      'fullname',
      'email',
      'dob',
      'gender',
      'timezone',
      'language',
      'country',
      'postcode'],
      {}
    )

  ele = document.getElementById(config.uiElement)
  ele.onclick = () ->
    oldHash = window.location.hash
    authPop = window.open(opUrl(), 'authPop', 'width="450",height="500",location="true"')
    if (window.focus) then authPop.focus()
    window.onfocus = () ->
      if ( hashIs('#finished') && isFun(config.onSuccess))
        config.onSuccess(sregAttributes())
      else if ( isFun(config.onFailure) )
        config.onFailure()
      window.location.hash = oldHash
      window.onfocus = null

