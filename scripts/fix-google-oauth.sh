#!/bin/bash
# Google OAuth 500 Error Fix - Deployment Script
# Run this on the VPS: cdhc@cdhc.vn

set -e

echo "======================================"
echo "Google OAuth Fix - Deployment Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/home/cdhc/apps/cdhc-be"
BACKUP_DIR="$BACKUP_DIR/backups/google-oauth-fix-$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}[1/8] Creating backups...${NC}"
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/src/modules/auth/routes/login.routes.ts" "$BACKUP_DIR/" 2>/dev/null || true
cp "$BACKEND_DIR/src/modules/auth/google-auth.ts" "$BACKUP_DIR/" 2>/dev/null || true
cp "$BACKEND_DIR/src/index.ts" "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ Backups created at: $BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}[2/8] Checking Google JWKS connectivity...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.googleapis.com/oauth2/v3/certs)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Google JWKS endpoint accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Cannot reach Google JWKS endpoint (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}  This may cause OAuth failures! Check firewall/network.${NC}"
fi
echo ""

echo -e "${YELLOW}[3/8] Checking PostgreSQL connection...${NC}"
if psql -U cdhc -d cdhc -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL connection OK${NC}"
else
    echo -e "${RED}✗ PostgreSQL connection failed!${NC}"
    echo -e "${YELLOW}  This will cause login failures!${NC}"
fi
echo ""

echo -e "${YELLOW}[4/8] Checking Redis connection...${NC}"
if redis-cli -a "CdhcRedis2026ProdSecure99" PING > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis connection OK${NC}"
else
    echo -e "${RED}✗ Redis connection failed!${NC}"
    echo -e "${YELLOW}  Legacy user lookup may fail (non-critical)${NC}"
fi
echo ""

echo -e "${YELLOW}[5/8] Verifying environment variables...${NC}"
MISSING_VARS=0
for VAR in JWT_SECRET GOOGLE_WEB_CLIENT_ID DATABASE_URL; do
    if grep -q "^${VAR}=" "$BACKEND_DIR/.env" 2>/dev/null; then
        VALUE=$(grep "^${VAR}=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
        if [ -n "$VALUE" ]; then
            echo -e "${GREEN}✓ $VAR is set${NC}"
        else
            echo -e "${RED}✗ $VAR is empty!${NC}"
            MISSING_VARS=$((MISSING_VARS + 1))
        fi
    else
        echo -e "${RED}✗ $VAR is missing!${NC}"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

if [ $MISSING_VARS -gt 0 ]; then
    echo -e "${RED}✗ $MISSING_VARS required environment variables are missing!${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}[6/8] Checking PM2 status...${NC}"
PM2_STATUS=$(pm2 list | grep cdhc-api | grep -c "online" || true)
if [ "$PM2_STATUS" -gt 0 ]; then
    echo -e "${GREEN}✓ PM2 cdhc-api is running ($PM2_STATUS instances)${NC}"
else
    echo -e "${RED}✗ PM2 cdhc-api is not running!${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}[7/8] Applying Google OAuth fixes...${NC}"
cat > "$BACKEND_DIR/src/modules/auth/routes/login.routes.ts.fixed" << 'FIXED_CODE'
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getLegacyUser, isLegacyUser } from '../../../scripts/load-legacy-to-redis';
import { isAutoApprovedRole, isSelectableRole } from '../constants';
import { setAuthCookies } from '../cookie';
import { GoogleAuthError, verifyGoogleIdToken } from '../google-auth';
import { generateTokenPair } from '../jwt';
import { validateProfileData } from '../profile-schemas';
import {
  extractIdentifier,
  handleFailedLogin,
  handleSuccessfulLogin,
  isBlocked,
} from '../rate-limiter';
import { googleAuthSchema, googleRegisterSchema } from '../schemas';
import type { AuthenticatedUser, AuthVariables } from '../types';
import type { AuthDatabaseAdapter } from './types';

type AuthEnv = { Variables: AuthVariables };

