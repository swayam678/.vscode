const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Schema and Model for User Data
const userSchema = new mongoose.Schema({
    data: [Number],
});
const UserModel = mongoose.model('UserData', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to store data
app.post('/api/data', async (req, res) => {
    const newData = new UserModel({ data: req.body.data });
    try {
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to retrieve data
app.get('/api/data', async (req, res) => {
    try {
        const data = await UserModel.find();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Data Visualization</title>
</head>
<body>
    <h1>Data Visualization</h1>
    <form id="dataForm">
        <label for="data">Enter data (comma-separated):</label>
        <input type="text" id="data" name="data">
        <label for="visualizationType">Visualization Type:</label>
        <select id="visualizationType">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
        </select>
        <button type="submit">Generate Chart</button>
    </form>
    <canvas id="myChart" width="400" height="200"></canvas>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('dataForm');
            form.addEventListener('submit', function(event) {
                event.preventDefault();

                const data = document.getElementById('data').value.trim();

                if (!data) {
                    console.error('No data provided');
                    return;
                }

                const dataArray = data.split(',').map(item => Number(item.trim()));

                if (isNaN(dataArray[0])) {
                    console.error('Invalid data');
                    return;
                }

                generateVisualization(dataArray, visualizationType);
            });

            let chart = null;

            function generateVisualization(dataArray, visualizationType) {
                const ctx = document.getElementById('myChart').getContext('2d');

                if (chart) {
                    chart.destroy(); // Destroy previous chart to avoid conflicts
                }

                const labels = dataArray.map((_, index) => \`Data \${index + 1}\`);

                switch (visualizationType) {
                    case 'bar':
                        chart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels,
                                datasets: [{
                                    label: 'Data',
                                    data: dataArray,
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1,
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
                        break;
                    case 'line':
                        chart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels,
                                datasets: [{
                                    label: 'Data',
                                    data: dataArray,
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1,
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    }
                                }
                            }
                        });
                        break;
                    case 'pie':
                        chart = new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels,
                                datasets: [{
                                    data: dataArray,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(255, 206, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(153, 102, 255, 0.2)',
                                        'rgba(255, 159, 64, 0.2)',
                                    ],
                                    borderColor: [
                                        'rgba(255, 99, 132, 1)',
                                        'rgba(54, 162, 235, 1)',
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                        'rgba(255, 159, 64, 1)',
                                    ],
                                    borderWidth: 1,
                                }],
                            },
                        });
                        break;
                    default:
                        console.error('Invalid visualization type');
                }
            }
        });
    </script>
</body>
</html>
`;

const fs = require('fs');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
