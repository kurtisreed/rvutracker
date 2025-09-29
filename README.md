# RVU Tracker

Medical practice RVU (Relative Value Unit) tracking application for dermatology procedures, including Mohs surgery analytics.

## Setup

### 1. Database Configuration

1. Copy the example database configuration:
   ```bash
   cp db_connect.example.php db_connect.php
   ```

2. Edit `db_connect.php` with your actual database credentials:
   ```php
   define('DB_SERVER', 'localhost');
   define('DB_USERNAME', 'your_username');
   define('DB_PASSWORD', 'your_password');
   define('DB_NAME', 'your_database');
   ```

3. **Important**: Never commit `db_connect.php` to version control. It's already included in `.gitignore`.

### 2. Authentication Setup

1. Copy the example auth configuration:
   ```bash
   cp auth_config.example.php auth_config.php
   ```

2. Generate a secure hash for your PIN:
   ```bash
   php generate_hash.php
   ```
   Or access via browser: `http://yourdomain.com/rvutracker/generate_hash.php`

3. Copy the generated hash and paste it into `auth_config.php`:
   ```php
   define('AUTH_PIN_HASH', 'your_generated_hash_here');
   ```

4. **IMPORTANT**: Delete `generate_hash.php` after generating your hash for security!

5. Configure session timeout in `auth_config.php` (default: 1 hour):
   ```php
   define('SESSION_TIMEOUT', 3600); // in seconds
   ```

### Database Tables

The application requires three MySQL tables:
- `rvudata` - Stores daily RVU entries
- `mohsdata` - Stores Mohs surgery case details
- `rvu_tracker_2024` - Lookup table for CPT codes to RVU values

### Requirements

- PHP 7.0+
- MySQL 5.6+
- Web server (Apache/Nginx)

## Security Features

- **Session-based Authentication**: Secure session management with automatic timeout
- **Password Hashing**: PIN is hashed using bcrypt (never stored in plaintext)
- **SQL Injection Protection**: All database queries use prepared statements
- **Session Security**:
  - Session regeneration on login to prevent fixation attacks
  - Automatic timeout after inactivity (configurable)
  - Secure logout that destroys sessions properly
- **Brute Force Protection**: Failed login attempts are logged and delayed
- **Secure Configuration**: Sensitive files (`db_connect.php`, `auth_config.php`) excluded from version control

## Features

- **RVU Code Entry**: Quick-entry system for CPT codes with multipliers
- **RVU Summary**: Analytics showing RVUs, income, and encounters across time periods
- **Mohs Data Entry**: Detailed case tracking for Mohs surgery procedures
- **Mohs Summary**: Statistics on closure types, tumor types, and referral sources
- **Charts**: Cumulative tracking and rolling averages using Chart.js

## File Structure

- `index.html` - Main application interface
- `script.js` - Frontend JavaScript logic
- `styles.css` - Application styling
- `db_connect.php` - Database connection (not in repo)
- `*.php` - Backend API endpoints

## Development

No build process required. Edit files directly and refresh browser to see changes.

## License

Private medical practice application.