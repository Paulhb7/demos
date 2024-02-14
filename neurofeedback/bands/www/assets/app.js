'use strict';

// Connect to socket
let io = new IO();

// Subscribe to data stream
io.subscribe('bands');

// Connect event
io.on('connect', () => {
    console.log('connected');
});

// Load settings from YAML graph
load_settings().then(settings => {
    console.log(settings);
});

// Get DOM elements
let elements = {};
for (let band of ['delta', 'theta', 'alpha', 'beta', 'gamma']) {
    elements[band] = {
        'absolute': document.getElementById(band + '_absolute'),
        'relative': document.getElementById(band + '_relative'),
        'progress': document.getElementById(band + '_progress')
    };
}

// Initialize Chart
let bandsChart;
function initChart() {
    const ctx = document.getElementById('bandsChart').getContext('2d');
    bandsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
            datasets: [{
                label: 'Power',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update both table and chart
io.on('bands', (data) => {
    // Get last row of data
    let keys = Object.keys(data);
    let row = data[keys[keys.length - 1]];
    // Compute total power
    let total = Object.values(row).reduce((a, b) => a + b, 0);
    // Compute relative values and update table
    let chartData = [];
    for (let key in row) {
        let band = key.split('_')[1];
        let absolute = row[key];
        let relative = absolute * 100 / total;
        elements[band]['absolute'].innerHTML = absolute.toFixed(2);
        elements[band]['relative'].innerHTML = relative.toFixed(2);
        elements[band]['progress'].value = relative;
        chartData.push(relative);
    }
    // Update chart
    updateChart(chartData);
});

function updateChart(data) {
    if (bandsChart) {
        bandsChart.data.datasets[0].data = data;
        bandsChart.update();
    }
}

// Initialize the chart after setting up DOM elements
initChart();
