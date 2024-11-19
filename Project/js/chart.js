// Store the current chart instance
let chartInstance = null;

// Clear & hide charts
function clearChart() {

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    // Hide all chart by setting them to 'none'
    document.getElementById('particleChartCanvas').style.display = 'none';
    document.getElementById('gasChartCanvas').style.display = 'none';
    document.getElementById('hourlyChartCanvas').style.display = 'none';
    document.getElementById('barChartCanvas').style.display = 'none';
    document.getElementById('doughnutChartCanvas').style.display = 'none';
}


// // 대기질 데이터 가져오기
// async function fetchAirQualityData() {
//     try {
//         const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
//         const data = await response.json();
//         if (data.list && data.list.length > 0) {
//             return data.list[0].components;
//         }
//     } catch (error) {
//         console.error('대기질 데이터 가져오기 실패:', error);
//     }
//     return null;
// }


// Display hourly temperature & humidity chart
function displayHourlyChart(type) {

    // Clear existing chart and reset the canvas
    clearChart();

    // Show canvas for hourly chart
    const hourlyCanvas = document.getElementById('hourlyChartCanvas');
    hourlyCanvas.style.display = 'block';

    // Set default font for all chart
    Chart.defaults.font.family = 'Poppins, sans-serif';

    // Fetch hourly weather data
    fetchHourlyWeatherData().then(weatherData => {
        // Generate labels for each hour using the timestamp from the data
        const labels = weatherData.map(item => {
            const date = new Date(item.dt * 1000); // Convert UNIX timestamp to date
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const labelDate = date.getHours() === 0 ? `${date.getMonth() + 1}/${date.getDate()} ` : '';
            return `${labelDate}${hours}:${minutes}`; // Format as "MM/DD HH:mm" or "HH:mm"
        });

        let dataset, chartLabel, gradient;
        const ctx = hourlyCanvas.getContext('2d'); // Get the drawing context for the chart

        // Set dataset, label, and gradient based on the chart type
        if (type === 'temperature') {
            dataset = weatherData.map(item => item.main.temp); // Extract temperature data
            chartLabel = 'Temperature (°C)'; // Label for temperature
            gradient = ctx.createLinearGradient(0, 0, 0, 400); // Gradient for temperature
            gradient.addColorStop(0, 'rgba(255, 99, 132, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 99, 132, 0)');
        } else if (type === 'humidity') {
            dataset = weatherData.map(item => item.main.humidity); // Extract humidity data
            chartLabel = 'Humidity (%)'; // Label for humidity
            gradient = ctx.createLinearGradient(0, 0, 0, 400); // Gradient for humidity
            gradient.addColorStop(0, 'rgba(54, 162, 235, 0.5)');
            gradient.addColorStop(1, 'rgba(54, 162, 235, 0)');
        }

        // Destroy the existing chart instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create a new line chart with the fetched data
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // X-axis labels
                datasets: [{
                    data: dataset, // Data points for the chart
                    borderColor: type === 'temperature' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)', // Line color
                    backgroundColor: gradient, // Gradient fill
                    borderWidth: 2, // Line width
                    pointBackgroundColor: 'white', // Point color
                    pointBorderColor: type === 'temperature' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)', // Point border color
                    pointHoverRadius: 6, // Hover size of points
                    pointRadius: 4, // Default point size
                    fill: true, // Fill under the line
                    tension: 0.3 // Line smoothness
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false, // Hide the legend
                    },
                    title: {
                        display: true, // Show chart title
                        text: type === 'temperature' ? '🌡️ Hourly Temperature' : '💧 Hourly Humidity', // Title based on chart type
                        color: type === 'temperature' ? '#ff6b6b' : '#1e90ff', // Title color
                        font: {
                            size: 20,
                            weight: '500'
                        },
                        padding: {
                            top: 20,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        enabled: true, // Enable tooltips
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Tooltip background color
                        titleColor: '#ffffff', // Tooltip title color
                        bodyColor: '#ffffff', // Tooltip text color
                        padding: 10, // Tooltip padding
                        displayColors: false, // Hide color boxes in tooltip
                        callbacks: {
                            title: function (context) {
                                return `${context[0].label}`; // Tooltip title
                            },
                            label: function (context) {
                                const value = context.raw.toFixed(2); // Format value to 2 decimal places
                                if (type === 'temperature') {
                                    return `Temperature: ${value} °C`; // Tooltip label for temperature
                                } else if (type === 'humidity') {
                                    return `Humidity: ${value} %`; // Tooltip label for humidity
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true, // X-axis title
                            text: 'Time', // Title text
                            color: '#333', // Title color
                            font: {
                                size: 12,
                                weight: 'semi-bold'
                            },
                            padding: {
                                top: 10
                            }
                        },
                        grid: {
                            display: false // Hide grid lines on X-axis
                        },
                        ticks: {
                            color: '#333', // Tick color
                            autoSkip: true, // Skip overlapping labels
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: {
                        title: {
                            display: true, // Y-axis title
                            text: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)', // Y-axis label based on chart type
                            color: '#333',
                            font: {
                                size: 12,
                                weight: 'semi-bold'
                            },
                            padding: {
                                bottom: 15
                            }
                        },
                        ticks: {
                            beginAtZero: true, // Start Y-axis at 0
                            color: '#333' // Tick color
                        },
                        grid: {
                            color: '#f0f0f0' // Grid line color
                        }
                    }
                }
            }
        });
    });
}


