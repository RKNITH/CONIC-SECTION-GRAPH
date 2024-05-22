
/***    EQUATIONS    ***/

// Keys to be accepted
var permissableCharacters = [
    "Backspace", "Delete", "Tab",                      // Backspace
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',  // 0 thru 9
    "+", "-", "*", "/", "%", ".",                      // + - * / %
    "ArrowLeft", "ArrowRight"
]

// Equation variables, hooks into [data-var] contenteditables
var equVars = {
    "r": "",
    "h": "",
    "k": "",
    "a": "",
    "b": "",
    "m": "",
}

var equEvents = {
    equKeypress: function (ev) {
        // Before checking the standard list of characters,
        // check some special cases.
        if (ev.key.toLowerCase() == "r" && ev.ctrlKey === true)
            return

        // If the character is disallowed, cancel
        if (permissableCharacters.indexOf(ev.key) === -1) {
            ev.preventDefault()
        }
    },

    /**
     * Blur on equation element
     * @function equBlur
     */
    equBlur: function (ev) {
        // If the element is a [data-var], change the relevant variable
        console.log(ev)
        var el = ev.target
        var dataVar = el.attributes.getNamedItem("data-var").value
        equVars[dataVar] = el.innerHTML

        ctxDraw()
    }
}

/***    MODES    ***/

/**
 * Equation modes
 * @type {object}
 */
var modes = {
    // Straight Line
    line: {
        title: "Line",
        equation: "y = $mx + $c",
        y: function (x) {
            var m = eval(equVars["m"])
            var c = eval(equVars["c"])

            // y = mx + c
            return (m * x) + c
        },
        dualSided: false,
        parameters: ["m", "c"],
        properties: {
            "Center (X)": function () { return equVars["h"] },
            "Center (Y)": function () { return equVars["k"] },
            "Radius": function () { return equVars["r"] }
        },
    },

    // Circle
    circle: {
        title: "Circle",
        equation: "$r<sup>2</sup> = (x - $h)<sup>2</sup> + (y - $k)<sup>2</sup>",
        y: function (x) {

            var r = eval(equVars["r"])
            var h = eval(equVars["h"])
            var k = eval(equVars["k"])

            // r^2 = (x - h)^2 + (y - k)^2
            // y   = sqrt(r^2 - (x - h)^2) + k
            return Math.sqrt(Math.pow(r, 2) - Math.pow(x - h, 2)) + k

            // The value must be for both positive and negative
        },
        dualSided: true,
        parameters: ["r", "h", "k"],
        properties: {
            "Center (X)": function () { return equVars["h"] },
            "Center (Y)": function () { return equVars["k"] },
            "Radius": function () { return equVars["r"] }
        }
    },

    // Ellipse
    ellipse: {
        title: "Ellipse",
        equation: "1 = (x - $h)<sup>2</sup> / $a<sup>2</sup> + (y - $k)<sup>2</sup> / $b<sup>2</sup>",
        y: function (x) {
            var h = eval(equVars["h"])
            var k = eval(equVars["k"])
            var a = eval(equVars["a"])
            var b = eval(equVars["b"])

            // 1 = ((x - h)^2)/a + ((y - k)^2)/b
            // ((y - k)^2)/b = 1 - ((x - h)^2)/a
            // (y - k)^2 = b(1 - ((x - h)^2))/a
            // y - k = sqrt(b(1 - ((x - h)^2)/a)))
            // y = sqrt(b(1 - ((x - h)^2)/a)) + k
            return Math.sqrt(Math.pow(b, 2) * (1 - (Math.pow(x - h, 2) / Math.pow(a, 2)))) + k
        },
        dualSided: true,
        parameters: ["h", "k", "a", "b"],
        properties: {
            "Center (X)": function () { return equVars["h"] },
            "Center (Y)": function () { return equVars["k"] },
            "Radius": function () { return equVars["r"] }
        }
    },

    // Horizontal Parabola
    parabola: {
        title: "Parabola (Horizontal)",
        equation: "(y - $k)<sup>2</sup> = 4 &middot; $a(x - $h)",
        y: function (x) {
            var a = eval(equVars["a"])
            var h = eval(equVars["h"])
            var k = eval(equVars["k"])
            // (y - k)^2 = 4a(x - h)
            // y - k = sqrt(4a(x - h))
            // y = sqrt(4a(x - h)) + k
            return Math.sqrt(4 * a * (x - h)) + k
        },
        dualSided: true,
        parameters: ["a", "h", "k"],
        properties: {}
    },

    // Vertical Parabola
    parabola_v: {
        title: "Parabola (Vertical)",
        equation: "y - $k = 4 &middot; $a(x - $h)<sup>2</sup>",
        y: function (x) {
            var a = eval(equVars["a"])
            var h = eval(equVars["h"])
            var k = eval(equVars["k"])
            // y - k = 4a(x - h)^2
            // y = 4a(x - h)^2 + k
            return 4 * a * Math.pow(x - h, 2) + k
        },
        dualSided: false,
        parameters: ["a", "h", "k"],
        properties: {}
    },

    hyperbola: {
        title: "Hyperbola",
        equation: "1 = (x - $h)<sup>2</sup> / $a<sup>2</sup> - (y - $k)<sup>2</sup> / $b<sup>2</sup>",
        y: function (x) {
            var h = eval(equVars["h"])
            var k = eval(equVars["k"])
            var a = eval(equVars["a"])
            var b = eval(equVars["b"])

            // 1 = ((x - h)^2)/a + ((y - k)^2)/b
            // ((y - k)^2)/b = 1 - ((x - h)^2)/a
            // (y - k)^2 = b(1 - ((x - h)^2))/a
            // y - k = sqrt(b(1 - ((x - h)^2)/a)))
            // y = sqrt(b(1 - ((x - h)^2)/a)) + k
            return Math.sqrt(Math.pow(b, 2) * ((Math.pow(x - h, 2) / Math.pow(a, 2))) - 1) + k
        },
        dualSided: true,
        parameters: ["a", "b", "h", "k"],
        properties: {}
    }
}

