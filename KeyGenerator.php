<?php

declare(strict_types=1);

final class KeyGenerator
{
    private string $symmetricKey;

    public function __construct()
    {
        $this->generateSymmetricKey();

        $this->saveKeyInFile('tajni_kljuc.txt', $this->symmetricKey);
    }

    private function generateSymmetricKey(): void
    {
        $this->symmetricKey = bin2hex(random_bytes(32));

        echo 'Symmetric key is generated.' . PHP_EOL;
    }

    private function saveKeyInFile(string $fileName, string $key): void
    {
        if (!file_put_contents($fileName, $key)) {
            throw new RuntimeException('Could not save symmetric key in file');
        }
    }
}
