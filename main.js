let pause = false;

function init()
{
    // Get a reference to the canvas
    canvas = document.getElementById("canvas");

    // Set the canvas size
    canvas.width = 512;
    canvas.height = 512;

    // Get a 2D context for the drawing canvas
    // 2d canvas
    canvas.ctx = canvas.getContext("2d");

    // Create an image data array
    // setting pixel to canvas and imgData => ed array
    canvas.imgData = canvas.ctx.createImageData(canvas.width, canvas.height);

    // If a location hash is specified
    if (location.hash !== '')
    {
        console.log('parsing program');

        program = Program.fromString(
            location.hash.substr(1),
            canvas.width,
            canvas.height
        );
    }
    else
    {
        // Create a random program
        randomProg();
    }

    // Set the update function to be called regularly
    updateInterv = setInterval(
        updateRender,
        UPDATE_TIME  // update after 40 ms
    );
}
window.addEventListener("load", init, false);

/*
Generate a new random program
*/
function randomProg()
{
    var numStates = parseInt(document.getElementById("numStates").value);
    var numSymbols = parseInt(document.getElementById("numSymbols").value);

    assert (
        numSymbols <= colorMap.length,
        colorMap.length + ' states currently supported'
    );

    console.log('num states: ' + numStates);
    console.log('num symbols: ' + numSymbols);

    program = new Program(numStates, numSymbols, canvas.width, canvas.height);

    // Set the sharing URL
    var str = program.toString();
    var url = location.protocol + '//' + location.host + location.pathname;
    var shareURL = url + '#' + str;
    document.getElementById("shareURL").value = shareURL;

    // Clear the current hash tag to avoid confusion
    location.hash = '';
}

/*
Reset the program state
*/
function restartProg()
{
    program.reset();
}

function pauseProg()
{
    pause = !pause;
    console.log('pauseProg click');
}


// Default console logging function implementation
if (!window.console) console = {};
console.log = console.log || function(){};
console.warn = console.warn || function(){};
console.error = console.error || function(){};
console.info = console.info || function(){};

//============================================================================
// Image update code
//============================================================================

/*
 Map of symbols (numbers) to colors
*/
var colorMap = [
    255,255,255,    // White // Initial symbol color
    255,255,0  ,
    0  ,255,0  ,    
    255,0  ,255,
    0  ,255,255,
    255,0  ,0  ,    
    0  ,0  ,0  ,    
    0  ,0  ,255,  
];

/*
 Time per update, in milliseconds
*/
var UPDATE_TIME = 40;

function slowProg()
{
    UPDATE_TIME = 8000;
    UPDATE_ITRS = 35000000;
    console.log('UPDATE_TIME = ',UPDATE_TIME);
}

function fastProg()
{
    UPDATE_TIME = 5;
    UPDATE_ITRS = 350000;
    console.log('UPDATE_TIME = ',UPDATE_TIME);
}
/*
Maximum iterations per update
*/
var UPDATE_ITRS = 350000;

/*
Update the rendering
*/
function updateRender()
{
    if(pause)   return;

    var startTime = (new Date()).getTime();
    var startItrc = program.itrCount;

    // Until the update time is exhausted
    for (;;)
    {
        // Update the program
        program.update(5000);

        var curTime = (new Date()).getTime();
        var curItrc = program.itrCount;

        if (curItrc - startItrc >= UPDATE_ITRS ||
            curTime - startTime >= UPDATE_TIME)
            break;
    }

    /*
    console.log(
        'x: ' + program.xPos + 
        ', y: ' + program.yPos + 
        ', st: ' + program.curState +
        ', cc: ' + program.itrCount
    );
    */

    // Produce the image data
    var data = canvas.imgData.data;
    var map = program.map;
    for (var i = 0; i < map.length; ++i)
    {
        var sy = map[i];

        var r = colorMap[3 * sy + 0];
        var g = colorMap[3 * sy + 1];
        var b = colorMap[3 * sy + 2];

        // R G B A
        data[4 * i + 0] = r;
        data[4 * i + 1] = g;
        data[4 * i + 2] = b;
        data[4 * i + 3] = 255;
    }

    // console.log('data = ', data);

    assert (
        program.map.length * 4 === data.length,
        'invalid image data length'
    );

    // Show the image data
    canvas.ctx.putImageData(canvas.imgData, 0, 0);
}

