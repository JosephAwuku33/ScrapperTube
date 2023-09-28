const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dotenv = require('dotenv');

// Load environment variables from a .env file
dotenv.config();

const API_KEY = process.env.API_KEY;
const MAX_RESULTS_PER_PAGE = 50; // Maximum results per API request

// Define a function to fetch channel data
async function fetchChannelData(url) {
  const response = await axios.get(url);
  return response.data;
}

// Define a function to write records to CSV
function writeRecordsToCsv(records) {
  const csvWriter = createCsvWriter({
    path: 'popular_videos_worldwide.csv',
    header: [
      { id: 'title', title: 'Title' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'description', title: 'Description' },
      { id: 'channelTitle', title: 'Channel Title'},
      { id: 'videoId', title: 'Video ID' },
      { id: 'viewCount', title: 'View Count' },
      { id: 'likeCount', title: 'Like Count' },
      { id: 'commentCount', title: 'Comment Count' }
    ]
  });

  return csvWriter.writeRecords(records);
}

// Define an async function to fetch and write data
async function fetchData() {
  let pageToken = null; // Start with null
  let allRecords = [];

  const targetCount = 10000; // Set your target count here
  let currentCount = 0;

  do {
    let url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=${MAX_RESULTS_PER_PAGE}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const data = await fetchChannelData(url);

    // Extract the relevant information from the data
    const records = data.items.map(item => {
      return {
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
        videoId: item.id,
        channelTitle: item.snippet.channelTitle,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount
        // Add more fields as needed
      };
    });

    // Calculate the number of records retrieved so far
    currentCount += records.length;

    // Concatenate the records to the existing list
    allRecords = allRecords.concat(records);

    // Get the nextPageToken for the next iteration
    pageToken = data.nextPageToken;

    // If the target count is reached or exceeded, break out of the loop
    if (currentCount >= targetCount || !pageToken) {
      break;
    }

  } while (true);

  // Write the records to CSV
  await writeRecordsToCsv(allRecords);
}

// Call the fetchData function
fetchData().then(() => {
  console.log('Data fetched and written to CSV successfully');
}).catch(error => {
  console.error(error);
});
