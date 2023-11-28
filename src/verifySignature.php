<?php

declare(strict_types=1);

require 'DigitalSignature.php';

$fileName = $_GET['file_name'] ?? '';

$digitalSignature = new DigitalSignature;

$hashFromSignature = $digitalSignature->decryptSignature($fileName);

$hashFromFile = trim(file_get_contents('../client_message_digests/' . $fileName));

if ($hashFromSignature === null) {
    echo 'Error decrypting signature.';
    exit;
}

if ($hashFromFile === $hashFromSignature) {
    echo 'Signature is valid.';
} else {
    echo 'Signature is not valid.';
}
