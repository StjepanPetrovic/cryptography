<?php

declare(strict_types=1);

const SYMMETRIC_KEY_FILE = __DIR__ . '/keys/tajni_kljuc.txt';
const PRIVATE_KEY_FILE = __DIR__ . '/keys/privatni_kljuc.txt';
const PUBLIC_KEY_FILE = __DIR__ . '/keys/javni_kljuc.txt';

const PRIVATE_KEY_CONFIGURATION = [
    'private_key_bits' => 2048,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
];

final class KeyGenerator
{
    public function __construct()
    {
        $this->generateSymmetricKey();

        $this->generateAsymmetricKeys();
    }

    private function generateSymmetricKey(): void
    {
        $symmetricKey = bin2hex(random_bytes(32));

        if (!file_put_contents(SYMMETRIC_KEY_FILE, $symmetricKey)) {
            throw new RuntimeException('Could not save symmetric key in file');
        }

        echo 'Symmetric key is generated and stored in file.' . PHP_EOL;
    }

    private function generateAsymmetricKeys(): void
    {
        $asymmetricKey = openssl_pkey_new(PRIVATE_KEY_CONFIGURATION);

        if (!$asymmetricKey instanceof OpenSSLAsymmetricKey){
            throw new RuntimeException('Could not generate private key.');
        }

        if (!openssl_pkey_export_to_file($asymmetricKey, PRIVATE_KEY_FILE)) {
            throw new RuntimeException('Could not save private key in file.');
        }

        $publicKey = openssl_pkey_get_details($asymmetricKey)['key'];

        if (!file_put_contents(PUBLIC_KEY_FILE, $publicKey)) {
            throw new RuntimeException('Could not save public key in file.');
        }

        echo 'Private key and public key are generated and stored in files.' . PHP_EOL;
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
