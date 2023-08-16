//
// Test Page Functions
//

// Capture stop audio click
var interruptClicked = false;
var currentRowIndex = -1;


//
// End test
//
function endTest(testNumber, nextPageState) {

	// Record end time
	endTime = Date.now();

	// Get entered values
	let inputFields = document.querySelectorAll("#validation-content-" + testNumber + " input");
	let inputValues = [];
	for (let field of inputFields) {
		inputValues.push(field.value);
	}

	// Record test results
	recordTestResults(testNumber, endTime, inputValues, nextPageState);

	// Update page state
	updatePageState(nextPageState);
}

//
// User interrupted audio playback
//
function interruptAudio(event) {

	// Set interrupt flag
	interruptClicked = true;

	// Stop audio
	let currentAudio = document.querySelector("#audio-" + currentRowIndex);
	if (currentAudio) {

		// Stop audio
		currentAudio.pause();
		currentAudio.currentTime = 0;

		// Reset cell image transforms
		let imageField = document.getElementById("cell-image-" + currentRowIndex);
		imageField.style = "";
	}

	// Call finished handler explicitly
	// (for situations where the audio was interrupted)
	onAudioFinished(currentRowIndex);

	return false;
}

//
// Audio finished playing
//
function onAudioFinished(rowIndex) {
	
	// Check if interrupt was clicked
	if (interruptClicked) {

		// Reset interrupt flag
		interruptClicked = false;

		// Remove interrupt listener
		removeEventListener("mousedown", interruptAudio, true);

		// Focus interrupted field
		let interruptedField = document.querySelector("#audio-" + rowIndex + " ~ input");
		if (interruptedField) {

			// Shade field background
			interruptedField.style.background = "#ffe0e0";
			window.setTimeout(() => interruptedField.style.background = "#ffffff", 1000);

			// Put cursor in field
			interruptedField.select();
			window.setTimeout(() => interruptedField.focus(), 0);
		}
	}
	else {

		// No interrupt, so play next audio
		nextRowId = rowIndex + 1;
		playAudio(nextRowId);
	}
}

//
// User changed field value
//
function onValueChanged(field) {

	// Get the new value
	newValue = field.value;

	// Get row element and row ID
	rowElement = field.parentElement.parentElement;
	rowId = rowElement.dataset.id;

	// Clear the row's audio
	audioElement = document.getElementById("audio-" + rowId);
	audioElement.dataset.status = "updating";

	// Create temporary form
	let audioChangeForm = document.createElement("form");
	audioChangeForm.method = "POST";
	let formData = new FormData(audioChangeForm);
	formData.append("value-string", newValue);

	// Update audio string
	fetch("/create-audio-string", { method: "POST", body: formData })
		.then(response => response.json())
		.then(responseData => {

			// Update the audio string
			newAudioString = responseData["audio_string"];
			audioElement.src = newAudioString;

			// Clear updating flag
			audioElement.dataset.status = "";
		})
		.catch(error => {
			// Error
			console.log(error);
			window.location.href = "/error.html";
		});
}

//
// Play audio sample
//
function playAudio(rowIndex) {

	// Set interrupt handler
	addEventListener("mousedown", interruptAudio, true);
	currentRowIndex = rowIndex;

	// Clear highlighting and selection from all input fields
	resetTranscribedFields();

	// Get control references
	let audioSample = document.getElementById("audio-" + rowIndex)
	let imageField = document.getElementById("cell-image-" + rowIndex);
	if (!audioSample) return;

	// Highlight image field
	imageField.style = "border: 2px solid red; transform: scale(1.4);";

	// Check for updating audio
	if (audioSample.dataset.status == "updating") {

		// Wait for update to finish
		window.setTimeout(() => playAudio(rowIndex), 500);
	}

	// Unhighlight field on audio end
	audioSample.onended = () => {
		imageField.style = "";
	}

	// Set finished event handler
	audioSample.addEventListener("ended", () => onAudioFinished(rowIndex), false);

	// Play the audio
	audioSample.play();

	// Don't execute default action if invoked directly
	return false;
}

//
// Record test results
//
function recordTestResults(testNumber, endTime, inputValues, nextPageState) {

	// Get form object for submission
	let pageForm = document.getElementById("test-form-" + testNumber);
	let formData = new FormData(pageForm);

	// Store end time
	formData.append("test-end-time", endTime);

	// Store test values
	formData.append("test-values", inputValues);

	// Send results to backend
	fetch("/record-test-results", { method: "POST", body: formData })
		.then(response => response.json())
		.then(responseData => {

			// Save test ID in Test 2 form
			testId = responseData["test_id"];
			fieldTestId = document.querySelector("#test-form-2 #test-id");
			fieldTestId.value = testId;

			// Display validation page
			updatePageState(nextPageState);
		})
		.catch(error => {
			// Error
			console.log(response);
			window.location.href = "/error.html";
		});
}

//
// Reset formatting on transcribed fields
//
function resetTranscribedFields() {

	// Get field container
	inputFields = document.querySelectorAll("#validation-content-2 input");

	// Reset input fields
	for (inputField of inputFields) {
		inputField.style = "";
		inputField.blur();
	}
}

//
// Start test
//
function startTest(testNumber, nextState) {

	// Record start time
	startTimeField = document.querySelector("#test-form-" + testNumber + " #test-start-time");
	startTimeField.value = Date.now();

	// Update page state
	updatePageState(nextState);
}

//
// Update visible page sections
//
function updatePageState(visibleSectionIndex) {

	// Set all section visibilities
	for (let i = 1; i <= 6; i++) {

		// Get section reference
		let section = document.getElementById("validation-test-" + i);

		// Hide section if not indicated
		if (i != visibleSectionIndex) {
			section.style.display = "none";
		}
		else {
			// Show indicated section
			section.style.display = "block";
		}
	}
}