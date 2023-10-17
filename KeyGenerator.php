<?php

declare(strict_types=1);

const SYMMETRIC_KEY_FILE = __DIR__ . '/keys/tajni_kljuc.txt';

final class KeyGenerator
{
    public function __construct()
    {
        $this->generateSymmetricKey();

    }

    private function generateSymmetricKey(): void
    {
        $symmetricKey = bin2hex(random_bytes(32));

        if (!file_put_contents(SYMMETRIC_KEY_FILE, $symmetricKey)) {
            throw new RuntimeException('Could not save symmetric key in file');
        }

        echo 'Symmetric key is generated and stored in file.' . PHP_EOL;
    }

    {
        }
    }
}
