async function func_3Dpie(unformatdata,userid) {
    var chartDiv = document.getElementById('3Dpiechart');
    debugger;

    var data = google.visualization.arrayToDataTable(convertDatasetToArray(unformatdata,userid));
    debugger;
    var options = {
        is3D: true,
        title: 'Overall Engagments',
        chartArea: {
            backgroundColor: {
                stroke: '#0000',     // Border color
                strokeWidth: 1      // Border width
            }
        },
        backgroundColor: '#ffff',
        width: 350,
        height: 300,
        legend: {
            position: 'top', maxLines: 3,
            textstyle: {
                // color: '#FF0000'
                bold: true
            },
            textStyle: {
                bold: true
            }
        },
        colors: ['#8E44AD', '#3498DB', '#E74C3C', '#2ECC71', '#F1C40F'] // New color scheme

    };

    // Format the values 
    var formatter = new google.visualization.NumberFormat({
        suffix: ':Saves+Likes+Shares+Comments'
    });

    formatter.format(data, 1);
    formatter.format(data, 2);
    formatter.format(data, 3);
    formatter.format(data, 4);

    var chart = new google.visualization.PieChart(chartDiv);
    chart.draw(data, options);
}

async function multiplecols(unformatdata,userid) {

    var chartDiv = document.getElementById('mulcolschart');

    var data = google.visualization.arrayToDataTable(convertDatasetToArray(unformatdata,userid));

    var options = {
        title: 'Interactions Insight',
        width: 540,
        height: 300,
        legend: {
            position: 'top', maxLines: 3,
            textstyle: {
                // color: '#FF0000'
                bold: true
            },
            textStyle: {
                bold: true
            }
        },
        colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE'] // Shades of lavender
    };

    var chart = new google.visualization.ColumnChart(chartDiv);

    chart.draw(data, options);
}

function convertDatasetToArray(dataset, userId) {
    // Initialize the result array with the header row
    const result = [
        ['Post Type', 'Saves', 'Likes', 'Shares', 'Comments']
    ];

    // Filter the dataset to include only objects with the specified user ID
    const filteredDataset = dataset.filter(item => item.userid === userId);

    // Loop through each item in the filtered dataset
    filteredDataset.forEach(item => {
        // Extract the required values
        const row = [
            item.posttype,
            item.saves,
            item.likes,
            item.shares,
            item.comments
        ];

        // Add the extracted values as a new row in the result array
        result.push(row);
    });

    return result;
}

function calculateEngagements(dataset, userId) {
    // Initialize an object to store engagement totals per post type
    const engagements = {};

    // Filter the dataset to include only objects with the specified user ID
    const filteredDataset = dataset.filter(item => item.userid === userId);

    // Loop through each item in the filtered dataset
    filteredDataset.forEach(item => {
        // Calculate the total engagements for the current item
        const totalEngagements = item.likes + item.shares + item.saves + item.comments;

        // If the post type is not already in the engagements object, initialize it
        if (!engagements[item.posttype]) {
            engagements[item.posttype] = 0;
        }

        // Add the total engagements to the corresponding post type
        engagements[item.posttype] += totalEngagements;
    });

    return engagements;
}

function formatEngagementsAsText(engagements) {
    // Convert the engagements object into an array of formatted strings
    const formattedStrings = Object.entries(engagements).map(([postType, totalEngagements]) => {
        return `${postType}: ${totalEngagements}`;
    });

    // Join the formatted strings into a single line
    return formattedStrings.join(', ');
}











