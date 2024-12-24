import express from 'express';
import * as uploadsController from '../controllers/UploadsController'
import { upload } from "../config/FileStorage";

const router = express.Router();

router.post('/:userId', upload.single('file'), uploadsController.uploadStatements)
router.get('/:userId', uploadsController.getUploadsByUser)
router.delete('/', uploadsController.deleteAlldata)

export default router;