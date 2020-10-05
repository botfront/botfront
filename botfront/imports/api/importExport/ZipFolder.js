

import JSZIP from 'jszip';

export class ZipFolder {
    constructor (filePrefix) {
        this.zipContainer = new JSZIP();
        this.filePrefix = filePrefix || '';
    }

    addFile = (data, fileName) => {
        if (!data) return;
        const rasaComponentBlob = Buffer.from(data);
        this.zipContainer = this.zipContainer.file(`${this.filePrefix}${fileName}`, rasaComponentBlob);
    }

    generateBlob = () => this.zipContainer.generateAsync({ type: 'base64' })
}
