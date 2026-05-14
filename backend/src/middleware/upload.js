const multer  = require("multer");
const { Readable } = require("stream");
const cloudinary   = require("../config/cloudinary");

/* ─────────────────────────────────────────────────────────
   multer with MEMORY storage — buffers files in RAM, no disk.
   We then pipe each buffer to Cloudinary v2 upload_stream.
   This completely removes the multer-storage-cloudinary dep
   and works cleanly with cloudinary@^2.x.
───────────────────────────────────────────────────────── */

const memoryMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    files:    5,
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/* Upload a single Buffer to Cloudinary, return the result */
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:           "shopcart-products",
        allowed_formats:  ["jpg", "jpeg", "png", "webp"],
        transformation:   [{ width: 1200, crop: "limit", quality: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // pipe the buffer into the upload stream
    Readable.from(buffer).pipe(uploadStream);
  });

/* Middleware that runs AFTER multer and uploads buffered files to Cloudinary.
   Normalises req.files to [{ path: secure_url, filename: public_id }]
   — same shape the product controller expects. */
const cloudinaryUploadMiddleware = async (req, _res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const results = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    // Preserve the same .path interface the controller uses
    req.files = results.map((r) => ({
      path:     r.secure_url,
      filename: r.public_id,
    }));

    next();
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   Export an object that mirrors multer's API surface so
   the routes file needs zero changes:

     upload.array("images", 5)
       → returns [multerMiddleware, cloudinaryMiddleware]

   Express accepts an array of middleware in route handlers,
   so this works as a drop-in replacement.
───────────────────────────────────────────────────────── */
const upload = {
  array: (fieldName, maxCount) => [
    memoryMulter.array(fieldName, maxCount),
    cloudinaryUploadMiddleware,
  ],

  single: (fieldName) => [
    memoryMulter.single(fieldName),
    cloudinaryUploadMiddleware,
  ],
};

module.exports = upload;
