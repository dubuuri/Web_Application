let chartInstance = null;

// 차트를 제거 함수
function clearChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    document.getElementById('particleChartCanvas').style.display = 'none';
    document.getElementById('gasChartCanvas').style.display = 'none';
    document.getElementById('hourlyChartCanvas').style.display = 'none';
    document.getElementById('barChartCanvas').style.display = 'none';
    document.getElementById('doughnutChartCanvas').style.display = 'none';
}



async function fetchHourlyWeatherData() {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const data = await response.json();
    console.log(response);
    return data.list.slice(0, 8); // 첫 8시간 데이터만 사용
}

// 온습도 차트 표시 함수
function displayHourlyChart(type) {

    clearChart();

    const hourlyCanvas = document.getElementById('hourlyChartCanvas');
    hourlyCanvas.style.display = 'block';

    Chart.defaults.font.family = 'Poppins, sans-serif';

    fetchHourlyWeatherData().then(weatherData => {
        const labels = weatherData.map(item => {
            const date = new Date(item.dt * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const labelDate = date.getHours() === 0 ? `${date.getMonth() + 1}/${date.getDate()} ` : '';
            return `${labelDate}${hours}:${minutes}`;
        });

        let dataset, chartLabel, gradient;
        const ctx = hourlyCanvas.getContext('2d');

        if (type === 'temperature') {
            dataset = weatherData.map(item => item.main.temp);
            chartLabel = 'Temperature (°C)';
            gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(255, 99, 132, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 99, 132, 0)');
        } else if (type === 'humidity') {
            dataset = weatherData.map(item => item.main.humidity);
            chartLabel = 'Humidity (%)';
            gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(54, 162, 235, 0.5)');
            gradient.addColorStop(1, 'rgba(54, 162, 235, 0)');
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: dataset,
                    borderColor: type === 'temperature' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: 'white',
                    pointBorderColor: type === 'temperature' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                    pointHoverRadius: 6,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: type === 'temperature' ? '🌡️ Hourly Temperature' : '💧 Hourly Humidity',
                        color: type === 'temperature' ? '#ff6b6b' : '#1e90ff', // 온도와 습도에 따른 색상 변경
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
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: function (context) {
                                return `${context[0].label}`;
                            },
                            label: function (context) {
                                const value = context.raw.toFixed(2);
                                if (type === 'temperature') {
                                    return `Temperature: ${value} °C`;
                                } else if (type === 'humidity') {
                                    return `Humidity: ${value} %`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#333',
                            font: {
                                size: 12,
                                weight: 'semi-bold'
                            },
                            padding: {
                                top: 10
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#333',
                            autoSkip: true,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)',
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
                            beginAtZero: true,
                            color: '#333'
                        },
                        grid: {
                            color: '#f0f0f0'
                        }
                    }
                }
            }
        });
    });
}


// 대기질 데이터 가져오기
async function fetchAirQualityData() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        if (data.list && data.list.length > 0) {
            return data.list[0].components;
        }
    } catch (error) {
        console.error('대기질 데이터 가져오기 실패:', error);
    }
    return null;
}

