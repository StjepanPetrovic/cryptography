let lastSentFile = null;

$(document).ready(function () {
        let aesInitVector = null;

        $('#text_area_encryption_key').on('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
        });

        $('#encrypt-form').submit(async function (event) {
                event.preventDefault();

                let file = $('#file_to_encrypt')[0].files[0];

                let key = $('#text_area_encryption_key').val();

                if (file === undefined || key === '') {
                        alert('Please select a file to encrypt and add encryption key.');

                        return;
                } else if (key.length !== 64 && !(key.startsWith('-----BEGIN PUBLIC KEY-----') && key.endsWith('-----END PUBLIC KEY-----'))) {
                        alert('Please use (64 bit) symmetric key or (public) asymmetric key.')

                        return;
                }

                let cryptoKey = null;

                if (key.length === 64) {
                        aesInitVector = crypto.getRandomValues(new Uint8Array(16));

                        cryptoKey = await createSymmetricCryptoKeyFromString(key);

                        symmetricEncryptFile(file, cryptoKey, aesInitVector);
                }

                if (key.startsWith('-----BEGIN PUBLIC KEY-----') && key.endsWith('-----END PUBLIC KEY-----')) {
                        aesInitVector = null;

                        cryptoKey = await createAsymmetricPublicKeyFromPemString(key);

                        asymmetricEncryptFile(file, cryptoKey);
                }
        });

        $('#send-form').submit(function (event) {
                event.preventDefault();

                let file = $('#file_to_send')[0].files[0];

                if (file === undefined) {
                        alert('Please select a file to send.');

                        return;
                }

                let formData = new FormData();

                formData.append('file', file);

                if (aesInitVector) {
                        formData.append('iv', buf2hex(aesInitVector));
                }

                $.ajax({
                        url: '../src/uploadClient.php',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                                alert(data);
                        }
                });

                lastSentFile = file.name;
                lastSentFile = lastSentFile.substring(0, lastSentFile.length - 4);
        });
});

function hexStringToArrayBuffer(hexString) {
        const buffer = new ArrayBuffer(hexString.length / 2);
        const view = new DataView(buffer);
        for (let i = 0; i < hexString.length; i += 2) {
                view.setUint8(i / 2, parseInt(hexString.substr(i, 2), 16));
        }
        return buffer;
}

function buf2hex(buffer) {
        return [...new Uint8Array(buffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
}

function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);

        for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
        }

        return buf;
}

function createSymmetricCryptoKeyFromString(key) {
        let secretKey = hexStringToArrayBuffer(key);

        return crypto.subtle.importKey(
            'raw',
            secretKey,
            {name: 'AES-CBC', length: 256},
            true,
            ['encrypt', 'decrypt']
        )
}

async function createAsymmetricPublicKeyFromPemString(key) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = key.substring(
            pemHeader.length,
            key.length - pemFooter.length - 1,
        );

        const binaryDerString = window.atob(pemContents);

        const binaryDer = str2ab(binaryDerString);

        return window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {name: "RSA-OAEP", hash: "SHA-1" },
            true,
            ["encrypt"],
        );
}

function symmetricEncryptFile(file, cryptoKey, iv) {
        let reader = new FileReader();

        let fileName = file.name;

        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
                file = event.target.result;

                crypto.subtle.encrypt(
                    { name: "AES-CBC", iv: iv},
                    cryptoKey,
                    file
                ).then(function (encryptedFile) {
                        downloadFile(encryptedFile, fileName);
                });
        };
}

function asymmetricEncryptFile(file, cryptoKey) {
        let reader = new FileReader();

        let fileName = file.name;

        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
                file = event.target.result;

                crypto.subtle.encrypt(
                    { name: "RSA-OAEP" },
                    cryptoKey,
                    file
                ).then(function (encryptedFile) {
                        downloadFile(encryptedFile, fileName);
                }).catch(function (error) {
                        console.error(error);
                });
        };
}

function downloadFile(file, fileName) {
        let blob = new Blob([file], { type: 'application/octet-stream' });
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');

        a.href = url;
        a.download = fileName + '.enc';

        document.body.appendChild(a);

        a.click();
        a.remove();
}

function getFilesFromServer() {
        $.ajax({
                url: '../src/uploadServerZip.php',
                type: 'GET',
                data: {
                        file_name: lastSentFile
                },
                xhrFields: {
                        responseType: 'blob'
                },
                success: function (data) {
                        let url = URL.createObjectURL(data);
                        let a = document.createElement('a');

                        a.href = url;
                        a.download = 'serverMessage.zip';

                        document.body.appendChild(a);

                        a.click();
                        a.remove();
                },
                error: function(jqXHR, textStatus, errorThrown){
                        console.log('AJAX request failed: ', textStatus, errorThrown);
                }
        });
}
