<?php

declare(strict_types=1);

final class Decryptor
{
    public function decryptFile(string $fileToDecrypt, string $iv): void
    {
        $fileToDecryptPath = '../client_encrypted_files/' . $fileToDecrypt;

        $fileContent = file_get_contents($fileToDecryptPath);

        $key = file_get_contents('../keys/tajni_kljuc.txt');

        $decryptedContent = openssl_decrypt(
            $fileContent,
            'aes-256-cbc',
            hex2bin($key),
            OPENSSL_RAW_DATA,
            hex2bin($iv),
        );

        if (!$decryptedContent) {
            throw new RuntimeException('Could not decrypt file.');
        }

        $decryptedFilePath = '../client_decrypted_files/' . basename($fileToDecrypt);

        $decryptedFilePath = substr($decryptedFilePath, 0, -4);

        file_put_contents($decryptedFilePath, $decryptedContent);
    }
}
