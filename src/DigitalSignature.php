<?php

declare(strict_types=1);

final class DigitalSignature
{
    public function calculateMessageDigest(string $fileToDigest): void
    {
        $fileToDigestPath = '../client_decrypted_files/' . $fileToDigest;

        $fileContent = trim(file_get_contents($fileToDigestPath));

        $digest = openssl_digest($fileContent, 'SHA256');

        if (!$digest) {
            throw new RuntimeException('Could not calculate message digest.');
        }

        $digestFilePath = '../client_message_digests/' . $fileToDigest;

        file_put_contents($digestFilePath, $digest);
    }

    public function encryptMessageDigest(string $fileToSign): void
    {
        $fileToSignPath = '../client_message_digests/' . $fileToSign;

        $digest = file_get_contents($fileToSignPath);

        $privateKey = openssl_pkey_get_private(file_get_contents('../keys/privatni_kljuc.txt'));

        $signature = '';

        if (!openssl_private_encrypt(
            $digest,
            $signature,
            $privateKey,
        )) {
            throw new RuntimeException('Could not sign message digest.' . PHP_EOL . openssl_error_string());
        }

        $signature = base64_encode($signature);

        $signatureFilePath = '../client_signed_files/signed_' . $fileToSign;

        file_put_contents($signatureFilePath, $signature);
    }

    public function decryptSignature(string $fileToDecrypt): string
    {
        $fileToDecryptPath = '../client_signed_files/signed_' . $fileToDecrypt;

        $fileContent = file_get_contents($fileToDecryptPath);

        $publicKey = openssl_pkey_get_public(file_get_contents('../keys/javni_kljuc.txt'));

        $decryptedContent = '';

        try {
            openssl_public_decrypt(
                base64_decode($fileContent),
                $decryptedContent,
                $publicKey,
            );
        } catch (Exception $e) {
            return '';
        }

        return $decryptedContent;
    }
}
