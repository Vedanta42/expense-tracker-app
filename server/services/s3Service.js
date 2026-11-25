const AWS = require('aws-sdk');
require('dotenv').config();

const uploadToS3 = (data, filename) => {
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY_ID;
    const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;

    // Initialize the S3 instance with your IAM credentials
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });

    // S3 configuration parameters
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read' // CRITICAL: Makes the file publicly accessible via URL
    };

    // Return a Promise to properly handle asynchronous execution
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.error('S3 Upload Error:', err);
                reject(err);
            } else {
                resolve(s3response.Location); // Returns the live Object URL
            }
        });
    });
}

module.exports = { uploadToS3 };