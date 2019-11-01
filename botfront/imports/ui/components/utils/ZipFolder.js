

import JSZIP from 'jszip';
import { saveAs } from 'file-saver';

export class ZipFolder {
    constructor (filePrefix) {
        this.zipContainer = new JSZIP();
        this.filePrefix = filePrefix || '';
    }

    addFile = (data, fileName) => {
        const rasaComponentBlob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        this.zipContainer = this.zipContainer.file(`${this.filePrefix}${fileName}`, rasaComponentBlob);
    }

    downloadAs = (folderName, callback) => {
        this.zipContainer.generateAsync({ type: 'blob' })
            .then((blob) => {
                saveAs(blob, folderName);
                callback();
            });
    }
}
