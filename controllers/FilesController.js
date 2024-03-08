import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    try {
      // Ensure req.user is defined and contains userId
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, data, parentId = 0, isPublic = false } = req.body;
      const { userId } = req.user;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type or invalid type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check if parent exists
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile || parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent not found or not a folder' });
        }
      }

      let localPath;
      if (type !== 'folder') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        localPath = path.join(folderPath, uuidv4());
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      }

      const newFile = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: ObjectId(parentId),
        localPath: type !== 'folder' ? localPath : null,
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);

      return res.status(201).json({ ...newFile, id: result.insertedId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
