const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const fileDocument = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!fileDocument) {
    throw new Error('File not found');
  }

  const options = { width: 500 };
  const thumbnail500 = await imageThumbnail(fileDocument.localPath, options);

  return { thumbnail500 /* other thumbnails */ };
});

module.exports = fileQueue;
