document.addEventListener('DOMContentLoaded', function () {
    function setupCountingAnimation(containerId, targetNumber, duration, steps) {
        let countingContainer = document.getElementById(containerId);

        function updateCounter(value) {
            countingContainer.textContent = Math.round(value);
        }

        function animateCounter() {
            let currentNumber = 0;
            const increment = targetNumber / steps;
            const interval = duration / steps;

            function updateAndCheck() {
                currentNumber += increment;
                updateCounter(currentNumber);

                if (currentNumber >= targetNumber) {
                    currentNumber = targetNumber;
                    updateCounter(currentNumber);
                    clearInterval(timer);
                }
            }

            const timer = setInterval(updateAndCheck, interval);
            updateAndCheck(); // Update immediately to show the initial value
        }

        // Set up the Intersection Observer
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countingContainer.style.opacity = 1;
                    animateCounter();
                } else {
                    // Reset the counting container when it leaves the viewport
                    countingContainer.textContent = '0';
                }
            });
        }, { threshold: 0.5 }); // Adjust the threshold as needed

        // Observe the countingContainer
        observer.observe(countingContainer);
    }

    // Example usage for two sections
    setupCountingAnimation('counting-container1', 18000, 1000, 60);
    setupCountingAnimation('counting-container2', 19, 2000, 60);
    setupCountingAnimation('counting-container3', 2, 5, 100);
    setupCountingAnimation('counting-container4', 10, 2000, 60);
    setupCountingAnimation('counting-container5', 30, 2000, 60);
});