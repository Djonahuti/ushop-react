# How to Enable PostgreSQL Extensions in cPanel

## Problem
If you're seeing "could not find driver" errors, it means the PostgreSQL PHP extensions are not enabled.

## Solution

### Step 1: Access PHP Selector in cPanel
1. Log in to your cPanel account
2. Go to **Software** → **Select PHP Version** (or **MultiPHP Manager**)
3. Select your PHP version (you're using PHP 8.3.9)

### Step 2: Enable PostgreSQL Extensions
1. Click on **Extensions** tab (or **Extensions** button)
2. Look for and enable the following extensions:
   - ✅ **pdo_pgsql** (PDO PostgreSQL driver)
   - ✅ **pgsql** (PostgreSQL driver)

### Step 3: Save Changes
1. Click **Save** or **Apply** to save your changes
2. Wait a few seconds for the changes to take effect

### Step 4: Verify
1. Visit: `https://www.ushop.com.ng/api/test_db.php`
2. You should see:
   - `"pdo_pgsql_loaded": true`
   - `"pgsql_loaded": true`
   - Connection should succeed

## Alternative: If Extensions are Not Available

If the PostgreSQL extensions are not available in your cPanel PHP selector, you may need to:

1. **Contact your hosting provider** to enable PostgreSQL support
2. **Check if PostgreSQL is installed** on your server
3. **Consider using a different hosting plan** that supports PostgreSQL

## Troubleshooting

### Extension Still Not Loading?
- Clear PHP opcache: Some hosts cache PHP configuration
- Restart PHP-FPM: Contact your host or use cPanel's "Restart Services" if available
- Check PHP.ini: The extensions should be listed in `php.ini`

### Still Getting Errors?
1. Verify your database credentials in `api/config.php`
2. Check that your PostgreSQL database is actually created in cPanel
3. Verify the database user has proper permissions
4. Check if your hosting plan supports PostgreSQL (some shared hosting plans don't)

## Important Notes

- After enabling extensions, it may take a few minutes for changes to propagate
- Some hosting providers require you to contact support to enable PostgreSQL
- If your hosting plan doesn't support PostgreSQL, you may need to upgrade or switch providers

