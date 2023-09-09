// A simple script to crawl and fetch data from youtube
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dotenv = require('dotenv');

// Load environment variables from a .env file
dotenv.config();


const API_KEY = process.env.API_KEY;

axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=GH&maxResults=30`)
  .then(response => {
    const videos = response.data.items;

    const csvWriter = createCsvWriter({
      path: 'popular_videos_ghana.csv',
      header: [
        { id: 'title', title: 'Title' },
        { id: 'publishedAt', title: 'Published At' },
        { id: 'description', title: 'Description' },
        { id: 'videoId', title: 'Video ID' },
        { id: 'viewCount', title: 'View Count' },
        { id: 'likeCount', title: 'Like Count' },
        { id: 'dislikeCount', title: 'Dislike Count' },
        { id: 'commentCount', title: 'Comment Count' }
      ]
    });

    const records = videos.map(video => {
      return {
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
        description: video.snippet.description,
        videoId: video.id,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        dislikeCount: video.statistics.dislikeCount,
        commentCount: video.statistics.commentCount
      };
    });

    csvWriter.writeRecords(records)
      .then(() => {
        console.log('CSV file written successfully');
      })
      .catch(error => {
        console.error(error);
      });
  })
  .catch(error => {
    console.error(error);
  });


