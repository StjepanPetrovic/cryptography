<?php

declare(strict_types=1);

final class Decryptor
{
    public function decryptFileAES(string $fileToDecrypt, string $iv): void
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

        $decryptedContent .= "\n\nServer saw message and want to send you 1,000,000$!";

        $decryptedFilePath = '../client_decrypted_files/' . basename($fileToDecrypt);

        $decryptedFilePath = substr($decryptedFilePath, 0, -4);

        file_put_contents($decryptedFilePath, $decryptedContent);
    }

    public function decryptFileRSA(string $fileToDecrypt): void
    {
        $fileToDecryptPath = '../client_encrypted_files/' . $fileToDecrypt;

        $fileContent = file_get_contents($fileToDecryptPath);

        $privateKey = openssl_pkey_get_private(file_get_contents('../keys/privatni_kljuc.txt'));

        $decryptedContent = '';

        $isDecrypted = openssl_private_decrypt(
            $fileContent,
            $decryptedContent,
            $privateKey,
            OPENSSL_PKCS1_OAEP_PADDING,
        );

        if (!$isDecrypted) {
            throw new RuntimeException('Could not decrypt file.' . PHP_EOL . openssl_error_string());
        }

        $decryptedContent .= "\n\nServer saw message and want to send you 1,000,000$!";

        $decryptedFilePath = '../client_decrypted_files/' . basename($fileToDecrypt);

        $decryptedFilePath = substr($decryptedFilePath, 0, -4);

        file_put_contents($decryptedFilePath, $decryptedContent);
    }
}
