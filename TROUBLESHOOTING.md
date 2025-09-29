# Authentication Troubleshooting Guide

If you're getting an "Invalid PIN" error on your shared hosting, follow these steps:

## Quick Diagnosis

### Step 1: Upload test_auth.php
1. Upload `test_auth.php` to your shared hosting server
2. Access it via browser: `http://yourdomain.com/rvutracker/test_auth.php`
3. Review the test results

### Step 2: Check Common Issues

#### Issue 1: auth_config.php Not Uploaded
**Symptoms:** Test shows "auth_config.php does NOT exist"

**Solution:**
```bash
# Copy the example file on your server
cp auth_config.example.php auth_config.php
# Then generate a hash (see below)
```

#### Issue 2: Incorrect Hash in auth_config.php
**Symptoms:** Test shows "PIN '1640' does NOT verify"

**Solution:**
1. Run `test_auth.php` - it will generate a fresh hash
2. Copy the generated hash
3. Edit `auth_config.php` on your server
4. Replace AUTH_PIN_HASH with the new hash

#### Issue 3: PHP Version Too Old
**Symptoms:** Test shows "password_hash() is NOT available"

**Solution:**
- Your PHP version needs to be 5.5.0 or higher
- Contact your hosting provider to upgrade PHP
- Most shared hosts support PHP 7.4 or 8.x

#### Issue 4: Hash Corrupted During Upload
**Symptoms:** Hash looks different on server vs local

**Solution:**
- Hash might have been corrupted during FTP upload
- Try uploading in binary mode instead of ASCII mode
- Or regenerate hash directly on the server

## Manual Fix: Generate Hash on Server

### Option A: Using test_auth.php
1. Upload `test_auth.php` to your server
2. Access it in browser
3. Copy the "Fresh hash" shown in Test 4
4. Paste into `auth_config.php`

### Option B: Using generate_hash.php
1. Upload `generate_hash.php` to your server
2. Edit line 9 to set your desired PIN:
   ```php
   $your_pin = "1640";  // Change this
   ```
3. Access via browser: `http://yourdomain.com/rvutracker/generate_hash.php`
4. Copy the hash
5. Paste into `auth_config.php`:
   ```php
   define('AUTH_PIN_HASH', 'paste_hash_here');
   ```
6. **DELETE generate_hash.php from server!**

### Option C: Using PHP Command Line (if available)
```bash
php -r "echo password_hash('1640', PASSWORD_BCRYPT);"
```

## Verify auth_config.php Format

Your `auth_config.php` should look exactly like this:

```php
<?php
// Authentication configuration
define('AUTH_PIN_HASH', '$2y$12$your_actual_hash_goes_here');

// Session configuration
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds
define('SESSION_NAME', 'RVU_TRACKER_SESSION');
?>
```

**Common Mistakes:**
- ❌ Missing opening `<?php` tag
- ❌ Hash not enclosed in single quotes `'`
- ❌ Semicolon `;` missing at end of define statements
- ❌ Extra spaces or line breaks in the hash
- ❌ Wrong constant name (must be `AUTH_PIN_HASH`)

## Test After Fixing

1. Clear your browser cache and cookies
2. Try logging in again
3. Check PHP error logs on your server for clues
4. If still failing, run `test_auth.php` again

## Check File Permissions

Ensure files are readable by web server:
```bash
chmod 644 auth_config.php
chmod 644 verify_pin.php
chmod 644 auth_check.php
```

## Still Not Working?

Check these additional issues:

### Sessions Not Working
- Some shared hosts require special session configuration
- Check if session files can be written to server temp directory
- Try adding to a `.htaccess` file (if Apache):
  ```
  php_value session.save_path "/path/to/writable/directory"
  ```

### PHP Short Tags Disabled
- Make sure you're using `<?php` not `<?`
- All our files use full tags, but check if any got modified

### Path Issues
- Verify `require_once 'auth_config.php'` is finding the file
- Try using absolute paths if needed:
  ```php
  require_once(__DIR__ . '/auth_config.php');
  ```

## Get More Debug Info

Temporarily add this to the top of `verify_pin.php` (REMOVE after testing):

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Your existing code...
```

This will show any PHP errors directly in the browser.

## Security Note

**After troubleshooting, DELETE these files from your server:**
- `test_auth.php`
- `generate_hash.php`
- `TROUBLESHOOTING.md` (optional)

They contain sensitive testing information and should not remain on a production server.