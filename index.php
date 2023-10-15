<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cryptography</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <form class="form" action="encrypt.php" method="post" enctype="multipart/form-data">
            <label>
                File to encrypt:
                <input type="file" name="file_to_encrypt">
            </label>
            <input type="submit" value="Encrypt">
        </form>
        <form class="form" action="decrypt.php" method="post" enctype="multipart/form-data">
            <label>
                File to decrypt:
                <input type="file" name="file_to_encrypt">
            </label>
            <input type="submit" value="Decrypt">
        </form>
    </div>
</body>
</html>