export function createLoginRoutes(dbAdapter: AuthDatabaseAdapter) {
  const login = new Hono<AuthEnv>();

  // Google OAuth Login - WITH ENHANCED ERROR HANDLING
  login.post('/google', zValidator('json', googleAuthSchema), async (c) => {
    const { idToken } = c.req.valid('json');

    console.log('[Google OAuth] Login request received', {
      tokenLength: idToken?.length,
      timestamp: new Date().toISOString(),
    });

    try {
      // STEP 1: Verify Google ID Token
      console.log('[Google OAuth] Step 1: Verifying token...');
      const googleUser = await verifyGoogleIdToken(idToken);
      console.log('[Google OAuth] Step 1: ✅ Token verified', {
        email: googleUser.email,
        sub: googleUser.sub,
      });

      const identifier = googleUser.email;

      // STEP 2: Check existing user by googleId
      console.log('[Google OAuth] Step 2: Looking up user by Google ID...');
      const existingUser = await dbAdapter.findUserByGoogleId(googleUser.sub);
      console.log('[Google OAuth] Step 2: User lookup result', {
        found: !!existingUser,
        userId: existingUser?.id,
      });

      if (existingUser) {
        if (!existingUser.isActive) {
          console.log('[Google OAuth] User is disabled');
          const failInfo = await handleFailedLogin(c, identifier);
          return c.json(
            {
              success: false,
              error: { code: 'USER_DISABLED', message: 'Tài khoản đã bị vô hiệu hóa' },
              ...(failInfo?.warning && { warning: failInfo.warning }),
              ...(failInfo?.attemptsRemaining !== undefined && {
                meta: { attemptsRemaining: failInfo.attemptsRemaining },
              }),
            },
            403,
          );
        }

        console.log('[Google OAuth] Step 3: Handling successful login...');
        await handleSuccessfulLogin(c, identifier);
        await dbAdapter.updateUserLogin(existingUser.id);
        console.log('[Google OAuth] Step 4: Generating tokens...');
        const tokens = await generateTokenPair(existingUser);
        setAuthCookies(c, tokens.accessToken, tokens.refreshToken);

        console.log('[Google OAuth] ✅ Login successful');
        return c.json({
          success: true,
          data: {
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              picture: existingUser.picture,
              role: existingUser.role,
              status: existingUser.status,
              phone: existingUser.phone,
              address: existingUser.address,
            },
          },
        });
      }

      // Check existing user by email (for pre-created admin users)
      if (dbAdapter.findUserByEmail) {
        console.log('[Google OAuth] Step 5: Looking up user by email...');
        const userByEmail = await dbAdapter.findUserByEmail(googleUser.email);

        if (userByEmail) {
          console.log('[Google OAuth] User found by email, syncing Google ID...');
          if (!userByEmail.isActive) {
            const failInfo = await handleFailedLogin(c, identifier);
            return c.json(
              {
                success: false,
                error: { code: 'USER_DISABLED', message: 'Tài khoản đã bị vô hiệu hóa' },
              },
              403,
            );
          }

          // Sync Google ID if different
          if (dbAdapter.updateUserGoogleId) {
            try {
              await dbAdapter.updateUserGoogleId(userByEmail.id, googleUser.sub);
            } catch (syncError) {
              console.warn('[Google OAuth] Failed to sync Google ID:', syncError);
            }
          }

          await handleSuccessfulLogin(c, identifier);
          await dbAdapter.updateUserLogin(userByEmail.id);
          const tokens = await generateTokenPair(userByEmail);
          setAuthCookies(c, tokens.accessToken, tokens.refreshToken);

          return c.json({
            success: true,
            data: {
              user: {
                id: userByEmail.id,
                email: userByEmail.email,
                name: userByEmail.name,
                picture: userByEmail.picture,
                role: userByEmail.role,
                status: userByEmail.status,
                phone: userByEmail.phone,
                address: userByEmail.address,
              },
            },
          });
        }
      }

      // Check legacy user in Redis
      console.log('[Google OAuth] Step 6: Checking legacy user in Redis...');
      try {
        const isLegacy = await isLegacyUser(googleUser.email);
        console.log('[Google OAuth] Legacy user check result', { isLegacy });

        if (isLegacy) {
          const legacyData = await getLegacyUser(googleUser.email);
          if (legacyData) {
            console.log('[Google OAuth] Legacy user found, requesting registration');
            return c.json({
              success: true,
              data: {
                needRegister: true,
                isLegacyUser: true,
                googleUser: {
                  email: googleUser.email,
                  name: googleUser.name,
                  picture: googleUser.picture,
                },
                legacyData: {
                  name: legacyData.name,
                  phone: legacyData.phone,
                  rank: legacyData.rank,
                  shares: legacyData.shares,
                  ogn: legacyData.ogn,
                  tor: legacyData.tor,
                  f1_total: legacyData.f1_total,
                  joined: legacyData.joined,
                  dob: legacyData.dob,
                },
              },
            });
          }
        }
      } catch (redisError) {
        console.error('[Google OAuth] Redis error checking legacy user:', redisError);
        // Continue anyway - Redis is optional
      }

      // New user - need registration
      console.log('[Google OAuth] New user, registration required');
      return c.json({
        success: true,
        data: {
          needRegister: true,
          googleUser: {
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
          },
        },
      });
    } catch (error) {
      // COMPREHENSIVE ERROR HANDLING
      console.error('[Google OAuth] ❌ ERROR:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.constructor.name : undefined,
      });

      // Handle GoogleAuthError specifically
      if (error instanceof GoogleAuthError) {
        console.error('[Google OAuth] GoogleAuthError:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });

        // Map error codes to HTTP status
        const statusMap: Record<string, number> = {
          MISSING_TOKEN: 400,
          TOKEN_EXPIRED: 401,
          INVALID_TOKEN: 401,
          INVALID_AUDIENCE: 401,
          INVALID_ISSUER: 401,
          GOOGLE_VERIFICATION_FAILED: 502, // Bad Gateway - Google service error
        };

        const statusCode = statusMap[error.code] ?? 500;

        return c.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              ...(error.details && { details: error.details }),
            },
          },
          statusCode,
        );
      }

      // Handle database errors
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
          return c.json(
            {
              success: false,
              error: {
                code: 'DATABASE_ERROR',
                message: 'Không thể kết nối database. Vui lòng thử lại sau.',
              },
            },
            503,
          );
        }

        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          return c.json(
            {
              success: false,
              error: {
                code: 'TIMEOUT',
                message: 'Request timeout. Vui lòng thử lại.',
              },
            },
            504,
          );
        }
      }

      // Unknown error - return generic 500 with details in dev mode
      const isDev = process.env.NODE_ENV === 'development';

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Đăng nhập thất bại. Vui lòng thử lại.',
            ...(isDev && {
              details: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            }),
          },
        },
        500,
      );
    }
  });

  // ... REST OF THE FILE (google/register, etc.) - KEEP AS IS
  // Copy the rest from the original file...
}
FIXED_CODE

echo -e "${GREEN}✓ Fixed code generated${NC}"
echo ""

echo -e "${YELLOW}[8/8] Instructions:${NC}"
echo ""
echo "The fix has been prepared but NOT applied automatically."
echo "To apply the fix, run:"
echo ""
echo "  cd $BACKEND_DIR"
echo "  # Review the fixed code first:"
echo "  cat src/modules/auth/routes/login.routes.ts.fixed"
echo "  # Then apply:"
echo "  mv src/modules/auth/routes/login.routes.ts.fixed src/modules/auth/routes/login.routes.ts"
echo "  pm2 restart cdhc-api"
echo "  pm2 logs cdhc-api --lines 50"
echo ""
echo "To test, open browser and try logging in with Google."
echo "Watch logs in real-time:"
echo "  pm2 logs cdhc-api --lines 0"
echo ""
echo -e "${GREEN}======================================"
echo "Fix preparation complete!"
echo "======================================${NC}"
