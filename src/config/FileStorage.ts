import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Specify the directory to store files
    },
    filename: (req, file, cb) =>{
        cb(null, + Date.now()+ '-' +file.originalname); // Generate unique filenames
    }
})

export const upload = multer({storage: storage})