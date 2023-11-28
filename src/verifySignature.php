<?php

declare(strict_types=1);

require 'DigitalSignature.php';

$fileName = $_GET['file_name'] ?? '';

$digitalSignature = new DigitalSignature;

$digitalSignature->calculateMessageDigest($fileName);

$messageDigestFromFile = file_get_contents('../client_message_digests/' . $fileName);

$messageDigestFromSignature = $digitalSignature->decryptSignature($fileName);

if ($messageDigestFromFile === $messageDigestFromSignature) {
    echo 'Signature is VALID.';
} else {
    echo 'Attention! Signature is NOT VALID.';
}
