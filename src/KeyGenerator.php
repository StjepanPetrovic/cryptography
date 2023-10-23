<?php

declare(strict_types=1);

final class KeyGenerator
{
    public const SYMMETRIC_KEY_FILE = __DIR__ . '/../keys/tajni_kljuc.txt';
    public const PRIVATE_KEY_FILE = __DIR__ . '/../keys/privatni_kljuc.txt';
    public const PUBLIC_KEY_FILE = __DIR__ . '/../keys/javni_kljuc.txt';

    private const PRIVATE_KEY_CONFIGURATION = [
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ];

    public function __construct()
    {
        $this->generateSymmetricKey();

        $this->generateAsymmetricKeys();
    }

    private function generateSymmetricKey(): void
    {
        $symmetricKey = bin2hex(random_bytes(32));

        if (!file_put_contents(self::SYMMETRIC_KEY_FILE, $symmetricKey)) {
            throw new RuntimeException('Could not save symmetric key in file');
        }
    }

    private function generateAsymmetricKeys(): void
    {
        $privateKey = openssl_pkey_new(self::PRIVATE_KEY_CONFIGURATION);

        if (!$privateKey instanceof OpenSSLAsymmetricKey){
            throw new RuntimeException('Could not generate private key.');
        }

        if (!openssl_pkey_export_to_file($privateKey, self::PRIVATE_KEY_FILE)) {
            throw new RuntimeException('Could not save private key in file.');
        }

        $publicKey = openssl_pkey_get_details($privateKey)['key'];

        if (!file_put_contents(self::PUBLIC_KEY_FILE, $publicKey)) {
            throw new RuntimeException('Could not save public key in file.');
        }
    }

    public function getKey(string $file): string
    {
        $key = file_get_contents($file);

        if (!$key) {
            throw new RuntimeException('Could not read key from file.');
        }

        return $key;
    }
}
