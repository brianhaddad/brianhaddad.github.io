async function loadJsonFiles(id) {
    const files = document.getElementById(id).files;
    if (files.length < 1){
        alert('Error: You must select a file first.');
        return null;
    }
    const fileTexts = await readFileArray(files);
    return fileTexts.map(n => JSON.parse(n['content']));
}

//This is based off things I learned at the following links:
//https://stackoverflow.com/questions/44438560/read-json-file-data-on-client-side-with-pure-javascript
//https://blog.shovonhasan.com/using-promises-with-filereader/
async function readFileArray(fileArray) {
    const readFileAsText = (inputFile) => {
        const temporaryFileReader = new FileReader();
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException("Problem parsing input file."));
            };
            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsText(inputFile, 'UTF-8');
        });
    };
    const files = [];
    for (let i=0; i<fileArray.length; i++) {
        try {
            const file = await readFileAsText(fileArray[i]);
            files.push({'filename': fileArray[i].name, 'content': file});
        } catch (e) {
            console.warn(e.message)
        }
    }
    return files;
}

//Need to store this so that we can revoke URLs that are no longer being used (prevents memory leak).
let textFileLink = null;

//This one comes from here:
//https://stackoverflow.com/questions/21012580/is-it-possible-to-write-data-to-file-using-only-javascript
function createDataSaveDownloadLinkUrl(text) {
    const data = new Blob([text.replace(/\n/g, '\r\n')], {type: 'text/plain'});
    if (textFileLink !== null) {
        window.URL.revokeObjectURL(textFileLink);
    }
    textFileLink = window.URL.createObjectURL(data);
    return textFileLink;
}