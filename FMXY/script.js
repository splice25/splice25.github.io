const svg = document.getElementById("xyInterface");
const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("r", 20);
circle.style.display = "none";
svg.appendChild(circle);

let isTouching = false;
let play, rnboX, rnboY

function getNormalizedCoords(evt) {
    const rect = svg.getBoundingClientRect();
    const x = evt.clientX;
    const y = evt.clientY;
    const nx = x / rect.width;
    const ny = y / rect.height;
    return { x, y, nx, ny };
}

function updateCircle(x, y) {
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.style.display = "block";
}

function handleStart(evt) {
    if(context.state === 'suspended'){
        context.resume()
    }
    evt.preventDefault();
    isTouching = true;
    const { x, y, nx, ny } = getNormalizedCoords(evt);
    updateCircle(x, y);
    console.log({ x: nx.toFixed(3), y: ny.toFixed(3), touched: true });
    play.value = 1;
    rnboX.value = nx;
    rnboY.value = ny;
}

function handleMove(evt) {
    if (!isTouching) return;
    const { x, y, nx, ny } = getNormalizedCoords(evt);
    updateCircle(x, y);
    console.log({ x: nx.toFixed(3), y: ny.toFixed(3), touched: true });
    rnboX.value = nx;
    rnboY.value = ny;
}

function handleEnd(evt) {
    isTouching = false;
    circle.style.display = "none";
    console.log({ touched: false });
    play.value = 0;
}

svg.addEventListener("pointerdown", handleStart);
// svg.addEventListener("mousedown", handleStart);
// svg.addEventListener("touchstart", handleStart);
svg.addEventListener("pointermove", handleMove);
// svg.addEventListener("mousemove", handleMove);
// svg.addEventListener("touchmove", handleMove);
svg.addEventListener("pointerup", handleEnd);
// svg.addEventListener("mouseup", handleEnd);
// svg.addEventListener("touchend", handleEnd);



// Define the path to the exported RNBO patcher JSON file
const patchExportURL = "patch.export.json";

// Create a new AudioContext for managing and playing audio
const context = new AudioContext();

// Create a GainNode for volume control
const outputNode = context.createGain();

// Connect the gain node to the device's audio output (speakers/headphones)
outputNode.connect(context.destination);



// Define an asynchronous setup function to initialize the RNBO device
const setup = async () => {
    // Fetch the exported RNBO patch JSON file from the provided URL
    let response = await fetch(patchExportURL);

    // Parse the JSON response into a JavaScript object
    let patcher = await response.json();

    // Create an RNBO device using the AudioContext and patch data
    let device = await RNBO.createDevice({ context, patcher });

    // Get a reference to the "play" parameter from the RNBO device
    play = device.parametersById.get("play");

    rnboX = device.parametersById.get("x");
    rnboY = device.parametersById.get("y");

    // Connect the RNBO device’s audio output to the gain node
    device.node.connect(outputNode);

    // Add an event listener for when the button is pressed down
    // onoffCtl.addEventListener('input', async (event) => {
    //     // Resume the AudioContext if it's not already running (required by browsers)
    //     if (context.state === 'suspended') {
    //         await context.resume();
    //     }
    //     if (event.target.checked){
    //         // Set the "play" parameter to 1 (on)
    //         play.value = 1;
    //     } else {
    //         // Set the "play" parameter to 0 (off)
    //         play.value = 0;
    //     }
    //
    //
    // });
    //
    // bpmCtl.addEventListener('input', (event)=>{
    //     bpm.value = parseFloat(event.target.value)
    // })

    // Add an event listener for when the button is released
    // button.addEventListener('pointerup', () => {
    //     // Set the "play" parameter to 0 (off)
    //     play.value = 0;
    //
    //     // Log "off" to the console for debugging
    //     console.log("off");
    // });
};

// Call the setup function to start everything
setup();
