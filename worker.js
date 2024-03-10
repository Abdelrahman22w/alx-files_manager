import Queue from 'bull';
import { Worker } from 'image-thumbnail';
import path from 'path';

// Create a Bull queue named fileQueue
const fileQueue = new Queue('fileQueue');

// Process the queue
fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  // Check if userId and fileId are present in the job
  if (!userId || !fileId) {
    throw new Error('Missing userId or fileId');
  }

  // Find the document in the database based on the fileId and userId
  // Generate thumbnails with different sizes (500, 250, and 100)
  const worker = new Worker({
    path: path.dirname(fileId), // Set the path to the directory containing the original file
    widths: [500, 250, 100], // Set the desired widths for thumbnails
  });

  await worker.run(); // Run the worker to generate thumbnails
});

export default fileQueue;
