# RVU Tracker

Medical practice RVU (Relative Value Unit) tracking application for dermatology procedures, including Mohs surgery analytics.

## Setup

### Database Configuration

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

### Database Tables

The application requires three MySQL tables:
- `rvudata` - Stores daily RVU entries
- `mohsdata` - Stores Mohs surgery case details
- `rvu_tracker_2024` - Lookup table for CPT codes to RVU values

### Requirements

- PHP 7.0+
- MySQL 5.6+
- Web server (Apache/Nginx)

## Security Notes

- Database credentials are stored in `db_connect.php` (not in version control)
- PIN authentication is configured in `verify_pin.php`
- All database queries use prepared statements to prevent SQL injection
- Error logging is enabled server-side

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