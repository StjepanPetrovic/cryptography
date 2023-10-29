<?php

declare(strict_types=1);

require 'Decryptor.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientFile = '../client_encrypted_files/' . basename($_FILES['file']['name']);

    $initVector = $_POST['iv'];

    if (move_uploaded_file($_FILES['file']['tmp_name'], $clientFile)) {
        echo 'File uploaded successfully.';

        $decryptor = new Decryptor;
        $decryptor->decryptFile(basename($clientFile), $initVector);
    } else {
        echo 'Error uploading the file.';
    }
}
