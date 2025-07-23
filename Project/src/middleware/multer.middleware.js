import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req,file,cd) => {
        cd(null, './public/temp')
    },
    filename: (req,file,cd) => {
        cd(null,File.originalname)
    }
})

export const upload = multer({
    storage,
})