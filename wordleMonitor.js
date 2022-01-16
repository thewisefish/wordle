const headless = require('playwright') //npm install playwright
//disclaimer: while the code can probably be optimized/cleaned up to be more symbolic
//I write things the way I do because it makes sense to me when I read it
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


//We're just using a headless browser to grab the answer from localStorage
async function chromeInstance(url) {
    const browser = await headless.chromium.launch({
        headless: true,
        slowMo: 50,
        proxy: { //optional, delete the whole object if you're not using a proxy
            server: 'http://thewisefish.productions:69420',
            username: 'LplusRatio',
            password: 'plusCheating'
        }
    });
    const context = await browser.newContext({
        permissions: ['geolocation'],
        colorScheme: 'dark',
        locale: 'en-US'
    });
    const page = await context.newPage()
    await page.goto(url, { waitUntil: "domcontentloaded" })
    console.log(`[Browser] Loaded ${url}`)
    async function returnEval(k) {
        return k.evaluate(() => JSON.parse(localStorage.gameState))
    }
    var resp
    await returnEval(page).then(w => { resp = w.solution })
    await browser.close()//--this is optional--.then(w=>console.log(`[Browser] Answer retrieved, browser closed`))
    return resp

}

/*The below block is so that the program would only run once a day
by only opening a browser if it's after midnight 
and additionally checking if a new puzzle has in fact been uploaded*/

var nextMidnight = false
var lastAnswer = false
var challengeNum = 211
async function cheatAtWordle() {
    var currentDate = new Date()
    var timestampCD = currentDate.toString() //I clear out TZ with .replace() because I'm lazy
    if (!nextMidnight || currentDate > nextMidnight) { //we use an OR in order to handle both initial check and subsequent checks
        console.log(`${timestampCD.replace(' GMT-0800 (Pacific Standard Time)', '')}: Checking puzzle`)
        await chromeInstance('https://www.powerlanguage.co.uk/wordle/')
            .then(w => {
                if (!lastAnswer || w != lastAnswer) { //in case I oopsie'd on the timing
                    console.log(`${timestampCD.replace(' GMT-0800 (Pacific Standard Time)', '')}: Answer (${challengeNum}): ${w}`)
                    nextMidnight = new Date()
                    nextMidnight.setHours(24, 0, 0, 0)
                    let nmTimestamp = nextMidnight.toString()
                    lastAnswer = w
                    challengeNum++
                    console.log(`${timestampCD.replace(' GMT-0800 (Pacific Standard Time)', '')}: Assuming next puzzle at ${nmTimestamp.replace(' GMT-0800 (Pacific Standard Time)', '')}`)
                    return
                } else { return }
            })
            .catch(e => {
                console.log(`${timestampCD.replace(' GMT-0800 (Pacific Standard Time)', '')}: Failed somehow, retrying`)
                return
            })
    } else {
        return
    }
}

//delay-based monitor that checks every 3 minutes if it's the next day yet
async function run() {
    while (true) {
        await cheatAtWordle()
        await sleep(180000)
    }
}
run()

