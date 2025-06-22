// Define the path to the exported RNBO patcher JSON file
const patchExportURL = "patch.export.json";

// Create a new AudioContext for managing and playing audio
const context = new AudioContext();

// Create a GainNode for volume control
const outputNode = context.createGain();

// Connect the gain node to the device's audio output (speakers/headphones)
outputNode.connect(context.destination);

// Select the <button> element from the HTML document
let button = document.querySelector("button");

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

    // Connect the RNBO device’s audio output to the gain node
    device.node.connect(outputNode);

    // Add an event listener for when the button is pressed down
    button.addEventListener('pointerdown', async () => {
        // Resume the AudioContext if it's not already running (required by browsers)
        if (context.state !== 'running') {
            await context.resume();
        }

        // Set the "play" parameter to 1 (on)
        play.value = 1;

        // Log the current value of "play" for debugging
        console.log(play.value);
    });

    // Add an event listener for when the button is released
    button.addEventListener('pointerup', () => {
        // Set the "play" parameter to 0 (off)
        play.value = 0;

        // Log "off" to the console for debugging
        console.log("off");
    });
};

// Call the setup function to start everything
setup();
