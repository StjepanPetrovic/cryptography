<?php

declare(strict_types=1);

require 'Decryptor.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientFile = '../client_encrypted_files/' . basename($_FILES['file']['name']);

    if (move_uploaded_file($_FILES['file']['tmp_name'], $clientFile)) {
        echo 'File uploaded successfully.';

        $decryptor = new Decryptor;

        if (isset($_POST['iv'])) {
            $decryptor->decryptFileAES(basename($clientFile), $_POST['iv']);
        } else {
            $decryptor->decryptFileRSA(basename($clientFile));
        }
    } else {
        echo 'Error uploading the file.';
    }
}
