$(document).ready(function () {
        let aesInitVector = crypto.getRandomValues(new Uint8Array(16));

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
                } else if (key.length !== 64) {
                        alert('Not implemented yet. Please use 64 character key.')

                        return;
                }

                let cryptoKey = await createSymmetricCryptoKeyFromString(key);

                if (key.length === 64) {
                        encryptFileAndDownload(file, cryptoKey, aesInitVector);
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

                formData.append('iv', buf2hex(aesInitVector));

                $.ajax({
                        url: '../src/upload.php',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                                alert(data);
                        }
                });
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

function encryptFileAndDownload(file, cryptoKey, iv) {
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
                        let blob = new Blob([encryptedFile], { type: 'application/octet-stream' });
                        let url = URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = fileName + '.enc';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                });
        };
}
