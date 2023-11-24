# Crypthography

## Symmetric Crypthography (AES cryptography)

1. Used for symmetric key generation (PHP):

   - `random_bytes` https://www.php.net/manual/en/function.random-bytes.php


2. Used for symmetric encryption (JavaScript - WebCrypto):

   - `crypto.getRandomValues` https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
   - `crypto.subtle.importKey` https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
   - `crypto.subtle.encrypt` https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt


3. Used for symmetric decryption (PHP - OpenSSL):

   - `openssl_decrypt` https://www.php.net/manual/en/function.openssl-decrypt.php

## Asymmetric Encryption (RSA cryptopsystem)

1. Used for asymmetric key generation (PHP - OpenSSL):

   - `openssl_pkey_new` https://www.php.net/manual/en/function.openssl-pkey-new.php
   - `openssl_pkey_export_to_file` https://www.php.net/manual/en/function.openssl-pkey-export-to-file.php
   - `openssl_pkey_get_details` https://www.php.net/manual/en/function.openssl-pkey-get-details.php


2. Used for asymmetric encryption (JavaScript - WebCrypto):

   - `crypto.subtle.importKey` https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey (it is necessary to use SHA-1 as the hash function, because of the padding `OPENSSL_PKCS1_OAEP_PADDING` in PHP OpenSSL decryption function)
   - `crypto.subtle.encrypt` https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt (it is only possible to encrypt a small amount of data (190 bytes in this case - https://crypto.stackexchange.com/questions/42097/what-is-the-maximum-size-of-the-plaintext-message-for-rsa-oaep, so it is necessary to use a symmetric encryption algorithm to encrypt the data and then encrypt the key with the public key)


3. Used for asymmetric decryption (PHP - OpenSSL):

   - `openssl_pkey_get_private` https://www.php.net/manual/en/function.openssl-pkey-get-private.php
   - `openssl_private_decrypt` https://www.php.net/manual/en/function.openssl-private-decrypt.php
   - `openssl_error_string` https://www.php.net/manual/en/function.openssl-error-string.php
