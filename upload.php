<?php

declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $targetFile = 'client_encrypted_files/' . basename($_FILES['file']['name']);

    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        echo 'File uploaded successfully.';
    } else {
        echo 'Error uploading the file.';
    }
}
