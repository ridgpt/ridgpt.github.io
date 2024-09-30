// results.js

// Function to calculate the Levenshtein distance
        function levenshteinDistance(a, b) {
            const matrix = [];

            // Initialize the first row and column of the matrix
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }

            // Populate the matrix
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1,    // Deletion
                            matrix[i][j - 1] + 1,    // Insertion
                            matrix[i - 1][j - 1] + 1 // Substitution
                        );
                    }
                }
            }

            return matrix[b.length][a.length];
        }

        // Function to find the closest matches
        function findClosestMatch(input) {
            const threshold = 5; // Adjust the threshold as needed
            let closestMatches = [];

            for (const fact in factList) {
                const distance = levenshteinDistance(input.toLowerCase(), fact);
                if (distance < threshold) {
                    closestMatches.push(fact);
                }
            }

            return closestMatches;
        }

        document.getElementById('checkBtn').addEventListener('click', function() {
            const factInputElement = document.getElementById('factInput');
            const fact = factInputElement.value.trim().toLowerCase();
            const resultElement = document.getElementById('result');
            const suggestionsElement = document.getElementById('suggestions');

            // Clear previous results
            resultElement.classList.remove('show', 'real', 'fake');
            suggestionsElement.classList.remove('show');

            // Check if input is empty
            if (!fact) {
                alert("Please enter a fact.");
                return;
            }

            // Check if the fact exists in our predefined list
            const classification = factList[fact];
            let resultText = "";
            let resultClass = "";

            if (classification) {
                resultText = `This fact is likely to be <b>${classification}</b>.`;
                resultClass = classification === "real" ? "real" : "fake";
            } else {
                resultText = "This fact does not currently exist within the database.";
                const closestMatches = findClosestMatch(fact);
                if (closestMatches.length > 0) {
                    suggestionsElement.innerHTML = "Did you mean: " + closestMatches.join(', ') + "?";
                    suggestionsElement.classList.add('show');
                }
            }

            // Update the result
            resultElement.innerHTML = resultText;
            if (resultClass) {
                resultElement.classList.add('show', resultClass);
            } else {
                resultElement.classList.add('show');
            }
        });