// Display bar chart for air particle concentration
async function showParticleChart() {
    clearChart(); // Clear any existing chart before rendering a new one

    // Fetch air quality data
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return; // Exit if no data is available

    const ctx = document.getElementById('particleChartCanvas').getContext('2d'); // Get canvas context for drawing the chart
    document.getElementById('particleChartCanvas').style.display = 'block'; // Make the canvas visible

    // Define labels for the pollutants
    const labels = ['PM2.5', 'PM10', 'CO'];

    // Extract pollutant values, defaulting to 0 if not available
    const dataValues = [
        pollutants.pm2_5 || 0,
        pollutants.pm10 || 0,
        pollutants.co || 0
    ];

    // Create gradient colors for each pollutant
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Vertical gradient
        const baseColor = ['#FF6384', '#FF9F40', '#66BB6A'][index]; // Base colors for each pollutant
        gradient.addColorStop(0, `${baseColor}33`); // Light shade at the top
        gradient.addColorStop(1, `${baseColor}FF`); // Dark shade at the bottom
        return gradient;
    });

    // Create a bar chart using Chart.js
    chartInstance = new Chart(ctx, {
        type: 'bar', // Bar chart type
        data: {
            labels: labels, // Labels for the X-axis
            datasets: [{
                data: dataValues, // Data for the bars
                backgroundColor: colors, // Gradient background colors
                borderRadius: 12, // Rounded corners for bars
                barThickness: 70 // Thickness of each bar
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow custom aspect ratio
            plugins: {
                legend: { display: false }, // Hide legend
                title: {
                    display: true, // Display a title
                    text: 'Current Air Particles Concentration', // Title text
                    color: '#333', // Title color
                    font: {
                        size: 20,
                        weight: '500'
                    },
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                tooltip: {
                    enabled: true, // Enable tooltips
                    padding: 10, // Tooltip padding
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Tooltip background color
                    titleColor: '#ffffff', // Tooltip title color
                    bodyColor: '#ffffff', // Tooltip text color
                    displayColors: false, // Hide color indicators in the tooltip
                    callbacks: {
                        // Customize tooltip labels
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const unit = (label === 'CO') ? 'µg/m³' : (label.includes('PM') ? 'µg/m³' : 'ppb'); // Units based on the pollutant type
                            return `${label}: ${value.toFixed(2)} ${unit}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    title: {
                        display: true, // Display Y-axis title
                        text: 'µg/m³', // Y-axis label
                        color: '#333', // Title color
                        font: {
                            size: 12,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    ticks: {
                        color: '#333' // Y-axis tick color
                    },
                    grid: {
                        color: '#e0e0e0' // Y-axis grid line color
                    }
                },
                x: {
                    ticks: {
                        color: '#333' // X-axis tick color
                    },
                    grid: {
                        display: true, // Display vertical grid lines
                        color: '#f0f0f0', // Grid line color
                        lineWidth: 1 // Grid line width
                    }
                }
            },
            animation: {
                duration: 700, // Animation duration in milliseconds
                easing: 'easeOutCubic' // Easing function for animation
            }
        }
    });
}


// Display bar chart for air gases concentration
async function showGasChart() {
    clearChart(); // Clear any existing chart

    // Fetch air quality data
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return; // Exit if no data is available

    const ctx = document.getElementById('gasChartCanvas').getContext('2d'); // Get canvas context
    document.getElementById('gasChartCanvas').style.display = 'block'; // Make the canvas visible

    // Define labels for gas pollutants
    const labels = ['NO', 'NO2', 'O3', 'SO2', 'NH3'];

    // Extract pollutant values, defaulting to 0 if not available
    const dataValues = [
        pollutants.no || 0,
        pollutants.no2 || 0,
        pollutants.o3 || 0,
        pollutants.so2 || 0,
        pollutants.nh3 || 0
    ];

    // Create gradient colors for each pollutant
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Vertical gradient
        const baseColor = ['#FF6384', '#36A2EB', '#9966FF', '#FFCE56', '#FF9F40'][index]; // Base colors for gases
        gradient.addColorStop(0, `${baseColor}33`); // Light shade at the top
        gradient.addColorStop(1, `${baseColor}FF`); // Dark shade at the bottom
        return gradient;
    });

    // Destroy any existing chart instance to avoid overlap
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a bar chart using Chart.js
    chartInstance = new Chart(ctx, {
        type: 'bar', // Bar chart type
        data: {
            labels: labels, // Labels for the X-axis
            datasets: [{
                data: dataValues, // Data for the bars
                backgroundColor: colors, // Gradient background colors
                borderRadius: 12, // Rounded corners for bars
                barThickness: window.innerWidth < 768 ? 40 : 70 // Adjust bar thickness for mobile vs desktop
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow custom aspect ratio
            plugins: {
                legend: { display: false }, // Hide legend
                title: {
                    display: true, // Display a title
                    text: 'Current Air Gases Concentration', // Title text
                    color: '#333', // Title color
                    font: {
                        size: 20,
                        weight: '500'
                    },
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                tooltip: {
                    displayColors: false, // Hide color indicators in tooltip
                    callbacks: {
                        // Customize tooltip labels
                        label: function (context) {
                            const value = context.raw || 0; // Use raw data for the label
                            return `${context.label}: ${value.toFixed(2)} ppb`; // Format with "ppb" unit
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    title: {
                        display: true, // Display Y-axis title
                        text: 'ppb', // Y-axis label
                        color: '#333', // Title color
                        font: {
                            size: 12,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    grid: { color: '#e0e0e0' } // Y-axis grid line color
                },
                x: {
                    grid: { display: true, color: '#f0f0f0' } // X-axis grid line color
                }
            }
        }
    });
}


// Display bar chart for air pollutant concentrations
async function showBarChart() {
    clearChart(); // Clear any existing chart

    // Fetch air quality data
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return; // Exit if no data is available

    // Get the canvas context and configure visibility for charts
    const ctx = document.getElementById('barChartCanvas').getContext('2d');
    document.getElementById('barChartCanvas').style.display = 'block'; // Show bar chart canvas
    document.getElementById('doughnutChartCanvas').style.display = 'none'; // Hide doughnut chart canvas
    document.getElementById('hourlyChartCanvas').style.display = 'none'; // Hide hourly chart canvas

    // Define labels and corresponding pollutant data values
    const labels = ['CO', 'NO', 'NO2', 'O3', 'SO2', 'NH3', 'PM2.5', 'PM10'];
    const dataValues = [
        pollutants.co || 0, pollutants.no || 0, pollutants.no2 || 0, pollutants.o3 || 0,
        pollutants.so2 || 0, pollutants.nh3 || 0, pollutants.pm2_5 || 0, pollutants.pm10 || 0
    ];

    // Create gradient colors for each bar
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Vertical gradient
        const baseColor = ['#FF6384', '#36A2EB', '#FFCE56', '#9966FF', '#66BB6A', '#FF9F40', '#FF6B81', '#42A5F5'][index]; // Base colors
        gradient.addColorStop(0, `${baseColor}88`); // Light shade at the top
        gradient.addColorStop(1, baseColor); // Full color at the bottom
        return gradient;
    });

    // Create a responsive bar chart
    chartInstance = new Chart(ctx, {
        type: 'bar', // Bar chart type
        data: {
            labels: labels, // Labels for the X-axis
            datasets: [{
                label: 'Pollutant Levels (µg/m³)', // Dataset label
                data: dataValues, // Pollutant data values
                backgroundColor: colors, // Gradient background colors
                borderColor: colors, // Border colors
                borderRadius: 10, // Rounded corners for bars
                barThickness: window.innerWidth < 768 ? 30 : 50 // Adjust bar thickness for mobile vs desktop
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow custom aspect ratio
            plugins: {
                legend: { display: false }, // Hide legend
                title: {
                    display: true, // Display a title
                    text: 'Air Pollutant Concentrations', // Title text
                    color: '#333', // Title color
                    font: {
                        size: 20,
                        weight: '500'
                    },
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                tooltip: {
                    enabled: true, // Enable tooltips
                    padding: 10, // Tooltip padding
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Tooltip background color
                    titleColor: '#ffffff', // Tooltip title color
                    bodyColor: '#ffffff', // Tooltip text color
                    callbacks: {
                        // Customize tooltip labels
                        label: function (context) {
                            const value = context.raw; // Data value for the bar
                            return `${context.label}: ${value ? value.toFixed(2) : '0'} µg/m³`; // Format value with unit
                        }
                    },
                    displayColors: false // Hide color boxes in the tooltip
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // Start Y-axis at 0
                    title: {
                        display: true, // Display Y-axis title
                        text: 'µg/m³', // Y-axis label
                        color: '#333', // Title color
                        font: {
                            size: 14,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 15
                        }
                    },
                    ticks: {
                        color: '#333' // Y-axis tick color
                    },
                    grid: {
                        color: '#f0f0f0' // Y-axis grid line color
                    }
                },
                x: {
                    ticks: {
                        color: '#333' // X-axis tick color
                    },
                    grid: { display: false } // Hide grid lines on the X-axis
                }
            },
            animation: {
                duration: 800, // Animation duration in milliseconds
                easing: 'easeOutQuad' // Easing function for animation
            }
        }
    });
}


// Display doughnut chart for air quality pollutant composition
async function showDoughnutChart() {
    clearChart(); // Clear any existing chart

    // Get the canvas context and make the doughnut chart canvas visible
    const ctx = document.getElementById('doughnutChartCanvas').getContext('2d');
    document.getElementById('doughnutChartCanvas').style.display = 'block';

    // Fetch air quality data
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return; // Exit if no data is available

    // Define colors for each pollutant
    const colors = [
        '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
        '#9A66FF', '#FF922B', '#FF7B9C', '#36CFC9'
    ];

    // Define pollutant labels and their corresponding values
    const labels = ['CO', 'NO', 'NO2', 'O3', 'SO2', 'NH3', 'PM2.5', 'PM10'];
    const dataValues = [
        pollutants.co || 0, pollutants.no || 0, pollutants.no2 || 0, pollutants.o3 || 0,
        pollutants.so2 || 0, pollutants.nh3 || 0, pollutants.pm2_5 || 0, pollutants.pm10 || 0
    ];

    // Sort pollutants by value in descending order
    const sortedData = dataValues.map((value, index) => ({
        label: labels[index], // Pollutant label
        value: value, // Pollutant value
        color: colors[index] // Pollutant color
    })).sort((a, b) => b.value - a.value);

    // Extract sorted labels, values, and colors
    const sortedLabels = sortedData.map(item => item.label);
    const sortedValues = sortedData.map(item => item.value);
    const sortedColors = sortedData.map(item => item.color);

    // Determine if the device is mobile for responsive layout
    const isMobile = window.innerWidth < 768;

    // Create a responsive doughnut chart
    chartInstance = new Chart(ctx, {
        type: 'doughnut', // Doughnut chart type
        data: {
            labels: sortedLabels, // Sorted labels for the chart
            datasets: [{
                data: sortedValues, // Sorted pollutant values
                backgroundColor: sortedColors, // Corresponding colors
                borderWidth: 1, // Border width for the chart
                borderColor: '#FFFFFF' // White border color for the chart
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow custom aspect ratio
            cutout: isMobile ? '40%' : '50%', // Adjust cutout size for mobile vs desktop
            layout: {
                padding: isMobile ? 10 : 20 // Adjust padding based on device
            },
            plugins: {
                title: {
                    display: true, // Display chart title
                    text: 'Air Quality Pollutant Composition', // Chart title text
                    color: '#333', // Title color
                    font: {
                        size: isMobile ? 16 : 20, // Font size for mobile vs desktop
                        weight: '500'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    display: true, // Show legend
                    position: isMobile ? 'bottom' : 'right', // Legend position based on device
                    labels: {
                        color: '#333', // Label text color
                        font: {
                            size: isMobile ? 10 : 13, // Font size for mobile vs desktop
                            family: 'Poppins'
                        },
                        padding: 10 // Padding for legend labels
                    }
                },
                tooltip: {
                    callbacks: {
                        // Customize tooltip label to show pollutant value with units
                        label: function (context) {
                            return `${context.label}: ${context.raw} µg/m³`;
                        }
                    }
                },
                datalabels: {
                    color: '#FFFFFF', // Data label color
                    font: {
                        size: isMobile ? 10 : 12, // Font size for mobile vs desktop
                        family: 'Poppins'
                    },
                    align: 'center', // Align labels at the center of segments
                    anchor: 'center', // Anchor labels to the center of segments
                    clip: false, // Allow labels to overflow
                    // Format labels to show name and value only if percentage >= 5%
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((acc, curr) => acc + curr, 0); // Calculate total value
                        const percentage = ((value / total) * 100).toFixed(1); // Calculate percentage
                        return percentage >= 5 ? `${context.chart.data.labels[context.dataIndex]}\n${value} µg/m³` : ''; // Show label only for significant values
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Include data labels plugin
    });
}


// Common chart options for consistent styling across different charts
const chartOptions = {
    responsive: true, // Make the chart responsive to screen size
    maintainAspectRatio: false, // Allow custom aspect ratios
    plugins: {
        legend: { display: false }, // Hide the legend
        tooltip: {
            // Customize tooltip labels
            callbacks: {
                label: (context) => `${context.label}: ${context.raw.toFixed(2)} µg/m³` // Format tooltip with units
            }
        }
    },
    scales: {
        x: {
            grid: { display: false }, // Hide grid lines on the X-axis
            ticks: { color: '#333' } // Set X-axis tick color
        },
        y: {
            beginAtZero: true, // Y-axis starts at 0
            grid: { color: '#f0f0f0' }, // Set grid line color for Y-axis
            ticks: { color: '#333' } // Set Y-axis tick color
        }
    }
};
