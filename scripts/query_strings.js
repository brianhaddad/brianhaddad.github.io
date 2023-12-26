function getQueryStrings(expectedParamsArray) {
    const urlParams = new URLSearchParams(window.location.search);
    const resultDict = {};
    for (const key of expectedParamsArray) {
        resultDict[key] = urlParams.get(key);
    }
    return resultDict;
}