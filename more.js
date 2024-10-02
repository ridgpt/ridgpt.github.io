// more.js

// Modal on page load
window.onload = function() {
    const modal = document.getElementById('modal');

    // Check if the modal has been closed before
    if (!localStorage.getItem('modalClosed')) {
        modal.classList.add('show'); // Show modal
    }
};

// Close modal with animation
document.getElementById('closeModalBtn').addEventListener('click', function() {
    const modal = document.getElementById('modal');
    modal.classList.add('fade-out'); // Trigger fade-out animation

    // After animation ends, hide the modal
    setTimeout(() => {
        modal.classList.remove('show', 'fade-out');
        localStorage.setItem('modalClosed', 'true'); // Set a flag in localStorage
    }, 500); // Match the duration of the fade-out animation (0.5s)
});