<?php

declare(strict_types=1);

final class DigitalSignature
{
    public function calculateMessageDigest(string $fileToDigest): void
    {
        $fileToDigestPath = '../client_decrypted_files/' . $fileToDigest;

        $fileContent = file_get_contents($fileToDigestPath);

        $digest = openssl_digest($fileContent, 'sha256');

        if (!$digest) {
            throw new RuntimeException('Could not calculate message digest.');
        }

        $digestFilePath = '../client_message_digests/' . $fileToDigest;

        file_put_contents($digestFilePath, $digest);
    }
}
