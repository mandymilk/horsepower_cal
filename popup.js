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

    const motivationalQuotes = [
        "Make every minute count - your time is valuable!",
        "Time is money, but your happiness is priceless.",
        "Each minute is an opportunity to create value.",
        "Your time matters - make it work for you!",
        "Small minutes add up to big achievements.",
        "Every second is a chance to move forward."
    ];

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

    function calculateTimeValue() {
        const yearlyIncome = parseFloat(salary.value) || 0;
        const hoursPerYear = getWorkingHoursPerYear(
            workingHours.value,
            parseFloat(customHours.value)
        );

        if (yearlyIncome <= 0) {
            alert('Please enter a valid yearly income');
            return;
        }

        // Calculate values
        const hourlyRate = yearlyIncome / hoursPerYear;
        const minuteRate = hourlyRate / 60;
        const secondRate = minuteRate / 60;

        // Update display
        perHour.textContent = `Per hour: ${formatCurrency(hourlyRate)}`;
        perMinute.textContent = `Per minute: ${formatCurrency(minuteRate)}`;
        perSecond.textContent = `Per second: ${formatCurrency(secondRate)}`;
        workingSummary.textContent = 
            `Based on ${hoursPerYear.toLocaleString()} working hours per year`;

        // Show random motivational quote
        document.querySelector('.motivation').textContent = 
            motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    }

    // Event Listeners
    workingHours.addEventListener('change', updateCustomHoursVisibility);
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
});