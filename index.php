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
            <label class="label_key">
                Encryption key:
                <textarea id="text_area_encryption_key" name="encryption_key" rows="3"></textarea>
            </label>
            <input type="submit" value="Encrypt">
        </form>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function() {
            $('#text_area_encryption_key').on('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    </script>
</body>
</html>
