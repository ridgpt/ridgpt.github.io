// Function to create and display the modal based on device type
function createModal(modalFileName, deviceType) {
    // Check if the modal has been closed before
    const isModalClosed = localStorage.getItem('modalClosed');
    if (isModalClosed === 'true') {
        return; // Do not show the modal again if it has been closed before
    }

    // Fetch the modal content from the specified HTML file
    fetch(modalFileName)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load the splash screen: ${response.statusText}`);
            }
            return response.text();
        })
        .then((data) => {
            // Create a container for the fetched content
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = data.trim(); // Insert the fetched HTML into the container

            // Get the modal and modal content elements
            const modal = modalContainer.querySelector('.modal');
            const modalContent = modal.querySelector('.modal-content');

            // Create the background blur layer
            const blurLayer = document.createElement('div');
            blurLayer.className = 'background-blur';
            document.body.appendChild(blurLayer);

            // Append the modal to the body
            document.body.appendChild(modal);

            // Display the modal and blur layer
            blurLayer.style.display = 'block';
            modal.style.display = 'block';

            // Populate app instructions based on the device type
            const appInstructions = modalContent.querySelector('#appInstructions');
            if (appInstructions) {
                if (deviceType === 'ios') {
                    appInstructions.innerHTML = `
                        <hr>
                        <h6 class="reshed" style="margin-bottom: 0px;">How To Try The App <i class="fa-solid fa-chevron-down gradient-icon"></i></h6>
                        <h6 class="reshed" style="font-size: 0.7rem;">For the best experience, it is recommended that you try using the RidGPT iOS app. <i class="fa-solid fa-circle-info"></i></h6>
            <h6 style="text-align: left; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8">Click the "share" button. <i class="fa-solid fa-arrow-up-right-from-square"></i></h6></span>
            <h6 style="text-align: left; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8">Click "add to home screen". <i class="fa-regular fa-square-plus"></i></h6></span>
            <h6 style="text-align: left; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8">Click "add". <i class="fa-regular fa-circle-check"></i></h6></span>
                    `;
                } else if (deviceType === 'android') {
                    appInstructions.innerHTML = `
                        <hr>
                        <h6 class="reshed" style="margin-bottom: 0px;">How To Try The App <i class="fa-solid fa-chevron-down gradient-icon"></i></h6>
                        <h6 class="reshed" style="font-size: 0.7rem; margin-bottom: 20px;">For the best experience, it is recommended that you try using the RidGPT Android app. <i class="fa-solid fa-circle-info"></i></h6>
            <h6 style="text-align: left; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8">Download the app file by clicking </span><a href="/RidGPT.apk">here</a><span style="opacity: 0.8;">. <i class="fa-solid fa-file-arrow-down"></i></span></h6>
            <h6 style="text-align: left; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8">Install the app file. <i class="fa-solid fa-arrows-down-to-line"></i></h6></span>
                    `;
                }
            } else {
                console.error('App installation instructions unavailable.');
            }

            // Add close functionality for the modal
            const closeModalButton = modalContent.querySelector('.close');
            if (closeModalButton) {
                closeModalButton.onclick = function () {
                    modal.classList.add('fade-out'); // Add the fade-out class
                    setTimeout(() => {
                        modal.style.display = 'none';
                        blurLayer.style.display = 'none'; // Hide the blur layer on close
                        document.body.removeChild(modal); // Remove modal from DOM on close
                        document.body.removeChild(blurLayer); // Remove blur layer from DOM on close
                        localStorage.setItem('modalClosed', 'true'); // Set the flag to not show the modal again
                    }, 500); // Match this timeout with the CSS transition duration (0.5s)
                };
            }

            // Close the modal when clicking outside the modal content
            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.classList.add('fade-out'); // Add the fade-out class
                    setTimeout(() => {
                        modal.style.display = 'none';
                        blurLayer.style.display = 'none'; // Hide the blur layer on close
                        document.body.removeChild(modal); // Remove modal from DOM on close
                        document.body.removeChild(blurLayer); // Remove blur layer from DOM on close
                        localStorage.setItem('modalClosed', 'true'); // Set the flag to not show the modal again
                    }, 500); // Match this timeout with the CSS transition duration (0.5s)
                }
            };
        })
        .catch((error) => console.error('Error loading the splash screen:', error));
}

// Detect the device type and call the modal creation function
const isAndroid = /Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// Use a common HTML file for the modal and customize based on OS
createModal('modal.html', isIOS ? 'ios' : (isAndroid ? 'android' : 'other'));

async function loadDataset() {
    const response = await fetch('dataset.json');
    if (!response.ok) {
        throw new Error("Failed to load the dataset.");
    }
    return await response.json();
}

function preprocessData(data) {
    return data.map(item => ({
        text: item.text.toLowerCase().replace(/[^a-z0-9\s]/g, ''),
        label: item.label
    }));
}

function encodeText(data, maxLength) {
    const vocab = {};
    let index = 0;

    // Build vocabulary
    data.forEach(item => {
        item.text.split(' ').forEach(word => {
            if (!vocab[word]) {
                vocab[word] = index++;
            }
        });
    });

    // Encode data with padding/truncating to maxLength
    const encodedData = data.map(item => {
        const encoded = item.text.split(' ').map(word => vocab[word] || -1);

        // Padding or truncating to maxLength
        const paddedEncoded = encoded.length < maxLength
            ? [...encoded, ...Array(maxLength - encoded.length).fill(-1)]  // Pad with -1
            : encoded.slice(0, maxLength);  // Truncate to maxLength

        return { encoded: paddedEncoded, label: item.label };
    });

    return { encodedData, vocab };
}

function createModel(inputShape) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
    return model;
}

async function trainModel(model, trainingData) {
    const xs = tf.tensor2d(trainingData.map(item => item.encoded));
    const ys = tf.tensor2d(trainingData.map(item => item.label), [trainingData.length, 1]);

    const earlyStopping = tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 5,
    });

    await model.fit(xs, ys, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: [earlyStopping]
    });
}

async function analyzeContent(model, vocab, text) {
    const maxLength = 40;
    const encodedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '')
        .split(' ').map(word => vocab[word] || -1);

    const paddedEncodedText = encodedText.length < maxLength
        ? [...encodedText, ...Array(maxLength - encodedText.length).fill(-1)]
        : encodedText.slice(0, maxLength);

    const inputTensor = tf.tensor2d([paddedEncodedText]);
    const prediction = model.predict(inputTensor);
    const result = await prediction.data();

    const aiProbability = result[0];
    const humanProbability = 1 - aiProbability;

    return {
        text: aiProbability >= 0.5 
            ? 'generated by <span style="color: rgba(255, 0, 0, 1);">AI</span>, and not composed by a <span style="color: rgba(0, 209, 0, 1);">human</span>. <i class="fa-solid fa-gears"></i>' 
            : 'composed by a <span style="color: rgba(0, 209, 0, 1);">human</span>, and not generated by <span style="color: rgba(255, 0, 0, 1);">AI</span>. <i class="fa-solid fa-pen"></i>',
        aiPercentage: (aiProbability * 100).toFixed(2),
        humanPercentage: (humanProbability * 100).toFixed(2)
    };
}

async function retrainModel(newDataset) {
    const preprocessedData = preprocessData(newDataset);
    const { encodedData, vocab } = encodeText(preprocessedData, 40);

    let model;
    try {
        model = await loadModel();
    } catch (error) {
        console.error("Content checker failed to load, refining:", error);
        model = createModel([40]);
    }

    await trainModel(model, encodedData);
    await model.save('localstorage://ridgpt');
}

async function loadModel() {
    return await tf.loadLayersModel('localstorage://ridgpt');
}

// Event listener for content checking
document.getElementById('checkBtn').addEventListener('click', async function() {
    const content = document.getElementById('contentInput').value.trim();
    const resultElement = document.getElementById('result');
    const loader = document.getElementById('loader');

    if (!content) {
        alert("Please enter some content into the content input.");
        return;
    }

    loader.style.display = 'block';
    resultElement.style.display = 'none'; // Hide result element initially

    try {
        const dataset = await loadDataset();
        const preprocessedData = preprocessData(dataset);
        const { encodedData, vocab } = encodeText(preprocessedData, 40);

        let model;
        try {
            model = await loadModel();
        } catch (error) {
            console.error("Content checker failed to load, refining.");
            model = createModel([40]);
            await trainModel(model, encodedData);
        }

        const analysisResult = await analyzeContent(model, vocab, content);

        loader.style.display = 'none';
        resultElement.innerHTML = `
<button id="retrainBtn" style="margin-top: 0px; margin-bottom: 0px;">
    Refine Content Checker <i class="fa-solid fa-rotate-right"></i>
    <h6 class="small" style="margin-top:0px;">Only attempt to refine the content checker when delayed results and/or inaccurate results become frequent. <i class="fa-solid fa-circle-info"></i></h6>
</button>
<hr style="margin-bottom: 0px; width; 100%;">
            <h6 class="reshed" style="margin-top: 20px;margin-bottom:0px;">Results <i class="fa-solid fa-chevron-down gradient-icon"></i></h6>
                        <h6 class="reshed" style="font-size:0.7rem;">Never use these results to make decisions on someone's academic standing or career, as these results may not always be accurate. <i class="fa-solid fa-triangle-exclamation"></i></h6>
        
                        <h6 class="reshed" style="font-size:0.7rem; margin-top: 20px;">Involvements  <i class="fa-solid fa-hands"></i></h6>
            
            <h6 style="margin-top: 20px; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8;"><span style="color: rgba(255, 0, 0, 1);">AI</span> Involvement: ${analysisResult.aiPercentage}% <i class="fa-solid fa-robot"></i></span></h6>

            <h6 style="margin-bottom: 0px; opacity: 1;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8;"> <span style="color: rgba(0, 209, 0, 1);">Human</span> Involvement: ${analysisResult.humanPercentage}% <i class="fa-solid fa-brain"></i></span></h6>

                        <h6 class="reshed" style="font-size:0.7rem; margin-top: 20px; margin-bottom: 20px;">Summary  <i class="fa-solid fa-list"></i></h6>

            <h6 style="opacity: 1; margin-bottom: 0px;"><i class="fa-solid fa-chevron-right gradient-icon"></i> <span style="opacity: 0.8;"> This content was ${analysisResult.text}</span></h6>
        `;

        // Only display result element if analysisResult is valid
        if (analysisResult) {
            resultElement.style.display = 'block';
        } else {
            resultElement.style.display = 'none'; // Hide if no valid result
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred. Check the console for details.");
        loader.style.display = 'none';
        resultElement.style.display = 'none'; // Ensure no space under button if error occurs
    }
});

// Event listener for retraining the model
document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'retrainBtn') {
        retrainChecker(event.target); // Pass the clicked button to retrainChecker function
    }
});

async function retrainChecker(button) {
    const newDataset = await loadDataset();

    // Change button text to "Refinement In Progress" while retraining
    const originalButtonText = button.innerHTML; 
    button.innerHTML = 'Refinement In Progress <i class="fa-solid fa-rotate-right fa-spin"></i>';
    button.disabled = true; // Disable button during retraining to prevent multiple clicks

    try {
        await retrainModel(newDataset);
        alert("Content checker successfully refined.");
    } catch (error) {
        console.error("Error while refining the content checker:", error);
        alert("Failed to refine the content checker. Check the console for details.");
    } finally {
        // Restore button text and re-enable it after retraining
        button.innerHTML = originalButtonText;
        button.disabled = false;
    }
}

function showModal(modalElement) {
    // Apply transformation first
    modalElement.style.transition = 'none'; // Disable transition for instant transformation
    modalElement.style.transform = 'translate(-50%, -50%)';

    // Force a reflow to ensure the transformation is applied
    modalElement.offsetHeight; // This triggers the browser to apply the transform immediately

    // Re-enable transitions and add animation
    setTimeout(() => {
        modalElement.style.transition = 'transform 0.3s ease-out'; // Re-enable transition
        modalElement.classList.add('animate'); // Add the animation class to trigger fade-in
    }, 10); // Small timeout to ensure the transformation is applied before animation starts
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal-content');
    showModal(modal); // Call function to show the modal
});