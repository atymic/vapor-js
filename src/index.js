const axios = require('axios')

class Vapor
{
    /**
     * Store a file in S3 and return its UUID, key, and other information.
     */
    async store(file, options = null) {
        const response = await axios.post('/vapor/signed-storage-url', {
            'bucket': options.bucket || '',
            'content_type': options.contentType || file.type,
            'expires': options.expires || ''
        });

        let headers = response.data.headers;

        if ('Host' in headers) {
            delete headers.Host;
        }

        if (typeof options.progress === 'undefined') {
            options.progress = () => {};
        }

        const s3Response = await axios.put(response.data.url, file, {
            headers: headers,
            onUploadProgress: (progressEvent) => {
                options.progress(progressEvent.loaded / progressEvent.total);
            }
        });

        response.data.extension = file.name.split('.').pop()

        return response.data;
    }
}

module.exports = new Vapor();
