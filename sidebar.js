document.addEventListener('DOMContentLoaded', function() {
    const salary = document.getElementById('salary');
    const workingHours = document.getElementById('workingHours');
    const customHoursDiv = document.getElementById('customHoursDiv');
    const customHours = document.getElementById('customHours');
    const calculateButton = document.getElementById('calculate');
    const perHour = document.getElementById('perHour');
    const perMinute = document.getElementById('perMinute');
    const perSecond = document.getElementById('perSecond');
    const workingSummary = document.getElementById('workingSummary');

    // Load saved values when the page opens
    chrome.storage.local.get(['savedSalary', 'savedWorkingHours', 'savedCustomHours'], function(result) {
        if (result.savedSalary) {
            salary.value = result.savedSalary;
        }
        if (result.savedWorkingHours) {
            workingHours.value = result.savedWorkingHours;
            updateCustomHoursVisibility();
        }
        if (result.savedCustomHours) {
            customHours.value = result.savedCustomHours;
        }
    });

    const motivationalQuotes = [
        "Make every minute count - your time is valuable!",
        "Time is money, but your happiness is priceless.",
        "Each minute is an opportunity to create value.",
        "Your time matters - make it work for you!",
        "Small minutes add up to big achievements.",
        "Every second is a chance to move forward."
    ];

    const ITEM_PRICES = {
        cola: 2.00,
        coffee: 5.00,
        lunch: 15.00
    };

    function getWorkingHoursPerYear(selection, customVal = 40) {
        const weeksPerYear = 52;
        switch(selection) {
            case 'horse':
                return 50 * weeksPerYear;
            case 'standard':
                return 40 * weeksPerYear;
            case 'part35':
                return 35 * weeksPerYear;
            case 'part20':
                return 20 * weeksPerYear;
            case 'custom':
                return Math.min(Math.max(1, customVal), 168) * weeksPerYear;
            default:
                return 40 * weeksPerYear;
        }
    }

    function updateCustomHoursVisibility() {
        customHoursDiv.style.display = 
            workingHours.value === 'custom' ? 'block' : 'none';
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function updateProgress(minuteRate) {
        let earnings = 0;
        const progressBars = {
            cola: document.getElementById('colaProgress'),
            coffee: document.getElementById('coffeeProgress'),
            lunch: document.getElementById('lunchProgress')
        };
        const timeLabels = {
            cola: document.getElementById('colaTime'),
            coffee: document.getElementById('coffeeTime'),
            lunch: document.getElementById('lunchTime')
        };

        // Verify all elements exist
        const allElementsExist = Object.values(progressBars).every(el => el) && 
                               Object.values(timeLabels).every(el => el);
        
        if (!allElementsExist) {
            console.warn('Some progress elements not found');
            return;
        }

        // Clear any existing interval
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
        }

        // Calculate initial time estimates
        Object.keys(ITEM_PRICES).forEach(item => {
            const price = ITEM_PRICES[item];
            const minutesToEarn = price / minuteRate;
            const minutes = Math.floor(minutesToEarn);
            const seconds = Math.floor((minutesToEarn - minutes) * 60);
            timeLabels[item].textContent = 
                `${minutes}m ${seconds}s until you can buy this`;
        });

        // Update progress every second
        window.progressInterval = setInterval(() => {
            earnings += minuteRate / 60;

            Object.keys(ITEM_PRICES).forEach(item => {
                const price = ITEM_PRICES[item];
                const progress = (earnings / price) * 100;

                progressBars[item].style.width = Math.min(progress, 100) + '%';
                
                if (progress >= 100) {
                    timeLabels[item].textContent = 'You can buy this!';
                    progressBars[item].style.backgroundColor = '#27ae60';
                    progressBars[item].style.animation = 'pulse 1s infinite';
                } else {
                    const remainingAmount = price - earnings;
                    const minutesLeft = remainingAmount / (minuteRate);
                    const minutes = Math.floor(minutesLeft);
                    const seconds = Math.floor((minutesLeft - Math.floor(minutesLeft)) * 60);
                    timeLabels[item].textContent = 
                        `${minutes}m ${seconds}s until you can buy this`;
                }
            });
        }, 1000);
    }

    function updateYearlyCounts(yearlyIncome) {
        const counts = {
            cola: document.getElementById('colaYearly'),
            coffee: document.getElementById('coffeeYearly'),
            lunch: document.getElementById('lunchYearly')
        };

        // Verify all elements exist
        if (!Object.values(counts).every(el => el)) {
            console.warn('Some yearly count elements not found');
            return;
        }

        Object.keys(ITEM_PRICES).forEach(item => {
            const count = Math.floor(yearlyIncome / ITEM_PRICES[item]);
            const countElement = counts[item];
            
            countElement.classList.remove('count-updated');
            void countElement.offsetWidth;
            countElement.classList.add('count-updated');
            
            countElement.textContent = count.toLocaleString();
        });
    }

    function calculateTimeValue() {
        // Verify required elements exist
        const requiredElements = {
            perHour: document.getElementById('perHour'),
            perMinute: document.getElementById('perMinute'),
            perSecond: document.getElementById('perSecond'),
            workingSummary: document.getElementById('workingSummary'),
            motivation: document.querySelector('.motivation')
        };

        if (!Object.values(requiredElements).every(el => el)) {
            console.warn('Some required elements not found');
            return;
        }

        const yearlyIncome = parseFloat(salary.value) || 0;
        const hoursPerYear = getWorkingHoursPerYear(
            workingHours.value,
            parseFloat(customHours.value)
        );

        if (yearlyIncome <= 0) {
            alert('Please enter a valid yearly income');
            return;
        }

        // Save values to storage
        chrome.storage.local.set({
            savedSalary: salary.value,
            savedWorkingHours: workingHours.value,
            savedCustomHours: customHours.value
        });

        // Calculate values
        const hourlyRate = yearlyIncome / hoursPerYear;
        const minuteRate = hourlyRate / 60;
        const secondRate = minuteRate / 60;

        // Update displays
        requiredElements.perHour.textContent = `Per hour: ${formatCurrency(hourlyRate)}`;
        requiredElements.perMinute.textContent = `Per minute: ${formatCurrency(minuteRate)}`;
        requiredElements.perSecond.textContent = `Per second: ${formatCurrency(secondRate)}`;
        requiredElements.workingSummary.textContent = 
            `Based on ${hoursPerYear.toLocaleString()} working hours per year`;

        // Update yearly counts
        updateYearlyCounts(yearlyIncome);

        // Show random motivational quote
        requiredElements.motivation.textContent = 
            motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

        // Start progress tracking
        updateProgress(minuteRate);
    }

    // Event Listeners
    workingHours.addEventListener('change', function() {
        updateCustomHoursVisibility();
        // Save working hours selection immediately
        chrome.storage.local.set({
            savedWorkingHours: workingHours.value
        });
    });

    calculateButton.addEventListener('click', calculateTimeValue);
    
    // Initialize custom hours visibility
    updateCustomHoursVisibility();

    // Handle Enter key in input fields
    const inputs = [salary, customHours];
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateTimeValue();
            }
        });
    });

    // Clean up interval when the page is unloaded
    window.addEventListener('unload', () => {
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
        }
        if (window.realTimeInterval) {
            clearInterval(window.realTimeInterval);
        }
    });
}); 