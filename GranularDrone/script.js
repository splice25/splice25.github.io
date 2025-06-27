// ================================
// Setup and Initialization
// ================================

// Path to the RNBO patcher JSON export file
const patchExportURL = "patch.export.json";

// Create an AudioContext for audio processing
const context = new AudioContext();

// Create a GainNode to control overall volume
const outputNode = context.createGain();

// Connect the gain node to the device's output (speakers/headphones)
outputNode.connect(context.destination);

// Get reference to the toggle switch input element
let onoffCtl = document.getElementById("onOff");

// Get reference to the range slider input element
let granularCraziness = document.getElementById("granCrazy");

// Request microphone access and create an audio source node from it
const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = context.createMediaStreamSource(micStream);

// ================================
// RNBO Device Setup
// ================================

const setup = async () => {
    // Fetch the patcher JSON definition
    let response = await fetch(patchExportURL);
    let patcher = await response.json();

    // Create an RNBO device using the AudioContext and the patch data
    let device = await RNBO.createDevice({ context, patcher });

    // Route live mic input into the RNBO patch
    source.connect(device.node);

    // Route RNBO patch output to the gain node (and then to speakers)
    device.node.connect(outputNode);

    // Get parameter references from the RNBO patch by ID
    let play = device.parametersById.get("play"); // Master playback control
    let rate = device.parametersById.get("p_obj-1/rate"); // Grain rate
    let grainDuration = device.parametersById.get("p_obj-1/grainDur"); // Grain duration
    let jitter = device.parametersById.get("p_obj-1/inJitter"); // Grain randomness

    // ================================
    // Toggle Button Event Listener
    // ================================

    // When the toggle is interacted with
    onoffCtl.addEventListener('input', async (event) => {
        // Resume AudioContext if it’s not running (required for mobile)
        if (context.state === 'suspended') {
            await context.resume();
            console.log("Audio on");
        }

        // Toggle the play state based on checkbox value
        if (event.target.checked) {
            play.value = 1; // Start playback
        } else {
            play.value = 0; // Stop playback
        }
    });

    // ================================
    // Slider Event Listener
    // ================================

    // When the slider is adjusted
    granularCraziness.addEventListener('input', (event) => {
        const value = parseFloat(event.target.value); // Get current slider value

        // Linearly scale each parameter based on slider position

        // Grain rate increases with slider value
        rate.value = value * (rate.max - rate.min) + rate.min;

        // Grain duration decreases with slider value (inverse relation)
        grainDuration.value = (1 - value) * (grainDuration.max - grainDuration.min) + grainDuration.min;

        // Jitter increases with slider value
        jitter.value = value * (jitter.max - jitter.min) + jitter.min;

        // Log parameter values for debugging
        console.log(rate.value, grainDuration.value, jitter.value);
    });
};

// Start the setup process
setup();