/**
 * The currently active mode
 * @type {string}
 */

var activeMode = "circle"

/**
 * Set the mode for the app
 * @param {string} mode Sets the mode
 */
function setMode(mode) {
    // Look to see if the mode exists
    if (Object.keys(modes).indexOf(mode) === -1)
        throw new "This mode doesn't exist."

    // It does... Set the page right

    /// PAGE MARKERS ///

    // First, remove the active marker from the selected one
    document.querySelectorAll("a[data-mode].active").forEach((el) => {
        // Make it multiple just in case
        el.classList.remove("active")
    })

    // Add the new one
    document.querySelectorAll(`[data-mode="${mode}"]`).forEach((el) => {
        // Add it to the new ones
        el.classList.add("active")
    })


    /// EQUATION ///

    // First, wipe the currect equation
    document.querySelector("section > article > .equation").remove()

    // Create a new equations and start doing shit
    var equEl = document.createElement("div")
    equEl.classList.add("equation")

    // Start rendering the equation
    var equString = modes[mode].equation
    equEl.innerHTML = equString // Immediately render the innerHTML

    // Render variables
    var dollarLast = -1
    do {
        // Look for the variable ($)
        var index = equString.indexOf("$", dollarLast + 1)

        // If the index we're looking at is -1, we're done
        if (index === -1) break

        // Otherwise, let's make an element and render it
        var equSpan = document.createElement("span")
        var attrEdit = document.createAttribute("contenteditable")
        var attrVar = document.createAttribute("data-var")
        attrEdit.value = "true"
        attrVar.value = equString[index + 1]
        equSpan.attributes.setNamedItem(attrEdit)
        equSpan.attributes.setNamedItem(attrVar)

        // Replace the things with the elements
        equEl.innerHTML = equEl.innerHTML.replace(equString[index] + equString[index + 1], equSpan.outerHTML)

        // Ok, next run
        dollarLast = index
    }
    while (dollarLast !== -1)

    // Hook the events into the equation inputs
    equEl.querySelectorAll("span[data-var]").forEach((span) => {
        span.addEventListener("keypress", equEvents.equKeypress)
        span.addEventListener("blur", equEvents.equBlur)
    })

    document.querySelector("section > article").appendChild(equEl)

    // Finally, set the mode internally
    activeMode = mode
}

/***    CANVAS    ***/

/**
 * Canvas
 * @type {HTMLCanvasElement}
 */
var canvas

/**
 * Canvas Context
 * @type {CanvasRenderingContext2D}
 */
var ctx;

var ctxScale = 10

function ctxPredraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Prep some variables
    var ctxCenter = {
        x: canvas.width / 2 + .5,
        y: canvas.height / 2 + .5
    }

    // Set up the ctx
    ctx.font = "14px IBM Plex Mono"

    // Just to begin with, draw a grid
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = "#616161"
    for (var i = 0; i < canvas.width / 2; i += ctxScale) {
        // Right side of center
        ctx.moveTo(ctxCenter.x + i, 0)
        ctx.lineTo(ctxCenter.x + i, canvas.height)
        ctx.stroke()

        // Left side of center
        ctx.moveTo(ctxCenter.x - i, 0)
        ctx.lineTo(ctxCenter.x - i, canvas.height)
        ctx.stroke()
    }
    for (var i = 0; i < canvas.height / 2; i += ctxScale) {
        // Right side of center
        ctx.moveTo(0, ctxCenter.y + i)
        ctx.lineTo(canvas.width, ctxCenter.y + i)
        ctx.stroke()

        // Left side of center
        ctx.moveTo(0, ctxCenter.y - i)
        ctx.lineTo(canvas.width, ctxCenter.y - i)
        ctx.stroke()
    }
    ctx.closePath()

    // Now our axes
    ctx.beginPath()
    ctx.strokeStyle = "#2196F3"
    ctx.moveTo(0, ctxCenter.y)  // x-axis
    ctx.lineTo(canvas.width, ctxCenter.y)
    ctx.stroke()
    ctx.moveTo(ctxCenter.x, 0)
    ctx.lineTo(ctxCenter.x, canvas.height) // y-axis
    ctx.stroke()
    ctx.closePath()

    ctx.fillStyle = "#fafafa"
}

function ctxDraw() {
    // Clear out
    ctxPredraw()

    // Check if all the requirements for the current mode have been set
    var requirementsMet = true
    modes[activeMode].parameters.forEach((param) => {
        // If a variable doesn't match up, trip the requirements thing
        if (eval(equVars[param]) === undefined)
            requirementsMet = false
    })
    if (!requirementsMet) return false

    // Create the variables for further use
    var r = eval(equVars["r"])
    var h = eval(equVars["h"])
    var k = eval(equVars["k"])
    var a = eval(equVars["a"])
    var b = eval(equVars["b"])
    var m = eval(equVars["m"])

    var ctxCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }

    var lastPoint = { x: NaN, y: NaN }
    ctx.beginPath()
    ctx.strokeStyle = "#f44336"
    for (var i = 0 - ctxCenter.x; i < ctxCenter.x; i++) {
        var y = modes[activeMode].y(i / ctxScale) * ctxScale

        ctx.moveTo(ctxCenter.x + lastPoint.x, ctxCenter.y - lastPoint.y)
        ctx.lineTo(ctxCenter.x + i, ctxCenter.y - y)
        if (modes[activeMode].dualSided) {
            ctx.moveTo(ctxCenter.x + lastPoint.x, ctxCenter.y - (k * 2 * ctxScale) + lastPoint.y)
            ctx.lineTo(ctxCenter.x + i, ctxCenter.y - (k * 2 * ctxScale) + y)
        }
        if (i !== 0 - ctxCenter.x) ctx.stroke()

        lastPoint.x = i
        lastPoint.y = y
    }
    ctx.closePath()
}

/***    PAGE    ***/

document.addEventListener("DOMContentLoaded", () => {
    /// MODE SETUP ///

    // Read out the modes and display them
    Object.keys(modes).forEach((mode) => {
        // Create an element
        var el = document.createElement("a")

        // Add a null link and attributes
        var attrHref = document.createAttribute("href"); attrHref.value = "#"
        var attrMode = document.createAttribute("data-mode"); attrMode.value = mode
        el.attributes.setNamedItem(attrHref)
        el.attributes.setNamedItem(attrMode)
        el.innerHTML = modes[mode].title

        // Hook up
        el.addEventListener("click", (ev) => {
            setMode(ev.target.attributes.getNamedItem("data-mode").value)
        })

        // Now add the element
        document.querySelector("main > section > aside").appendChild(el)
    })

    // Finally set the right mode
    setMode(activeMode)  // `activeMode` shouldn't have changed by now


    /// CANVAS SETUP ///

    // Assign the canvas element and load it up, baby!
    canvas = document.querySelector("body > main > canvas")
    ctx = canvas.getContext("2d")

    // Render the grid
    ctxPredraw()
})