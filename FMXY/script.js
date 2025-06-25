const svg = document.getElementById("xyInterface");
const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("r", 20);
circle.style.display = "none";
svg.appendChild(circle);

let isTouching = false;


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
    let play = device.parametersById.get("play");

    let rnboX = device.parametersById.get("x");
    let rnboY = device.parametersById.get("y");

    // Connect the RNBO device’s audio output to the gain node
    device.node.connect(outputNode);

    // Add an event listener for when the button is pressed down

    svg.addEventListener("pointerdown", async (evt)=>{
        const { x, y, nx, ny } = getNormalizedCoords(evt);
        updateCircle(x, y);
        isTouching = true;

        evt.preventDefault();

        console.log("start~!");
        play.value = 1;
        rnboX.value = nx;
        rnboY.value = ny;
    });

    svg.addEventListener("pointermove", async(evt)=>{

        if (!isTouching) return;
        const { x, y, nx, ny } = getNormalizedCoords(evt);
        updateCircle(x, y);
        console.log({ x: nx.toFixed(3), y: ny.toFixed(3), touched: true });
        rnboX.value = nx;
        rnboY.value = ny;
    });

    svg.addEventListener("pointerup", async (evt)=>{
        isTouching = false;

        circle.style.display = "none";
        // console.log({ touched: false });
        play.value = 0;
    });


};

const splash = document.getElementById("splash");


if (context){
    context.onstatechange = ()=>{
        // console.log("AudioContext resumed.");
        if (context.state === "running"){
            splash.style.display = "none";
        }

        // now run your actual patch setup
    }
}
splash.addEventListener("pointerdown",  () => {

        context.resume();
        splash.innerText = "Loading..."

});

setup()
