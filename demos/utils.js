const xtn_laptop = 'egphknkmnjfgopfbahecbemahbphomeg'
const extensionId_LocalTesting = 'dnokejphlpljkikgfgmaiojlohadfdgo'
const extensionId_InStore = 'ggdmhmaklbcaeeolnppfehjkkihhnkfe'
const extensionId_Ted = 'blacfijijfejijlceijeoiphcfdimolb'
//const API = chrome
const available_xtn = [xtn_laptop,extensionId_LocalTesting,extensionId_InStore, extensionId_Ted]
let selected_xtn = xtn_laptop
let sessionId = ''
// betterMethod when working for firefox
const betterMethod = true

// this should log to contentscript
function sendMessageExtension (payload) {
    window.postMessage({
        direction: "browser-to-extension",
        message: payload
    }, "*")
    //page will have to listen for results!
}

startMonetization = async (url, paymail) => {
    sessionId = create_UUID()
    const payload = {
        command: "start",
        data:{
            requestId:sessionId,
            paymentPointer:paymail,
            initiatingUrl: url,
            serviceProviderUrl:''
            }
        }
        if (betterMethod) {
            sendMessageExtension(payload)
        } else {
            const response = await API.runtime.sendMessage(
                selected_xtn, payload)
            return response
        }
}

stopMonetization = async () => {
    const payload = {command: "stop"}
    if (betterMethod) {
        sendMessageExtension(payload)
    } else {
        const response = await API.runtime.sendMessage(
            selected_xtn, payload)
        return response
    }
}

progressMonetization = async () => {
    const payload = {command: "progress",
    data:{
        requestId:sessionId,
        }
    }
    if (betterMethod) {
        sendMessageExtension(payload)
    } else {
        const response = await API.runtime.sendMessage(
            selected_xtn, payload)
        return response
    }
}

async function checkExtension () {
    const isFirefox = typeof InstallTrigger !== 'undefined'
    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
    // console.log(`firefox ${isFirefox}`)
    // console.log(`chrome ${isChrome}`)
    // available_xtn.forEach(x => {
    const payload = {command: "info"}
    if (betterMethod) {
        console.log(payload)
        sendMessageExtension(payload)
    } else {
        try {
            console.log(`Checking InStore`)
            const xtn = 
            await API.runtime.sendMessage(
                extensionId_InStore, payload)
            if (xtn) selected_xtn = extensionId_InStore
            console.log(xtn)
            return {
                isChrome: isChrome,
                isFirefox: isFirefox,
                extension: xtn
            }
        }
        catch {

            try {
                console.log(`Checking laptop`)
                const xtn = 
                  await API.runtime.sendMessage(
                      xtn_laptop, {command: "info"})
                  if (xtn) selected_xtn = xtn_laptop
                  console.log(xtn)
                  return {
                      isChrome: isChrome,
                      isFirefox: isFirefox,
                      extension: xtn
                  }
              }
              catch {

                try {
                    console.log(`Checking Ted`)
                    const xtn = 
                      await API.runtime.sendMessage(
                        extensionId_Ted, {command: "info"})
                      if (xtn) selected_xtn = extensionId_Ted
                      console.log(xtn)
                      return {
                          isChrome: isChrome,
                          isFirefox: isFirefox,
                          extension: xtn
                      }
                  }
                  catch {

                    try {
                        console.log(`Checking LocalTesting ${extensionId_LocalTesting}`)
                        const xtn = 
                          await API.runtime.sendMessage(
                            extensionId_LocalTesting, {command: "info"})
                          if (xtn) selected_xtn = extensionId_LocalTesting
                          console.log(xtn)
                          return {
                              isChrome: isChrome,
                              isFirefox: isFirefox,
                              extension: xtn
                          }
                      }
                      catch {
                        console.error(`No extension found`)
                      }
    
                  }
    
              }
      
        }
    }
}

async function getExchange()  {
    const url = 'https://cash.bitcoinofthings.com/exchange'
    const response = await fetch(url)
    const result = await response.json()
    return result
}

function convertSatoshisToUsd(satoshis, exchange) {
    if (!exchange) return satoshis
    if (!satoshis) return 0
    const dollarsPerBitcoin = exchange.data.rate
    const dollarsPerSatoshi = dollarsPerBitcoin/1e8
    //const centsPerSatoshi = dollarsPerSatoshi*100
    //console.log(centsPerSatoshi)
    //const cents = centsPerSatoshi * satoshis
    const dollars = dollarsPerSatoshi * satoshis
    return dollars
}

create_UUID = () => {
    var dt = new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0
        dt = Math.floor(dt/16)
        return (c=='x' ? r :(r&0x3|0x8)).toString(16)
    })
    return uuid
  }