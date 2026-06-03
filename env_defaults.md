# Environment Configuration

## Environment

- **NODE_ENV**: `development`

## MongoDB

- **DATABASE_URI**: `mongodb://localhost:27017/test`

## Application

- **PORT**: `5000`
- **REDIS_PORT**: `6379`
- **REDIS_HOST**: `localhost`

## JWT Configuration

- **JWT_SECRET_KEY**: `# You can generate a random secret using openssl rand -hex 64`
- **JWT_ALGORITHM**: `HS256` # Algorithm used for signing JWT
- **LOGIN_JWT_EXPIRY**: `1h` # 1 hour expiration for login tokens
- **VERIFICATION_JWT_EXPIRY**: `10m` # 10 minutes expiration for verification tokens

## Cookies Configuration

- **COOKIE_NAME**: `theSmartTowers` # Updated to match .env configuration
- **COOKIE_HTTP_ONLY**: `true` # Prevents JavaScript access to cookies
- **COOKIE_SAME_SITE**: `Lax` # Provides some protection against CSRF attacks
- **COOKIE_PATH**: `/` # Cookie is valid for the entire domain
- **COOKIE_SHORT_EXPIRY**: `300000` # Updated to milliseconds
- **COOKIE_LONG_EXPIRY**: `604800000` # Updated to milliseconds

## Email Configuration

- **USER_EMAIL**: `emailing@geocellcommunications.com` # Your email
- **USER_PASSWORD**: `[9awabNJ` # Your email password
- **EMAIL_HOST**: `smtp.hostinger.com` # Updated to reflect current setup
- **EMAIL_SERVICE**: `hostinger` # Updated to reflect current setup
- **EMAIL_PORT**: `587`

## OPENROUTER API KEY

- **OPENROUTER_API_KEY**: `# You can get an API key from https://openrouter.geocell.ge/`
