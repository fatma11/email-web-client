const windowOpenFallback = (downloadUrl) => {
    let height = Math.floor((window.outerHeight || 800) * 0.8);
    if(height<200){
        height = 200;
    }
    let width = Math.floor((window.outerWidth || 800) * 0.8);
    if(width<200){
        width = 200;
    }

    window.open(downloadUrl, '_blank', `scrollbars=yes,menubar=no,height=${height},width=${width},resizable=yes`).focus();
};

const downloadBlob = (blob, filename) => {
    if (typeof window.navigator.msSaveOrOpenBlob !== 'undefined') {
        // IE workaround for "HTML7007:
        //  One or more blob URLs were revoked by closing the blob for which they were created.
        //  These URLs will no longer resolve as the data backing the URL has been freed."
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        let URL = window.URL || window.webkitURL;
        let downloadUrl = URL.createObjectURL(blob);

        if (filename) {
            // use HTML5 a[download] attribute to specify filename
            let a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
                windowOpenFallback(downloadUrl);
            } else {
                a.href = downloadUrl;
                a.style = "display: none";
                a.download = filename;
                document.body.appendChild(a);
                a.click();
            }
            setTimeout(function () {
                try{
                    document.body.removeChild(a);
                }catch(e){
                    //silently ignore...
                }
            }, 100); // cleanup
        } else {
            windowOpenFallback(downloadUrl);
        }
        setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
        }, 100); // cleanup
    }
};

const base64ToBlob = (base64Str, mimeType) => {
    let binary = window.atob(base64Str.replace(/\s/g, ''));
    let size = binary.length;
    let arr = new Uint8Array(new ArrayBuffer(size));
    for (let i = 0; i < size; i++) {
        arr[i] = binary.charCodeAt(i);
    }
    return new Blob([arr], { type: mimeType });
};

export {base64ToBlob, downloadBlob, windowOpenFallback};
