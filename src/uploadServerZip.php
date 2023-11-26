<?php

declare(strict_types=1);

ob_start();

$fileName = $_GET['file_name'] ?? '';

$zipfile = 'responseFileAndSignature.zip';

$files = glob('../client_decrypted_files/*' . $fileName . '*');
$files = array_merge($files, glob('../client_signed_files/*' . $fileName . '*'));

$zip = new ZipArchive();
$res = $zip->open($zipfile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

echo $res . PHP_EOL;

if ($res !== true) {
    throw new RuntimeException('Could not create zip file.');
}

foreach ($files as $file) {
    $zip->addFile($file, basename($file));
}

$zip->close();

ob_end_clean();

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename=' . $zipfile);

readfile($zipfile);

unlink($zipfile);
