// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
function getPublicUrl(filename) {
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}
// [END public_url]

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
function sendUploadToGCS(req, res, next) {
    if (!req.file) {
        return next();
    }
    const { user_id } = req.decodedToken
    const gcsname = Date.now();
    const file = bucket.file(user_id + '/tmp/' + gcsname);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        },
        resumable: false
    });

    stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname;
        file.makePublic().then(() => {
            req.file.cloudStoragePublicUrl = gcsname;
            next();
        });
    });

    stream.end(req.file.buffer);
}
// [END process]

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory.
// This makes it straightforward to upload to Cloud Storage.
// [START multer]

// [END multer]
let multer
const CLOUD_BUCKET = 'mcon-vertobase-dev'
let storage
let bucket
module.exports = function (Storage, Multer) {
    multer = Multer({
        storage: Multer.MemoryStorage,
        limits: {
            fileSize: 5 * 1024 * 1024 // no larger than 5mb
        }
    });

    storage = new Storage({
        keyFilename: process.env.STORAGE_GCP_PATH || './config/storage-gcp.json',
        projectId: 'vertobase-dev'
    });
    bucket = storage.bucket(CLOUD_BUCKET);
    // console.log('bucket : ', bucket)
    return {
        getPublicUrl,
        sendUploadToGCS,
        multer
    };
} 