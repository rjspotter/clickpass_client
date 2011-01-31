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
  # ClickpassClient(foo, bar, config) would lock us in.  Taking arbitrary args and parsing
  # them out is a lot more flexible
  config = arguments[0]

  # We want to generate a couple of variable as well namely our salt, the encrypted salt
  # to pass to the server, and a check function for verifying data later.
  encrypt = (str) ->
    rsa = new RSAKey()
    rsa.setPublic(config.key, "3")
    return rsa.encrypt(str)
  salt          = config.uuid || uuid()
  cryptedSalt = encrypt(salt)

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
      when 'next'    then 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id
      when 'current' then 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id
      when 'dev'     then 'http://dev.clickpass.com:3000/endpoint?cp.id=' + config.id + '&cp.csec=' + cryptedSalt
      else 'http://next.clickpass.com/server?m=s&cp.rpid=' + config.id

  # Part of the beauty of Clickpass compared to other third party providers is that
  # user data is provided at login time updated during each login
  # no extra api call required.
  clickpassAttributes = () ->
    stripJunk = (str) ->
      if (str[str.length - 1] == "}")
         return str
      else
         return stripJunk(str.slice(0,-1))
    isValidData = () ->
      data = stripJunk(decode64(window.__cp_data['cp.perdata']))
      hmac = Crypto.HMAC(Crypto.SHA256, data, salt)
      return window.__cp_data['cp.sig'] == hmac
    if isValidData()
      return eval "(" + stripJunk(decode64(window.__cp_data['cp.perdata'])) + ")"
    else
      data = stripJunk(decode64(window.__cp_data['cp.perdata']))
      alert("hmac("+ salt + " , " + data + ') -> ' + Crypto.HMAC(Crypto.SHA256, data, salt) + ' != ' + window.__cp_data['cp.sig'])
      alert('failed verification')

  # On to the subject of user experience.
  # Get the element that clicking on will start the process of logging in.
  ele = document.getElementById(config.uiElement)
  # Then when it's clicked....
  ele.onclick = () ->
    console.log(opUrl())
    # Grab the current hash so we can return it to it's state when we're done.
    oldHash = window.location.hash
    # Open up a popup window for us to use.
    authPop = window.open(opUrl(), 'authPop', 'width="450",height="500",location="true"')
    if (window.focus) then authPop.focus()
    # When we get focus back from Clickpass.com we call the success callback with the sreg data from above
    # or we call the failure callback.  Finally we cleanup and wash our hands.
    window.onfocus = () ->
      if ( hashIs('#finished') && clickpassAttributes())
        createCookie('cpdata', clickpassAttributes())
        createCookie('cprawdata', window.__cp_data['cp.perdata'])
        createCookie('cpsig', window.__cp_data['cp.sig'])
        createCookie('cpsecsig', window.__cp_data['cp.secsig'])
        if isFun(config.onSuccess)
          config.onSuccess(clickpassAttributes())
      else if ( isFun(config.onFailure) )
        config.onFailure()
      window.location.hash = oldHash
      window.onfocus = null

