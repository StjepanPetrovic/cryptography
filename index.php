<?php

require 'src/KeyGenerator.php';

$keyGenerator = new KeyGenerator();

if (!file_exists('client_encrypted_files') || !file_exists('client_decrypted_files')) {
    if ((!mkdir('client_encrypted_files', 0777, true) && !is_dir('client_encrypted_files'))
        || (!mkdir('client_decrypted_files', 0777, true) && !is_dir('client_decrypted_files'))) {
        throw new \RuntimeException('Directory "client_encrypted_files" was not created');
    }
} else {
    $encryptedFiles = glob('client_encrypted_files/*');
    $decryptedFiles = glob('client_decrypted_files/*');

    foreach ($encryptedFiles as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }

    foreach ($decryptedFiles as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cryptography</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="container">
        <form id="encrypt-form" class="form" method="post" enctype="multipart/form-data">
            <label>
                File to encrypt:
                <input id="file_to_encrypt" type="file" name="file_to_encrypt">
            </label>
            <label class="label_key">
                Encryption key:
                <textarea id="text_area_encryption_key" name="encryption_key" rows="3"></textarea>
            </label>
            <input type="submit" value="Encrypt and Download file">
        </form>
        <div class="container-server">
            <div class="server-data">
                <h4>Server symmetric key:</h4>
                <p>
                    <?= $keyGenerator->getKey(KeyGenerator::SYMMETRIC_KEY_FILE) ?>
                </p>
                <h4>Server public key:</h4>
                <p>
                    <?= $keyGenerator->getKey(KeyGenerator::PUBLIC_KEY_FILE) ?>
                </p>
            </div>
            <div class="server-send-form">
                <form id="send-form" class="form" method="post" enctype="multipart/form-data">
                    <label>
                        File to send:
                        <input id="file_to_send" type="file" name="file_to_send">
                    </label>
                    <input type="submit" value="Send file to server">
                </form>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="public/script.js"></script>
</body>
</html>