async function showParticleChart() {
    clearChart();
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return;

    const ctx = document.getElementById('particleChartCanvas').getContext('2d');
    document.getElementById('particleChartCanvas').style.display = 'block';

    const labels = ['PM2.5', 'PM10', 'CO'];
    const dataValues = [
        pollutants.pm2_5 || 0,
        pollutants.pm10 || 0,
        pollutants.co || 0
    ];

    // 그라디언트 색상 조정: 아래쪽이 진하고 위쪽이 연한 색
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        const baseColor = ['#FF6384', '#FF9F40', '#66BB6A'][index];
        gradient.addColorStop(0, `${baseColor}33`); // 위쪽 연한 색
        gradient.addColorStop(1, `${baseColor}FF`); // 아래쪽 진한 색
        return gradient;
    });

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: colors,
                borderRadius: 12,
                barThickness: 70
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Current Air Particles Concentration',
                    color: '#333',
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
                    enabled: true,
                    padding: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const unit = (label === 'CO') ? 'µg/m³' : (label.includes('PM') ? 'µg/m³' : 'ppb');
                            return `${label}: ${value.toFixed(2)} ${unit}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'µg/m³',
                        color: '#333',
                        font: {
                            size: 12,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    ticks: {
                        color: '#333'
                    },
                    grid: {
                        color: '#e0e0e0'
                    }
                },
                x: {

                    ticks: {
                        color: '#333'
                    },
                    grid: {
                        display: true, // 세로 그리드 추가
                        color: '#f0f0f0',
                        lineWidth: 1
                    }
                }
            },
            animation: {
                duration: 700,
                easing: 'easeOutCubic'
            }
        }
    });
}


async function showGasChart() {
    clearChart(); // 기존 차트 삭제
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return;

    const ctx = document.getElementById('gasChartCanvas').getContext('2d');
    document.getElementById('gasChartCanvas').style.display = 'block';

    // NO 데이터 추가
    const labels = ['NO', 'NO2', 'O3', 'SO2', 'NH3'];
    const dataValues = [
        pollutants.no || 0,
        pollutants.no2 || 0,
        pollutants.o3 || 0,
        pollutants.so2 || 0,
        pollutants.nh3 || 0
    ];

    // 그라디언트 색상 설정
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        const baseColor = ['#FF6384', '#36A2EB', '#9966FF', '#FFCE56', '#FF9F40'][index];
        gradient.addColorStop(0, `${baseColor}33`);
        gradient.addColorStop(1, `${baseColor}FF`);
        return gradient;
    });

    // 기존 차트 삭제 (중복 방지)
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: colors,
                borderRadius: 12,
                // 반응형으로 막대 두께 조절
                barThickness: window.innerWidth < 768 ? 40 : 70 // 모바일에서는 40, 데스크탑에서는 70
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Current Air Gases Concentration',
                    color: '#333',
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
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw || 0;
                            return `${context.label}: ${value.toFixed(2)} ppb`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'ppb',
                        color: '#333',
                        font: {
                            size: 12,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    grid: { color: '#e0e0e0' }
                },
                x: {
                    grid: { display: true, color: '#f0f0f0' }
                }
            }
        }
    });
}



// 막대 차트 표시 함수
async function showBarChart() {
    clearChart();
    const pollutants = await fetchAirQualityData();
    if (!pollutants) return;

    const ctx = document.getElementById('barChartCanvas').getContext('2d');
    document.getElementById('barChartCanvas').style.display = 'block';
    document.getElementById('doughnutChartCanvas').style.display = 'none';
    document.getElementById('hourlyChartCanvas').style.display = 'none';

    const labels = ['CO', 'NO', 'NO2', 'O3', 'SO2', 'NH3', 'PM2.5', 'PM10'];
    const dataValues = [
        pollutants.co || 0, pollutants.no || 0, pollutants.no2 || 0, pollutants.o3 || 0,
        pollutants.so2 || 0, pollutants.nh3 || 0, pollutants.pm2_5 || 0, pollutants.pm10 || 0
    ];

    // 막대별 색상 (부드러운 그라디언트 적용)
    const colors = labels.map((label, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        const baseColor = ['#FF6384', '#36A2EB', '#FFCE56', '#9966FF', '#66BB6A', '#FF9F40', '#FF6B81', '#42A5F5'][index];
        gradient.addColorStop(0, `${baseColor}88`);
        gradient.addColorStop(1, baseColor);
        return gradient;
    });

    // 반응형 차트 생성
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pollutant Levels (µg/m³)',
                data: dataValues,
                backgroundColor: colors,
                borderColor: colors,
                borderRadius: 10,
                // 반응형 막대 두께 설정
                barThickness: window.innerWidth < 768 ? 30 : 50 // 모바일에서는 30, 데스크탑에서는 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Air Pollutant Concentrations',
                    color: '#333',
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
                    enabled: true,
                    padding: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            return `${context.label}: ${value ? value.toFixed(2) : '0'} µg/m³`;
                        }
                    },
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'µg/m³',
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'semi-bold'
                        },
                        padding: {
                            bottom: 15
                        }
                    },
                    ticks: {
                        color: '#333'
                    },
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    ticks: {
                        color: '#333'
                    },
                    grid: { display: false }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuad'
            }
        }
    });
}



// 도넛 차트 표시 함수
async function showDoughnutChart() {
    clearChart();

    const ctx = document.getElementById('doughnutChartCanvas').getContext('2d');
    document.getElementById('doughnutChartCanvas').style.display = 'block';

    const pollutants = await fetchAirQualityData();
    if (!pollutants) return;

    const colors = [
        '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
        '#9A66FF', '#FF922B', '#FF7B9C', '#36CFC9'
    ];

    const labels = ['CO', 'NO', 'NO2', 'O3', 'SO2', 'NH3', 'PM2.5', 'PM10'];
    const dataValues = [
        pollutants.co || 0, pollutants.no || 0, pollutants.no2 || 0, pollutants.o3 || 0,
        pollutants.so2 || 0, pollutants.nh3 || 0, pollutants.pm2_5 || 0, pollutants.pm10 || 0
    ];

    const sortedData = dataValues.map((value, index) => ({
        label: labels[index],
        value: value,
        color: colors[index]
    })).sort((a, b) => b.value - a.value);

    const sortedLabels = sortedData.map(item => item.label);
    const sortedValues = sortedData.map(item => item.value);
    const sortedColors = sortedData.map(item => item.color);

    // 반응형 설정 추가
    const isMobile = window.innerWidth < 768;

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedLabels,
            datasets: [{
                data: sortedValues,
                backgroundColor: sortedColors,
                borderWidth: 1,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: isMobile ? '40%' : '50%',
            layout: {
                padding: isMobile ? 10 : 50
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Air Quality Pollutant Composition',
                    color: '#333',
                    font: {
                        size: isMobile ? 16 : 20,
                        weight: '500'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: isMobile ? 'bottom' : 'right',
                    labels: {
                        color: '#333',
                        font: {
                            size: isMobile ? 10 : 13,
                            family: 'Poppins'
                        },
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw} µg/m³`;
                        }
                    }
                },
                datalabels: {
                    color: '#FFFFFF',
                    font: {
                        size: isMobile ? 10 : 12,
                        family: 'Poppins'
                    },
                    align: 'center',
                    anchor: 'center',
                    clip: false,
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((acc, curr) => acc + curr, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return percentage >= 5 ? `${context.chart.data.labels[context.dataIndex]}\n${value} µg/m³` : '';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// 페이지가 로드되면 기본적으로 온도 그래프를 표시
document.addEventListener('DOMContentLoaded', () => {
    displayHourlyChart('temperature');
});


const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => `${context.label}: ${context.raw.toFixed(2)} µg/m³`
            }
        }
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#333' } },
        y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { color: '#333' } }
    }
};