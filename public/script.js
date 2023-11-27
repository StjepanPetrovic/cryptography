let lastSentFile = null;

$(document).ready(function () {
        let aesInitVector = null;

        $('#text_area_encryption_key').on('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
        });

        $('#encryption_key_signature').on('input', function() {
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

        $('#verify-response-form').submit(async function (event) {
                event.preventDefault();

                let originalMessageFile = $('#original_response_file')[0].files[0];
                let digitalSignatureFile = $('#digital_signature_file')[0].files[0];
                let key = $('#encryption_key_signature').val();

                if (originalMessageFile === undefined || digitalSignatureFile === undefined || key === '') {
                        alert('Please select original response file and digital signature file and add public key.');

                        return;
                } else if (!(key.startsWith('-----BEGIN PUBLIC KEY-----') && key.endsWith('-----END PUBLIC KEY-----'))) {
                        alert('Please use (public) asymmetric key in PEM format.')

                        return;
                }

                let publicKey = await createAsymmetricPublicKeyFromPemStringPKCS(key);

                console.log("public key je:", publicKey);

                let originalMessageDigest = await calculateMessageDigest(originalMessageFile);

                console.log("original message digest je:", originalMessageDigest);

                let verifyResult = await verifyDigitalSignature(originalMessageFile, digitalSignatureFile, publicKey);

                console.log("digital signature is: ", verifyResult);
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

async function createAsymmetricPublicKeyFromPemStringPKCS(key) {
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
            {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["verify"],
        );
}

// async function createAsymmetricPrivateKeyFromPemStringPKCS() {
//         const pemContents = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+rLzyjOYH30pv\n" +
//             "xM8BaSMZmEw1MzcXGLNAxE1AXprb8VBLIm+ydzR+Zrs/IJ2506vOvpMTTV2GvFnv\n" +
//             "V5NEKfiDSG2gQhjepH4bklyyPMxi0oGafD0N6UNba43xhxmfumsAfq2tjxdaAESE\n" +
//             "pSG68sLp0OfTjn7LqcpfUgpIsW3pRN0mh0fo7sZmxSihRdv/sO8OB3CoanjFaP4Q\n" +
//             "p1b8B/51zruvBpVyVNQ8mLkKuUGMNJ5diGdTd3HR1rp8vjtX4lt2e2HqaVvVJDpG\n" +
//             "EArc/zSZAlccPlImGBqrSZ/LcnEwnbzt+oxpBuQkwgt9FqHrfFPu1X889U7PyaSH\n" +
//             "Xuvb3eWpAgMBAAECggEAcO0hIo2sFvF5xmRLLUy1Sw1V5RQmBnnMgAlCr2LYWHa8\n" +
//             "1SLaAFp1Ln9tWl/YyhvA3zsjJAVn5MpcgVHemDo7QpV8x7Mdw46sWWv/llhHvCds\n" +
//             "NrBqAHksOVKjyG35EQ55HNvpxKbAb79E1UJvjacFJTFie3sjQT+X6YhPKupabBIl\n" +
//             "K+1uCAJZtE5zmBp/4Ej0Yj9IIfGz0W0Bqbpe5SIOY6CKIoSRnkRlpfpaDOHA5erd\n" +
//             "jB75zXKIcmiZgC8pBcLI4Afi4CIJ30hW+4vLSZzmu5suCgMWdnX1bodL90imUAGI\n" +
//             "xvxtusO8y4OdMGPWahaIzfBTyKo8usUX7e0Yvzvs2QKBgQDd+f6KBYaGr4YSkjlI\n" +
//             "5oevpnlYv6WodLc0V4L093UugUJ1O2INJpkxe0St8uELiKC7FkmCnmDmqgszCUHe\n" +
//             "5Dmkw/v+sNCrcIzELXNEpPc1PBgynX0Awz6sSM/AHdnm/fipmMeFFWfnhufgBj4X\n" +
//             "5V00LgjrxmLL1zTAkPPJISSi7wKBgQDb5oMA/sa5vhQSEkfDZiOVkvt/fbKVzh+V\n" +
//             "amQUJAqNHjMJ80Z6lbIIfuyZMWJFSp0IZD/euqBJMZNw6l96Utc/avUIfxFqAnYm\n" +
//             "6R6HoYT0ZdUXhTl8YQNTrsFn6YF/Y9XkA0mo7FMuKtlwi8y9sapxVkldpmqWCep4\n" +
//             "Rtnlo58g5wKBgEPMZJthfqpKmCe587c5ej4DGdMqjf160K4zAHOz1V3D6zmFTrh3\n" +
//             "jpjXbq22nlf4fidGcmNr3mr1iwAmlrDuglC575DmDoYelVAiFa/ktwDSfw2OnqyJ\n" +
//             "9e2HO7URKQntjnK2kFIsrJTB1rbNEVAZJTOXz++7o1dhPuKGI3/OGLOPAoGBAIHx\n" +
//             "ckJ5S2dhOiz/nmaKCccOZw2McqZxelpp1x/LuGxxhwl/N4uiv+SjVB6mfwKhN7BI\n" +
//             "xTFRqPv3jr/vz2HSaB2yj39ozxqMv9L4eLD/MjjVoBlZAYJNNZESuHk2E+76SN+H\n" +
//             "TdTDadfjPEB0bBVAUo7MxWfQujVVQLe4bnRzvsnLAoGBANaNwtR3S0xYigbgqMql\n" +
//             "ovnhJPp7asrKfDvaAuwcazBK8pwlE7z7vbRqSTZlei+SWCFIisZCo7yv+k861Qq6\n" +
//             "rHrvOxPu1uFL3ZWHo+idg+EEgzMwy0sor09TDOMySvM7FkncdTorcUjJ3EEx5yuo\n" +
//             "AOvGlb6tn/TmXuKj99CTcyfg"
//
//         const binaryDerString = window.atob(pemContents);
//
//         const binaryDer = str2ab(binaryDerString);
//
//         return window.crypto.subtle.importKey(
//             "pkcs8",
//             binaryDer,
//             {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
//             true,
//             ["sign"],
//         );
// }

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

async function calculateMessageDigest(file) {
        return new Promise((resolve) => {
                let reader = new FileReader();

                reader.readAsArrayBuffer(file);

                reader.onload = function (event) {
                        file = event.target.result;

                        crypto.subtle.digest(
                            { name: "SHA-256" },
                            file
                        ).then((messageDigest) => {
                                resolve(buf2hex(messageDigest));
                        });
                };
        });
}

async function verifyDigitalSignature(file, signature, key) {
        console.log("u decryptDigitalSignature funkciji, key je:", key);

        let fileReader = new FileReader();
        let signatureReader = new FileReader();

        fileReader.readAsText(file)
        signatureReader.readAsBinaryString(signature)
        // fileReader.readAsArrayBuffer(file);
        // signatureReader.readAsArrayBuffer(signature);

        const filePromise = new Promise((resolve) => {
                fileReader.onload = function (event) {
                        resolve(event.target.result);
                };
        });

        const signaturePromise = new Promise((resolve) => {
                signatureReader.onload = function (event) {
                        resolve(event.target.result);
                };
        });

        const [fileArrayBuffer, signatureArrayBuffer] = await Promise.all([filePromise, signaturePromise]);

        console.log("file je:", file);
        console.log("signature je:", signature);
        console.log("fileArrayBuffer je:", fileArrayBuffer);
        console.log("signatureArrayBuffer je:", signatureArrayBuffer);

        // base64 decode of signature
        let signatureAtob = window.atob(signatureArrayBuffer);
        // let fileAtob = window.atob(fileArrayBuffer);

        // convert to ArrayBuffer
        let signatureStr2ab = str2ab(signatureAtob);
        let fileStr2ab = str2ab(fileArrayBuffer);

        console.log("signatureStr2ab je:", signatureStr2ab);
        console.log("fileStr2ab je:", fileStr2ab);

        let verifyResult = await crypto.subtle.verify(
            { name: "RSASSA-PKCS1-v1_5" },
            key,
            signatureStr2ab,
            fileStr2ab
        );

        console.log("verifyResult je:", verifyResult);

        return verifyResult;
}
