$(document).ready(function () {
        $('#text_area_encryption_key').on('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
        });

        $('#encrypt-form').submit(function (event) {
                event.preventDefault();

                let file = $('#file_to_encrypt')[0].files[0];

                let key = $('#text_area_encryption_key').val();

                if (file === undefined || key === '') {
                        alert('Please select a file to encrypt and add encryption key.');

                        return;
                }

                const secretKey = hexStringToArrayBuffer(key);

                if (secretKey.byteLength === 32) {
                        createSymmetricKeyFromStringAndEncryptFile(file, secretKey);
                } else {
                        alert('Not implemented yet. Please use 32 byte key.')
                }
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

function createSymmetricKeyFromStringAndEncryptFile(file, secretKey) {
        const symmetricAlgorithmConfiguration = {
                name: 'AES-GCM',
                length: 256
        }

        crypto.subtle.importKey(
            'raw',
            secretKey,
            symmetricAlgorithmConfiguration,
            false,
            ['encrypt', 'decrypt']
        ).then(function (cryptoKey) {
                let iv = window.crypto.getRandomValues(new Uint8Array(12));

                let reader = new FileReader();

                reader.readAsArrayBuffer(file);

                reader.onload = function (event) {
                        file = event.target.result;

                        crypto.subtle.encrypt(
                            { name: "AES-GCM", iv },
                            cryptoKey,
                            file
                        ).then(function (encryptedFile) {
                                let blob = new Blob([encryptedFile], { type: 'application/octet-stream' });
                                let url = URL.createObjectURL(blob);
                                let a = document.createElement('a');
                                a.href = url;
                                a.download = 'client-encrypted-file.enc';
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                        });
                };
        });
}
