const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  // Check if fileId and userId are present
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  // Find the document in the DB based on fileId and userId
  const fileDocument = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!fileDocument) {
    throw new Error('File not found');
  }

  // Generate thumbnails
  const options = { width: 500 };
  const thumbnail500 = await imageThumbnail(fileDocument.localPath, options);
  // Save or do something with the thumbnail500

  // Repeat for other thumbnail sizes (250, 100)

  return { thumbnail500 /* other thumbnails */ };
});

module.exports = fileQueue;
