// Version fetcher
async function fetchCommitCount() {
    const username = 'ridgpt';
    const repository = 'ridgpt.github.io';
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/commits`;
    let commitCount = 0;
    let page = 1;
    const perPage = 100; // Maximum number of results per page

    try {
        while (true) {
            const response = await fetch(`${apiUrl}?per_page=${perPage}&page=${page}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error encountered. Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.length === 0) break; // Break if no more commits

            commitCount += data.length; // Increment total commit count
            page++; // Move to the next page
        }

        updateVersion(commitCount);
    } catch (error) {
        console.error('Error fetching version:', error.message, error);
    }
}

function updateVersion(commitCount) {
    const major = 1;  // Major version
    const minor = 0;  // Minor version
    const patch = commitCount; // Use commit count for the patch version

    // Create the semantic version string
    const version = `${major}.${minor}.${patch}`;
    
    // Update the version display on the webpage
    document.getElementById('version-number').innerHTML = `v${version}-experimental <i class="fa-solid fa-flask"></i>`;
}

// Call the function to fetch commit count and update version
fetchCommitCount();

// Animate version badge on click
const animatedElement = document.getElementById('version-number');
let clickCount = 0;

animatedElement.addEventListener('click', () => {
  clickCount++;

  // Check if the element has been clicked twice
  if (clickCount === 2) {
    // Remove the class (if it exists) to restart the animation
    animatedElement.classList.remove('shake');

    // Trigger a reflow to reset the animation
    void animatedElement.offsetWidth;

    // Add the class to trigger the animation
    animatedElement.classList.add('shake');

    // Reset the click count after the animation
    clickCount = 0;
  }
});