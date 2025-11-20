--
-- PostgreSQL database dump
--

\restrict uiffZNchhWzmPfn0xZ40Ot3antBdFPru0P0DUOw0XFT3PSDARhG4ye0Po9kBacF

-- Dumped from database version 17.5 (aa1f746)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: AdminActionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminActionType" AS ENUM (
    'APPROVE_WITHDRAWAL',
    'REJECT_WITHDRAWAL',
    'APPROVE_PACKAGE',
    'REJECT_PACKAGE',
    'UPDATE_SETTING',
    'APPROVE_KYC',
    'REJECT_KYC',
    'BLOCK_USER',
    'UNBLOCK_USER',
    'CREDIT_BALANCE',
    'DEBIT_BALANCE',
    'TRIGGER_ROI',
    'TRIGGER_EXPIRATION',
    'UPDATE_USER',
    'DELETE_USER',
    'VIEW_STATISTICS',
    'EXPORT_DATA'
);


--
-- Name: BotStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BotStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'INACTIVE',
    'SUSPENDED',
    'PENDING'
);


--
-- Name: CronJobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CronJobStatus" AS ENUM (
    'IDLE',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'DISABLED'
);


--
-- Name: EarningType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EarningType" AS ENUM (
    'DIRECT_REFERRAL',
    'LEVEL_INCOME',
    'REFERRAL',
    'ROI',
    'DIRECT',
    'BONUS'
);


--
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'PENDING',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'RESUBMIT'
);


--
-- Name: Network; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Network" AS ENUM (
    'BEP20',
    'TRC20',
    'ERC20',
    'POLYGON',
    'MANUAL'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'SUCCESS',
    'WARNING',
    'ERROR',
    'PAYMENT',
    'WITHDRAWAL',
    'REFERRAL',
    'ROI',
    'KYC',
    'SECURITY'
);


--
-- Name: PackageStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PackageStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'EXPIRED',
    'WITHDRAWN',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: PackageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PackageType" AS ENUM (
    'NEO',
    'NEURAL',
    'ORACLE'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'CONFIRMING',
    'COMPLETED',
    'FAILED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: RoiPaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RoiPaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'SKIPPED'
);


--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED',
    'INVALID'
);


--
-- Name: TicketPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
    'CRITICAL'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_USER',
    'WAITING_ADMIN',
    'RESOLVED',
    'CLOSED',
    'REOPENED'
);


--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'CONFIRMING',
    'COMPLETED',
    'FAILED',
    'REJECTED'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'BOT_FEE',
    'BOT_ACTIVATION',
    'ROI_PAYMENT',
    'REFERRAL_BONUS',
    'LEVEL_INCOME',
    'CAPITAL_RETURN',
    'PACKAGE_PURCHASE',
    'ADMIN_CREDIT',
    'ADMIN_DEBIT'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN'
);


--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSING',
    'COMPLETED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: WithdrawalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalType" AS ENUM (
    'ROI_ONLY',
    'CAPITAL',
    'CAPITAL_ONLY',
    'FULL_AMOUNT'
);


--
-- Name: assign_unique_referral_code_after_bot_purchase(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_unique_referral_code_after_bot_purchase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW."status" = 'ACTIVE' AND (OLD IS NULL OR OLD."status" != 'ACTIVE') THEN
          UPDATE "User" SET "hasPurchasedBot" = true WHERE "id" = NEW."userId";

          INSERT INTO "Notification" (
            "id", "userId", "title", "message", "type", "referenceType"
          ) VALUES (
            gen_random_uuid()::text,
            NEW."userId",
            'Referral Code Activated',
            'Congratulations! You can now earn referral and direct income from your referrals!',
            'SUCCESS'::"NotificationType",
            'REFERRAL'
          );
        END IF;

        RETURN NEW;
      END;
      $$;


--
-- Name: auto_expire_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_expire_sessions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."expiresAt" < NOW() AND NEW."isActive" = true THEN
    NEW."isActive" = false;
    NEW."status" = 'EXPIRED';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: calculate_referral_earnings(text, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_referral_earnings(p_package_id text, p_user_id text, p_amount numeric) RETURNS TABLE(level integer, "referrerId" text, amount numeric, percentage numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_user_code TEXT;
  current_user_id TEXT := p_user_id;
  current_level INTEGER := 0;
  -- Level rates match the product spec: levels 1..6
  level_percentages DECIMAL(5, 2)[] := ARRAY[2.00, 0.75, 0.50, 0.25, 0.15, 0.10];
  referrer_has_bot BOOLEAN;
BEGIN
  -- Get settings for level income percentages
  -- Use defaults if not found
  
  -- Walk up the referral chain
  WHILE current_level < 6 LOOP
    -- Get referrer
    SELECT "referredBy" INTO current_user_code
    FROM "User" WHERE "id" = current_user_id;
    
    EXIT WHEN current_user_code IS NULL;
    
    -- Skip default referral code (no earnings)
    EXIT WHEN current_user_code = 'NSCREF1000';
    
    -- Get referrer user ID and check if they have an active bot
    SELECT "id", 
           CASE WHEN EXISTS (
             SELECT 1 FROM "BotActivation" 
             WHERE "userId" = "User"."id" 
             AND status = 'ACTIVE'::"BotStatus" 
             AND "isExpired" = false
           ) THEN true ELSE false END
    INTO current_user_id, referrer_has_bot
    FROM "User" WHERE "referralCode" = current_user_code;
    
    EXIT WHEN current_user_id IS NULL;
    
    -- Increment the level counter for every step up the chain (buyer -> upline)
    current_level := current_level + 1;

    -- Only pay earnings if referrer has an active bot
    IF referrer_has_bot = true THEN
      
      -- Insert earning record
      INSERT INTO "Earning" (
        id, "userId", "fromUserId", "earningType", amount, "packageId", level, description, "createdAt"
      ) VALUES (
        gen_random_uuid()::text,
        current_user_id,
        p_user_id,
        CASE WHEN current_level = 1 THEN 'DIRECT_REFERRAL'::"EarningType" ELSE 'LEVEL_INCOME'::"EarningType" END,
        ROUND(p_amount * level_percentages[current_level] / 100, 8),
        p_package_id,
        current_level,
        CASE WHEN current_level = 1 THEN 'Direct referral bonus' ELSE 'Level ' || current_level || ' income' END,
        NOW()
      );
      
      -- Insert transaction record
      INSERT INTO "Transaction" (
        id, "userId", type, amount, status, description, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        current_user_id,
        CASE WHEN current_level = 1 THEN 'REFERRAL_BONUS'::"TransactionType" ELSE 'LEVEL_INCOME'::"TransactionType" END,
        ROUND(p_amount * level_percentages[current_level] / 100, 8),
        'COMPLETED'::"TransactionStatus",
        CASE WHEN current_level = 1 THEN 'Direct referral bonus from package purchase' ELSE 'Level ' || current_level || ' income from package purchase' END,
        NOW(),
        NOW()
      );
      
      -- Return earning record
      RETURN QUERY SELECT
        current_level,
        current_user_id,
        ROUND(p_amount * level_percentages[current_level] / 100, 8),
        level_percentages[current_level];
    ELSE
      -- Referrer hasn't bought bot: record as lost commission, continue up the chain
      -- Referrer hasn't bought bot: record as lost commission for the correct level
      INSERT INTO "LostCommission" (id, "packageId", "wouldBeRecipientId", level, amount, reason, "createdAt")
      VALUES (gen_random_uuid()::text, p_package_id, current_user_id, current_level, ROUND(p_amount * level_percentages[current_level] / 100, 8), 'no_bot', NOW());
      -- do not increment current_level (only count paid levels), continue looping
      CONTINUE;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;


--
-- Name: calculate_withdrawal_net_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_withdrawal_net_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_fee_percentage DECIMAL(5, 2);
BEGIN
  -- Get fee percentage from settings
  SELECT COALESCE("value", '10')::DECIMAL INTO v_fee_percentage
  FROM "SystemSetting" WHERE "key" = 'WITHDRAWAL_FEE';
  
  -- Calculate fee and net amount
  IF NEW."fee" = 0 THEN
    NEW."fee" = ROUND(NEW."amount" * v_fee_percentage / 100, 8);
    NEW."feePercentage" = v_fee_percentage;
  END IF;
  
  NEW."netAmount" = NEW."amount" - NEW."fee";
  
  RETURN NEW;
END;
$$;


--
-- Name: check_login_blocking(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_login_blocking(p_email text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15) RETURNS TABLE("isBlocked" boolean, "blockReason" text, "failedAttempts" integer, "lastAttemptAt" timestamp without time zone, "blockUntil" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
  failed_count INTEGER;
  last_attempt TIMESTAMP;
  block_until TIMESTAMP;
  account_locked_until TIMESTAMP;
BEGIN
  -- Check if account is already locked
  SELECT "accountLockedUntil" INTO account_locked_until
  FROM "User" WHERE "email" = p_email;
  
  IF account_locked_until IS NOT NULL AND account_locked_until > NOW() THEN
    RETURN QUERY SELECT 
      true,
      'Account temporarily locked',
      0::INTEGER,
      NULL::TIMESTAMP,
      account_locked_until;
    RETURN;
  END IF;
  
  -- Count failed attempts in the time window
  SELECT COUNT(*), MAX("createdAt")
  INTO failed_count, last_attempt
  FROM "LoginAttempt"
  WHERE "email" = p_email
    AND "success" = false
    AND "createdAt" >= NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Check if blocked
  IF failed_count >= p_max_attempts THEN
    block_until := last_attempt + (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Update user account lock
    UPDATE "User"
    SET "accountLockedUntil" = block_until
    WHERE "email" = p_email;
    
    RETURN QUERY SELECT 
      true,
      'Too many failed login attempts',
      failed_count,
      last_attempt,
      block_until;
  ELSE
    RETURN QUERY SELECT 
      false,
      NULL::TEXT,
      failed_count,
      last_attempt,
      NULL::TIMESTAMP;
  END IF;
END;
$$;


--
-- Name: check_login_blocking(text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_login_blocking(p_email text, p_ip_address text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15) RETURNS TABLE("isBlocked" boolean, "blockReason" text, "failedAttempts" integer, "lastAttemptAt" timestamp without time zone, "blockUntil" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
  failed_count INTEGER;
  last_attempt TIMESTAMP;
  block_until TIMESTAMP;
  account_locked_until TIMESTAMP;
BEGIN
  -- Check if account is already locked
  SELECT "accountLockedUntil" INTO account_locked_until
  FROM "User" WHERE "email" = p_email;
  
  IF account_locked_until IS NOT NULL AND account_locked_until > NOW() THEN
    RETURN QUERY SELECT 
      true,
      'Account temporarily locked',
      0::INTEGER,
      NULL::TIMESTAMP,
      account_locked_until;
    RETURN;
  END IF;
  
  -- Count failed attempts in the time window (by email OR IP address)
  SELECT COUNT(*), MAX("createdAt")
  INTO failed_count, last_attempt
  FROM "LoginAttempt"
  WHERE ("email" = p_email OR "ipAddress" = p_ip_address)
    AND "success" = false
    AND "createdAt" >= NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Check if blocked
  IF failed_count >= p_max_attempts THEN
    block_until := last_attempt + (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Update user account lock
    UPDATE "User"
    SET "accountLockedUntil" = block_until
    WHERE "email" = p_email;
    
    RETURN QUERY SELECT 
      true,
      'Too many failed login attempts',
      failed_count,
      last_attempt,
      block_until;
  ELSE
    RETURN QUERY SELECT 
      false,
      NULL::TEXT,
      failed_count,
      last_attempt,
      NULL::TIMESTAMP;
  END IF;
END;
$$;


--
-- Name: check_withdrawal_eligibility(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_withdrawal_eligibility(p_user_id text) RETURNS TABLE("canWithdraw" boolean, reason text, "availableBalance" numeric, "minWithdrawal" numeric, "lastWithdrawalDate" timestamp without time zone, "cooldownDays" integer, "daysUntilNext" integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_available DECIMAL(20, 8);
  v_min_withdrawal DECIMAL(20, 8);
  v_last_withdrawal TIMESTAMP;
  v_cooldown_days INTEGER;
  v_days_since INTEGER;
  v_kyc_status "KYCStatus";
  v_is_blocked BOOLEAN;
  v_can_withdraw BOOLEAN := true;
  v_reason TEXT := '';
BEGIN
  -- Get user KYC status and block status
  SELECT "kycStatus", "isBlocked" INTO v_kyc_status, v_is_blocked
  FROM "User" WHERE "id" = p_user_id;
  
  -- Get system settings
  SELECT COALESCE("value", '20')::DECIMAL INTO v_min_withdrawal
  FROM "SystemSetting" WHERE "key" = 'MIN_WITHDRAWAL';
  
  SELECT COALESCE("value", '30')::INTEGER INTO v_cooldown_days
  FROM "SystemSetting" WHERE "key" = 'WITHDRAWAL_COOLDOWN';
  
  -- Get available balance
  SELECT "availableBalance" INTO v_available
  FROM get_user_withdrawal_balance(p_user_id);
  
  -- Get last withdrawal date
  SELECT MAX("completedAt") INTO v_last_withdrawal
  FROM "Withdrawal"
  WHERE "userId" = p_user_id AND "status" = 'COMPLETED';
  
  -- Calculate days since last withdrawal
  IF v_last_withdrawal IS NOT NULL THEN
    v_days_since := EXTRACT(DAY FROM NOW() - v_last_withdrawal)::INTEGER;
  ELSE
    v_days_since := 999;
  END IF;
  
  -- Check eligibility
  IF v_is_blocked THEN
    v_can_withdraw := false;
    v_reason := 'Account is blocked';
  ELSIF v_kyc_status != 'APPROVED' THEN
    v_can_withdraw := false;
    v_reason := 'KYC verification required';
  ELSIF v_available < v_min_withdrawal THEN
    v_can_withdraw := false;
    v_reason := 'Insufficient balance (minimum: ' || v_min_withdrawal || ')';
  ELSIF v_days_since < v_cooldown_days THEN
    v_can_withdraw := false;
    v_reason := 'Withdrawal cooldown active';
  END IF;
  
  RETURN QUERY SELECT
    v_can_withdraw,
    v_reason,
    v_available,
    v_min_withdrawal,
    v_last_withdrawal,
    v_cooldown_days,
    GREATEST(0, v_cooldown_days - v_days_since);
END;
$$;


--
-- Name: cleanup_old_records(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_records(p_days_to_keep integer DEFAULT 90) RETURNS TABLE(table_name text, deleted_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Cleanup old login attempts
  DELETE FROM "LoginAttempt"
  WHERE "createdAt" < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN QUERY SELECT 'LoginAttempt'::TEXT, v_deleted;
  
  -- Cleanup old notifications
  DELETE FROM "Notification"
  WHERE "read" = true 
    AND "createdAt" < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN QUERY SELECT 'Notification'::TEXT, v_deleted;
  
  -- Cleanup expired payment requests
  DELETE FROM "PaymentRequest"
  WHERE "status" IN ('EXPIRED', 'FAILED', 'CANCELLED')
    AND "createdAt" < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN QUERY SELECT 'PaymentRequest'::TEXT, v_deleted;
  
  -- Cleanup old API logs
  DELETE FROM "ApiLog"
  WHERE "createdAt" < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN QUERY SELECT 'ApiLog'::TEXT, v_deleted;
  
  -- Cleanup old sessions
  DELETE FROM "Session"
  WHERE "expiresAt" < NOW() - (p_days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN QUERY SELECT 'Session'::TEXT, v_deleted;
  
  RETURN;
END;
$$;


--
-- Name: create_event_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_event_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Package activated (only for Package table)
  IF TG_TABLE_NAME = 'Package' THEN
    IF NEW."status" = 'ACTIVE' AND OLD."status" = 'PENDING' THEN
      INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
      VALUES (
        gen_random_uuid()::text,
        NEW."userId",
        'Package Activated',
        'Your ' || NEW."packageType" || ' package has been activated successfully!',
        'SUCCESS',
        NEW."id",
        'PACKAGE'
      );
    END IF;
  END IF;
  
  -- Withdrawal notifications (only for Withdrawal table)
  IF TG_TABLE_NAME = 'Withdrawal' THEN
    -- Withdrawal approved
    IF NEW."status" = 'APPROVED' AND OLD."status" = 'PENDING' THEN
      INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
      VALUES (
        gen_random_uuid()::text,
        NEW."userId",
        'Withdrawal Approved',
        'Your withdrawal request of ' || NEW."amount" || ' USDT has been approved!',
        'SUCCESS',
        NEW."id",
        'WITHDRAWAL'
      );
    END IF;
    
    -- Withdrawal rejected
    IF NEW."status" = 'REJECTED' AND OLD."status" = 'PENDING' THEN
      INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
      VALUES (
        gen_random_uuid()::text,
        NEW."userId",
        'Withdrawal Rejected',
        'Your withdrawal request has been rejected. Reason: ' || COALESCE(NEW."rejectionReason", 'Not specified'),
        'ERROR',
        NEW."id",
        'WITHDRAWAL'
      );
    END IF;
  END IF;
  
  -- KYC approved (only for User table)
  IF TG_TABLE_NAME = 'User' THEN
    IF NEW."kycStatus" = 'APPROVED' AND OLD."kycStatus" != 'APPROVED' THEN
      INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceType")
      VALUES (
        gen_random_uuid()::text,
        NEW."id",
        'KYC Approved',
        'Your KYC verification has been approved!',
        'SUCCESS',
        'KYC'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: create_session(text, text, text, text, text, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_session(p_user_id text, p_token_hash text, p_refresh_token_hash text, p_ip_address text, p_user_agent text, p_expires_at timestamp without time zone) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_session_id TEXT;
BEGIN
  v_session_id := gen_random_uuid()::text;
  
  INSERT INTO "Session" (
    "id", "userId", "token", "refreshToken", "ipAddress", "userAgent",
    "expiresAt", "isActive", "status", "createdAt", "lastUsedAt"
  ) VALUES (
    v_session_id, p_user_id, p_token_hash, p_refresh_token_hash, p_ip_address, p_user_agent,
    p_expires_at, true, 'ACTIVE', NOW(), NOW()
  );
  
  RETURN v_session_id;
END;
$$;


--
-- Name: create_withdrawal_transaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_withdrawal_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_transaction_id TEXT;
BEGIN
  IF NEW."status" = 'COMPLETED' AND (OLD."status" IS NULL OR OLD."status" != 'COMPLETED') THEN
    v_transaction_id := gen_random_uuid()::text;
    
    INSERT INTO "Transaction" (
      "id", "userId", "type", "amount", "fee", "netAmount",
      "status", "description", "txHash", "network",
      "referenceId", "referenceType"
    ) VALUES (
      v_transaction_id,
      NEW."userId",
      'WITHDRAWAL'::"TransactionType",
      NEW."amount",
      NEW."fee",
      NEW."netAmount",
      'COMPLETED'::"TransactionStatus",
      'Withdrawal to ' || NEW."walletAddress",
      NEW."txHash",
      NEW."network",
      NEW."id",
      'WITHDRAWAL'
    );
    
    -- Link transaction to withdrawal
    UPDATE "Withdrawal" SET "transactionId" = v_transaction_id WHERE "id" = NEW."id";
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: generate_referral_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_referral_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."referralCode" IS NULL OR NEW."referralCode" = '' THEN
    NEW."referralCode" = get_next_referral_code();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: generate_ticket_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_ticket_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."ticketNumber" IS NULL THEN
    NEW."ticketNumber" = 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_sequence')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: get_next_referral_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_next_referral_code() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  next_value INTEGER;
  new_code TEXT;
BEGIN
  UPDATE "ReferralCounter"
  SET "currentValue" = "currentValue" + 1,
      "updatedAt" = NOW()
  WHERE "counterType" = 'NSCREF'
  RETURNING "currentValue" INTO next_value;
  
  new_code := 'NSCREF' || next_value::TEXT;
  RETURN new_code;
END;
$$;


--
-- Name: get_package_roi_schedule(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_package_roi_schedule(p_package_id text) RETURNS TABLE("monthNumber" integer, "scheduledDate" timestamp without time zone, amount numeric, status text, "paidAt" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_investment_date TIMESTAMP;
  v_amount DECIMAL(20, 8);
  v_roi_percentage DECIMAL(5, 2);
  v_monthly_roi DECIMAL(20, 8);
  i INTEGER;
BEGIN
  -- Get package details
  SELECT "investmentDate", "amount", "roiPercentage"
  INTO v_investment_date, v_amount, v_roi_percentage
  FROM "Package"
  WHERE "id" = p_package_id;
  
  IF v_investment_date IS NULL THEN
    RETURN;
  END IF;
  
  v_monthly_roi := ROUND(v_amount * v_roi_percentage / 100, 8);
  
  -- Generate 12 months schedule
  FOR i IN 1..12 LOOP
    RETURN QUERY
    SELECT
      i,
      v_investment_date + (i || ' months')::INTERVAL,
      v_monthly_roi,
      COALESCE(
        (SELECT rp."status"::TEXT FROM "RoiPayment" rp 
         WHERE rp."packageId" = p_package_id AND rp."monthNumber" = i),
        'PENDING'
      ),
      (SELECT rp."paidAt" FROM "RoiPayment" rp 
       WHERE rp."packageId" = p_package_id AND rp."monthNumber" = i);
  END LOOP;
  
  RETURN;
END;
$$;


--
-- Name: get_platform_statistics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_platform_statistics() RETURNS TABLE("totalUsers" bigint, "activeUsers" bigint, "totalPackages" bigint, "activePackages" bigint, "totalInvested" numeric, "totalRoiPaid" numeric, "totalWithdrawals" numeric, "pendingWithdrawals" bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM "User" WHERE "isActive" = true) as "totalUsers",
    (SELECT COUNT(*) FROM "User" WHERE "lastLogin" > NOW() - INTERVAL '30 days') as "activeUsers",
    (SELECT COUNT(*) FROM "Package") as "totalPackages",
    (SELECT COUNT(*) FROM "Package" WHERE "status" = 'ACTIVE') as "activePackages",
    (SELECT COALESCE(SUM("amount"), 0) FROM "Package" WHERE "status" IN ('ACTIVE', 'EXPIRED', 'COMPLETED')) as "totalInvested",
    (SELECT COALESCE(SUM("amount"), 0) FROM "RoiPayment" WHERE "status" = 'COMPLETED') as "totalRoiPaid",
    (SELECT COALESCE(SUM("amount"), 0) FROM "Withdrawal" WHERE "status" = 'COMPLETED') as "totalWithdrawals",
    (SELECT COUNT(*) FROM "Withdrawal" WHERE "status" = 'PENDING') as "pendingWithdrawals";
END;
$$;


--
-- Name: get_referral_tree(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_referral_tree(user_referral_code text, max_levels integer DEFAULT 6) RETURNS TABLE("userId" text, email text, "fullName" text, "referralCode" text, level integer, "createdAt" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE referral_tree AS (
    -- Base case: Direct referrals (Level 1)
    SELECT 
      u."id" as "userId",
      u."email",
      u."fullName",
      u."referralCode",
      1 as "level",
      u."createdAt"
    FROM "User" u
    WHERE u."referredBy" = user_referral_code
    
    UNION ALL
    
    -- Recursive case: Get referrals of referrals
    SELECT 
      u."id",
      u."email",
      u."fullName",
      u."referralCode",
      rt."level" + 1,
      u."createdAt"
    FROM "User" u
    INNER JOIN referral_tree rt ON u."referredBy" = rt."referralCode"
    WHERE rt."level" < max_levels
  )
  SELECT * FROM referral_tree
  ORDER BY "level", "createdAt";
END;
$$;


--
-- Name: get_user_balance(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_balance(p_user_id text) RETURNS TABLE("roiBalance" numeric, "referralBalance" numeric, "levelBalance" numeric, "totalBalance" numeric, "lockedCapital" numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_roi_balance NUMERIC;
  v_referral_balance NUMERIC;
  v_level_balance NUMERIC;
  v_total_withdrawn NUMERIC;
  v_locked_capital NUMERIC;
  v_total_earned NUMERIC;
  v_total_balance NUMERIC;
BEGIN
  -- Get ROI balance
  SELECT COALESCE(SUM(amount)::NUMERIC, 0)
  INTO v_roi_balance
  FROM "Transaction"
  WHERE "userId" = p_user_id
  AND type = 'ROI_PAYMENT'
  AND status = 'COMPLETED';

  -- Get referral balance
  SELECT COALESCE(SUM(amount)::NUMERIC, 0)
  INTO v_referral_balance
  FROM "Earning"
  WHERE "userId" = p_user_id
  AND "earningType" = 'DIRECT_REFERRAL'::"EarningType";

  -- Get level balance
  SELECT COALESCE(SUM(amount)::NUMERIC, 0)
  INTO v_level_balance
  FROM "Earning"
  WHERE "userId" = p_user_id
  AND "earningType" = 'LEVEL_INCOME'::"EarningType";

  -- Get total withdrawn
  SELECT COALESCE(SUM(amount)::NUMERIC, 0)
  INTO v_total_withdrawn
  FROM "Withdrawal"
  WHERE "userId" = p_user_id
  AND status = 'COMPLETED';

  -- Get locked capital
  SELECT COALESCE(SUM(amount)::NUMERIC, 0)
  INTO v_locked_capital
  FROM "Package"
  WHERE "userId" = p_user_id
  AND status = 'ACTIVE';

  -- Calculate totals
  v_total_earned := v_roi_balance + v_referral_balance + v_level_balance;
  v_total_balance := GREATEST(v_total_earned - v_total_withdrawn, 0);

  -- Return the values
  RETURN QUERY
  SELECT
    v_roi_balance,
    v_referral_balance,
    v_level_balance,
    v_total_balance,
    v_locked_capital;
END;
$$;


--
-- Name: get_user_sessions(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_sessions(p_user_id text) RETURNS TABLE("sessionId" text, "ipAddress" text, "userAgent" text, "isActive" boolean, "createdAt" timestamp without time zone, "lastUsedAt" timestamp without time zone, "expiresAt" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s."ipAddress",
    s."userAgent",
    s."isActive",
    s."createdAt",
    s."lastActivityAt",
    s."expiresAt"
  FROM "Session" s
  WHERE s."userId" = p_user_id
  ORDER BY s."lastActivityAt" DESC;
END;
$$;


--
-- Name: get_user_total_earnings(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_total_earnings(p_user_id text) RETURNS TABLE("totalRoi" numeric, "totalReferral" numeric, "totalLevelIncome" numeric, "totalEarnings" numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN "type" = 'ROI_PAYMENT' THEN "amount" ELSE 0 END), 0) as "totalRoi",
    COALESCE(SUM(CASE WHEN "type" = 'REFERRAL_BONUS' THEN "amount" ELSE 0 END), 0) as "totalReferral",
    COALESCE(SUM(CASE WHEN "type" = 'LEVEL_INCOME' THEN "amount" ELSE 0 END), 0) as "totalLevelIncome",
    COALESCE(SUM("amount"), 0) as "totalEarnings"
  FROM "Transaction"
  WHERE "userId" = p_user_id
    AND "status" = 'COMPLETED'
    AND "type" IN ('ROI_PAYMENT', 'REFERRAL_BONUS', 'LEVEL_INCOME');
END;
$$;


--
-- Name: get_user_withdrawal_balance(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_withdrawal_balance(p_user_id text) RETURNS TABLE("roiBalance" numeric, "referralBalance" numeric, "capitalBalance" numeric, "totalBalance" numeric, "pendingWithdrawals" numeric, "availableBalance" numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_total_earned DECIMAL(20, 8);
  v_total_withdrawn DECIMAL(20, 8);
  v_pending DECIMAL(20, 8);
  v_roi DECIMAL(20, 8);
  v_referral DECIMAL(20, 8);
  v_capital DECIMAL(20, 8);
BEGIN
  -- Calculate ROI earnings
  SELECT COALESCE(SUM("amount"), 0) INTO v_roi
  FROM "Transaction"
  WHERE "userId" = p_user_id 
    AND "type" = 'ROI_PAYMENT' 
    AND "status" = 'COMPLETED';
  
  -- Calculate referral earnings
  SELECT COALESCE(SUM("amount"), 0) INTO v_referral
  FROM "Transaction"
  WHERE "userId" = p_user_id 
    AND "type" IN ('REFERRAL_BONUS', 'LEVEL_INCOME')
    AND "status" = 'COMPLETED';
  
  -- Calculate returned capital
  SELECT COALESCE(SUM("amount"), 0) INTO v_capital
  FROM "Transaction"
  WHERE "userId" = p_user_id 
    AND "type" = 'CAPITAL_RETURN'
    AND "status" = 'COMPLETED';
  
  -- Calculate total withdrawals
  SELECT COALESCE(SUM("amount"), 0) INTO v_total_withdrawn
  FROM "Withdrawal"
  WHERE "userId" = p_user_id 
    AND "status" IN ('COMPLETED', 'APPROVED', 'PROCESSING');
  
  -- Calculate pending withdrawals
  SELECT COALESCE(SUM("amount"), 0) INTO v_pending
  FROM "Withdrawal"
  WHERE "userId" = p_user_id 
    AND "status" = 'PENDING';
  
  v_total_earned := v_roi + v_referral + v_capital;
  
  RETURN QUERY SELECT
    v_roi,
    v_referral,
    v_capital,
    v_total_earned,
    v_pending,
    v_total_earned - v_total_withdrawn - v_pending;
END;
$$;


--
-- Name: log_admin_action(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_admin_action() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Log withdrawal approvals (only for Withdrawal table)
  IF TG_TABLE_NAME = 'Withdrawal' THEN
    IF NEW."approvedBy" IS NOT NULL AND (OLD."approvedBy" IS NULL OR OLD."approvedBy" IS DISTINCT FROM NEW."approvedBy") THEN
      INSERT INTO "AdminLog" (
        "id", "adminId", "action", "targetType", "targetId", "description"
      ) VALUES (
        gen_random_uuid()::text,
        NEW."approvedBy",
        'APPROVE_WITHDRAWAL',
        'WITHDRAWAL',
        NEW."id",
        'Approved withdrawal of ' || NEW."amount" || ' USDT for user ' || NEW."userId"
      );
    END IF;
    
    -- Log withdrawal rejections
    IF NEW."status" = 'REJECTED' AND OLD."status" != 'REJECTED' THEN
      INSERT INTO "AdminLog" (
        "id", "adminId", "action", "targetType", "targetId", "description"
      ) VALUES (
        gen_random_uuid()::text,
        NEW."rejectedBy",
        'REJECT_WITHDRAWAL',
        'WITHDRAWAL',
        NEW."id",
        'Rejected withdrawal: ' || COALESCE(NEW."rejectionReason", 'No reason provided')
      );
    END IF;
  END IF;
  
  -- Log user blocking (only for User table)
  IF TG_TABLE_NAME = 'User' THEN
    IF NEW."isBlocked" = true AND OLD."isBlocked" = false THEN
      INSERT INTO "AdminLog" (
        "id", "adminId", "action", "targetType", "targetId", "description"
      ) VALUES (
        gen_random_uuid()::text,
        NEW."blockedBy",
        'BLOCK_USER',
        'USER',
        NEW."id",
        'Blocked user: ' || COALESCE(NEW."blockReason", 'No reason provided')
      );
    END IF;
    
    -- Log KYC approvals
    IF NEW."kycStatus" = 'APPROVED' AND OLD."kycStatus" != 'APPROVED' THEN
      INSERT INTO "AdminLog" (
        "id", "adminId", "action", "targetType", "targetId", "description"
      ) VALUES (
        gen_random_uuid()::text,
        'SYSTEM',
        'APPROVE_KYC',
        'USER',
        NEW."id",
        'Approved KYC verification'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: process_referral_earnings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_referral_earnings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  earning_record RECORD;
  transaction_id TEXT;
BEGIN
  -- Only process when package becomes ACTIVE
  IF NEW."status" = 'ACTIVE' AND (OLD."status" IS NULL OR OLD."status" != 'ACTIVE') THEN
    
    -- Calculate and create earnings for referral chain
    FOR earning_record IN 
      SELECT * FROM calculate_referral_earnings(NEW."id", NEW."userId", NEW."amount")
    LOOP
      -- Create transaction record
      transaction_id := gen_random_uuid()::text;
      
      INSERT INTO "Transaction" (
        "id", "userId", "type", "amount", "status", "description",
        "referenceId", "referenceType"
      ) VALUES (
        transaction_id,
        earning_record."referrerId",
        (CASE WHEN earning_record."level" = 1 THEN 'REFERRAL_BONUS' ELSE 'LEVEL_INCOME' END)::"TransactionType",
        earning_record."amount",
        'COMPLETED'::"TransactionStatus",
        'Level ' || earning_record."level" || ' income from package purchase',
        NEW."id",
        'PACKAGE'
      );
      
      -- Create earning record
      INSERT INTO "Earning" (
        "id", "userId", "fromUserId", "packageId", "transactionId",
        "earningType", "amount", "level", "percentage", "status"
      ) VALUES (
        gen_random_uuid()::text,
        earning_record."referrerId",
        NEW."userId",
        NEW."id",
        transaction_id,
        (CASE WHEN earning_record."level" = 1 THEN 'DIRECT_REFERRAL' ELSE 'LEVEL_INCOME' END)::"EarningType",
        earning_record."amount",
        earning_record."level",
        earning_record."percentage",
        'PAID'
      );
      
      -- Create notification
      INSERT INTO "Notification" (
        "id", "userId", "title", "message", "type", "referenceId", "referenceType"
      ) VALUES (
        gen_random_uuid()::text,
        earning_record."referrerId",
        'Referral Earnings',
        'You earned ' || earning_record."amount" || ' USDT from Level ' || earning_record."level" || ' referral income!',
        'REFERRAL',
        NEW."id",
        'PACKAGE'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: recalculate_all_referral_earnings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_all_referral_earnings() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_record RECORD;
    package_record RECORD;
    earning_record RECORD;
BEGIN
    -- Loop through all users
    FOR user_record IN SELECT id FROM "User" LOOP
        -- For each user, loop through their packages
        FOR package_record IN
            SELECT "id", "userId", "amount"
            FROM "Package"
            WHERE "userId" = user_record.id
              AND "status" IN ('ACTIVE', 'COMPLETED', 'EXPIRED')
            ORDER BY "createdAt" ASC
        LOOP
            -- Call the calculate_referral_earnings function for this package
            PERFORM calculate_referral_earnings(
                package_record."id",
                package_record."userId",
                package_record."amount"
            );
            RAISE NOTICE 'Recalculated earnings for package % (user: %, amount: %)',
                package_record."id", package_record."userId", package_record."amount";
        END LOOP;
    END LOOP;

    -- Report results
    SELECT COUNT(*) as total_earnings_recalculated INTO earning_record
    FROM "Earning"
    WHERE "earningType" IN ('DIRECT_REFERRAL', 'LEVEL_INCOME');

    RAISE NOTICE 'Recalculation complete. Total referral earnings: %', earning_record.total_earnings_recalculated;
END;
$$;


--
-- Name: record_login_attempt(text, text, text, boolean, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_login_attempt(p_email text, p_ip_address text, p_user_agent text, p_success boolean, p_failure_reason text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  attempt_id TEXT;
  v_user_id TEXT;
BEGIN
  -- Get user ID if exists
  SELECT "id" INTO v_user_id FROM "User" WHERE "email" = p_email;
  
  attempt_id := gen_random_uuid()::text;
  
  INSERT INTO "LoginAttempt" (
    "id", "email", "userId", "ipAddress", "userAgent", 
    "success", "failureReason", "createdAt"
  ) VALUES (
    attempt_id, p_email, v_user_id, p_ip_address, p_user_agent, 
    p_success, p_failure_reason, NOW()
  );
  
  -- Update user record if login was successful
  IF p_success AND v_user_id IS NOT NULL THEN
    UPDATE "User"
    SET "lastLogin" = NOW(),
        "lastLoginIp" = p_ip_address,
        "failedLoginAttempts" = 0,
        "lastActiveAt" = NOW()
    WHERE "id" = v_user_id;
  ELSIF NOT p_success AND v_user_id IS NOT NULL THEN
    UPDATE "User"
    SET "failedLoginAttempts" = COALESCE("failedLoginAttempts", 0) + 1,
        "lastFailedLoginAt" = NOW()
    WHERE "id" = v_user_id;
  END IF;
  
  RETURN attempt_id;
END;
$$;


--
-- Name: refresh_user_earnings_summary(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_user_earnings_summary() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY "mv_UserEarningsSummary";
END;
$$;


--
-- Name: revoke_all_user_sessions(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.revoke_all_user_sessions(p_user_id text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE "Session"
  SET "isActive" = false
  WHERE "userId" = p_user_id
  AND "isActive" = true;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;


--
-- Name: revoke_other_sessions(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.revoke_other_sessions(p_user_id text, p_current_session_id text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE "Session"
  SET "isActive" = false
  WHERE "userId" = p_user_id
  AND id != p_current_session_id
  AND "isActive" = true;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;


--
-- Name: revoke_session(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.revoke_session(p_session_id text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE "Session"
  SET "isActive" = false
  WHERE id = p_session_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;


--
-- Name: update_last_activity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_last_activity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE "User" SET "lastActiveAt" = NOW() WHERE "id" = NEW."userId";
  RETURN NEW;
END;
$$;


--
-- Name: update_package_roi_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_package_roi_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW."status" = 'COMPLETED' THEN
    UPDATE "Package"
    SET 
      "totalRoiPaid" = "totalRoiPaid" + NEW."amount",
      "roiPaidCount" = "roiPaidCount" + 1,
      "lastRoiDate" = NEW."paymentDate",
      "nextRoiDate" = NEW."paymentDate" + INTERVAL '1 month'
    WHERE "id" = NEW."packageId";
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_bot_purchase_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_bot_purchase_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- When bot is activated or created, mark user as having purchased bot
  IF NEW."status" IN ('ACTIVE', 'PENDING') THEN
    UPDATE "User"
    SET "hasPurchasedBot" = true
    WHERE "id" = NEW."userId" AND "hasPurchasedBot" = false;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: validate_session(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_session(p_token_hash text) RETURNS TABLE("sessionId" text, "userId" text, "ipAddress" text, "userAgent" text, "isValid" boolean, "createdAt" timestamp without time zone, "lastUsedAt" timestamp without time zone, "expiresAt" timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT
    s.id,
    s."userId",
    s."ipAddress",
    s."userAgent",
    s."createdAt",
    s."lastActivityAt",
    s."expiresAt",
    s."isActive"
  INTO v_session
  FROM "Session" s
  WHERE s."tokenHash" = p_token_hash
  AND s."isActive" = true
  AND s."expiresAt" > NOW()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT,
      false, NULL::TIMESTAMP, NULL::TIMESTAMP, NULL::TIMESTAMP;
    RETURN;
  END IF;

  UPDATE "Session"
  SET "lastActivityAt" = NOW()
  WHERE id = v_session.id;

  RETURN QUERY SELECT
    v_session.id,
    v_session."userId",
    v_session."ipAddress",
    v_session."userAgent",
    true,
    v_session."createdAt",
    v_session."lastActivityAt",
    v_session."expiresAt";
END;
$$;


--
-- Name: validate_withdrawal_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_withdrawal_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_available DECIMAL(20, 8);
  v_min_withdrawal DECIMAL(20, 8);
BEGIN
  -- Get available balance
  SELECT "availableBalance" INTO v_available
  FROM get_user_withdrawal_balance(NEW."userId");
  
  -- Get minimum withdrawal
  SELECT COALESCE("value", '20')::DECIMAL INTO v_min_withdrawal
  FROM "SystemSetting" WHERE "key" = 'MIN_WITHDRAWAL';
  
  -- Validate
  IF NEW."amount" > v_available THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', v_available, NEW."amount";
  END IF;
  
  IF NEW."amount" < v_min_withdrawal THEN
    RAISE EXCEPTION 'Amount below minimum withdrawal limit of %', v_min_withdrawal;
  END IF;
  
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "adminId" text NOT NULL,
    action public."AdminActionType" NOT NULL,
    "actionType" text,
    "targetType" text,
    "targetId" text,
    description text,
    notes text,
    details jsonb,
    metadata jsonb,
    "oldValue" jsonb,
    "newValue" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ApiLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text,
    method text NOT NULL,
    path text NOT NULL,
    query jsonb,
    body jsonb,
    headers jsonb,
    "statusCode" integer,
    "responseTime" integer,
    "responseSize" integer,
    "ipAddress" text,
    "userAgent" text,
    error text,
    "stackTrace" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text,
    "entityId" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    changes jsonb,
    "ipAddress" text,
    "userAgent" text,
    method text,
    path text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: BlockchainScanState; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlockchainScanState" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    network public."Network" NOT NULL,
    "lastScannedBlock" bigint DEFAULT 0 NOT NULL,
    "lastScanTime" timestamp without time zone,
    "scanActive" boolean DEFAULT false,
    "errorCount" integer DEFAULT 0,
    "lastError" text,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: BotActivation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BotActivation" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "packageId" text,
    "botType" public."PackageType" NOT NULL,
    "activationFee" numeric(20,8) NOT NULL,
    status public."BotStatus" DEFAULT 'ACTIVE'::public."BotStatus" NOT NULL,
    network public."Network",
    "paymentTxHash" text,
    "paymentRequestId" text,
    "activationDate" timestamp without time zone,
    "activatedAt" timestamp without time zone,
    "expiryDate" timestamp without time zone,
    "expiredAt" timestamp without time zone,
    "isExpired" boolean DEFAULT false NOT NULL,
    "capitalReturned" boolean DEFAULT false NOT NULL,
    "totalEarnings" numeric(20,8) DEFAULT 0,
    "approvedBy" text,
    "approvedAt" timestamp without time zone,
    notes text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: CronJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CronJob" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name text NOT NULL,
    description text,
    schedule text,
    status public."CronJobStatus" DEFAULT 'IDLE'::public."CronJobStatus",
    enabled boolean DEFAULT true,
    "lastRunAt" timestamp without time zone,
    "lastSuccessAt" timestamp without time zone,
    "lastFailureAt" timestamp without time zone,
    "nextRunAt" timestamp without time zone,
    "runCount" integer DEFAULT 0,
    "successCount" integer DEFAULT 0,
    "failureCount" integer DEFAULT 0,
    "averageDuration" integer,
    "lastDuration" integer,
    "lastError" text,
    "lastResult" jsonb,
    config jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: CronJobExecution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CronJobExecution" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "cronJobId" text NOT NULL,
    "startedAt" timestamp without time zone NOT NULL,
    "completedAt" timestamp without time zone,
    duration integer,
    status text DEFAULT 'RUNNING'::text,
    success boolean,
    result jsonb,
    error text,
    "stackTrace" text,
    "recordsProcessed" integer DEFAULT 0,
    "recordsSucceeded" integer DEFAULT 0,
    "recordsFailed" integer DEFAULT 0,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: Earning; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Earning" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "fromUserId" text,
    "packageId" text,
    "transactionId" text,
    "earningType" public."EarningType" NOT NULL,
    type text,
    amount numeric(20,8) NOT NULL,
    level integer,
    percentage numeric(5,2),
    "sourceId" text,
    "sourceType" text,
    "sourceAmount" numeric(20,8),
    description text,
    notes text,
    status text DEFAULT 'PAID'::text,
    "isPaid" boolean DEFAULT true,
    "paidDate" timestamp without time zone,
    "paidAt" timestamp without time zone,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: EmailLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text,
    "to" text NOT NULL,
    "from" text,
    subject text NOT NULL,
    body text,
    "templateName" text,
    "templateData" jsonb,
    status text DEFAULT 'PENDING'::text,
    "sentAt" timestamp without time zone,
    "deliveredAt" timestamp without time zone,
    "openedAt" timestamp without time zone,
    "clickedAt" timestamp without time zone,
    provider text,
    "messageId" text,
    "providerResponse" jsonb,
    error text,
    "retryCount" integer DEFAULT 0,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ErrorLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ErrorLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text,
    "errorType" text NOT NULL,
    "errorMessage" text NOT NULL,
    "stackTrace" text,
    context jsonb,
    method text,
    path text,
    "ipAddress" text,
    "userAgent" text,
    severity text DEFAULT 'ERROR'::text,
    resolved boolean DEFAULT false,
    "resolvedAt" timestamp without time zone,
    "resolvedBy" text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: KYCSubmission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."KYCSubmission" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    status public."KYCStatus" DEFAULT 'PENDING'::public."KYCStatus" NOT NULL,
    "documentType" text NOT NULL,
    "documentNumber" text,
    "documentFrontUrl" text,
    "frontImageUrl" text,
    "documentBackUrl" text,
    "backImageUrl" text,
    "selfieUrl" text,
    "proofOfAddressUrl" text,
    "firstName" text,
    "lastName" text,
    "middleName" text,
    "dateOfBirth" date,
    nationality text,
    country text,
    city text,
    address text,
    "zipCode" text,
    "rejectionReason" text,
    "adminNotes" text,
    "verifiedBy" text,
    "reviewedBy" text,
    "verifiedAt" timestamp without time zone,
    "reviewedAt" timestamp without time zone,
    "submittedAt" timestamp without time zone DEFAULT now() NOT NULL,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: LoginAttempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoginAttempt" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    email text NOT NULL,
    "userId" text,
    "ipAddress" text NOT NULL,
    "userAgent" text,
    "deviceInfo" jsonb,
    location text,
    success boolean DEFAULT false NOT NULL,
    "failureReason" text,
    "errorCode" text,
    "twoFactorAttempted" boolean DEFAULT false,
    "twoFactorSuccess" boolean,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: LostCommission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LostCommission" (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "wouldBeRecipientId" text,
    level integer,
    amount numeric(20,8) DEFAULT 0,
    reason text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    link text,
    "actionUrl" text,
    "actionText" text,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp without time zone,
    "referenceId" text,
    "referenceType" text,
    priority text DEFAULT 'NORMAL'::text,
    metadata jsonb,
    "expiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: Package; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Package" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(20,8) NOT NULL,
    "packageType" public."PackageType" NOT NULL,
    "roiPercentage" numeric(5,2) NOT NULL,
    status public."PackageStatus" DEFAULT 'PENDING'::public."PackageStatus" NOT NULL,
    network public."Network",
    "depositTxHash" text,
    "paymentRequestId" text,
    "investmentDate" timestamp without time zone,
    "purchaseDate" timestamp without time zone,
    "activatedAt" timestamp without time zone,
    "expiryDate" timestamp without time zone,
    "expiredAt" timestamp without time zone,
    "lastRoiDate" timestamp without time zone,
    "nextRoiDate" timestamp without time zone,
    "totalRoiPaid" numeric(20,8) DEFAULT 0 NOT NULL,
    "roiPaidCount" integer DEFAULT 0 NOT NULL,
    "totalEarnings" numeric(20,8) DEFAULT 0,
    "isExpired" boolean DEFAULT false NOT NULL,
    "capitalReturned" boolean DEFAULT false NOT NULL,
    "capitalReturnedAt" timestamp without time zone,
    "approvedBy" text,
    "approvedAt" timestamp without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp without time zone,
    "rejectionReason" text,
    notes text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: PaymentConfirmation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentConfirmation" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "paymentRequestId" text,
    "txHash" text NOT NULL,
    network public."Network" NOT NULL,
    "blockNumber" bigint,
    "blockHash" text,
    "blockTimestamp" timestamp without time zone,
    confirmations integer DEFAULT 0 NOT NULL,
    "requiredConfirmations" integer DEFAULT 3 NOT NULL,
    "isConfirmed" boolean DEFAULT false NOT NULL,
    "confirmedAt" timestamp without time zone,
    amount numeric(20,8) NOT NULL,
    "expectedAmount" numeric(20,8),
    "amountMatches" boolean,
    "fromAddress" text NOT NULL,
    "toAddress" text NOT NULL,
    "contractAddress" text,
    status text DEFAULT 'PENDING'::text,
    "lastCheckedAt" timestamp without time zone,
    "nextCheckAt" timestamp without time zone,
    "verificationData" jsonb,
    "gasUsed" bigint,
    "gasPrice" bigint,
    "errorCount" integer DEFAULT 0,
    "lastError" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: PaymentRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentRequest" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    purpose text NOT NULL,
    "purposeType" text,
    amount numeric(20,8) NOT NULL,
    "amountReceived" numeric(20,8),
    currency text DEFAULT 'USDT'::text,
    network public."Network" NOT NULL,
    "depositAddress" text NOT NULL,
    "generatedAddress" text,
    "qrCodeData" text,
    "qrCodeUrl" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "txHash" text,
    "blockNumber" bigint,
    confirmations integer DEFAULT 0,
    "requiredConfirmations" integer DEFAULT 3,
    "fromAddress" text,
    "packageId" text,
    "botActivationId" text,
    "transactionId" text,
    metadata jsonb,
    "expiresAt" timestamp without time zone NOT NULL,
    "expiredAt" timestamp without time zone,
    "completedAt" timestamp without time zone,
    "verifiedAt" timestamp without time zone,
    "verifiedBy" text,
    notes text,
    "failureReason" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: PaymentWebhook; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentWebhook" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "paymentRequestId" text,
    "txHash" text,
    network public."Network",
    "webhookData" jsonb NOT NULL,
    "rawPayload" text,
    headers jsonb,
    processed boolean DEFAULT false NOT NULL,
    "processedAt" timestamp without time zone,
    "processedBy" text,
    error text,
    "errorCount" integer DEFAULT 0,
    "retryCount" integer DEFAULT 0,
    "lastRetryAt" timestamp without time zone,
    source text,
    "ipAddress" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: PlatformWallet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlatformWallet" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    network public."Network" NOT NULL,
    address text NOT NULL,
    label text,
    "isActive" boolean DEFAULT true,
    "lastBalance" numeric(20,8),
    "lastBalanceCheck" timestamp without time zone,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: RateLimitTracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RateLimitTracking" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    identifier text NOT NULL,
    endpoint text NOT NULL,
    "requestCount" integer DEFAULT 1,
    "windowStart" timestamp without time zone NOT NULL,
    "windowEnd" timestamp without time zone NOT NULL,
    "lastRequestAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ReferralCounter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReferralCounter" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "counterType" text NOT NULL,
    "currentValue" integer DEFAULT 1000 NOT NULL,
    prefix text DEFAULT 'NSCREF'::text,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: RoiPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RoiPayment" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "packageId" text NOT NULL,
    "userId" text NOT NULL,
    "transactionId" text,
    amount numeric(20,8) NOT NULL,
    percentage numeric(5,2),
    "monthNumber" integer NOT NULL,
    "paymentDate" timestamp without time zone NOT NULL,
    "scheduledDate" timestamp without time zone,
    "paidAt" timestamp without time zone,
    "dueDate" timestamp without time zone,
    status public."RoiPaymentStatus" DEFAULT 'COMPLETED'::public."RoiPaymentStatus",
    "isPaid" boolean DEFAULT true,
    "failureReason" text,
    "retryCount" integer DEFAULT 0,
    notes text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone
);


--
-- Name: RoiSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RoiSettings" (
    id integer NOT NULL,
    "packageAmount" integer NOT NULL,
    "roiPercentage" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "maxRoiPercentage" numeric(5,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "RoiSettings_maxRoiPercentage_check" CHECK ((("maxRoiPercentage" >= (0)::numeric) AND ("maxRoiPercentage" <= (100)::numeric))),
    CONSTRAINT "RoiSettings_packageAmount_check" CHECK (("packageAmount" > 0)),
    CONSTRAINT "RoiSettings_roiPercentage_check" CHECK ((("roiPercentage" >= (0)::numeric) AND ("roiPercentage" <= (100)::numeric)))
);


--
-- Name: RoiSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."RoiSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: RoiSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."RoiSettings_id_seq" OWNED BY public."RoiSettings".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "refreshToken" text,
    "tokenHash" text,
    "ipAddress" text,
    "userAgent" text,
    "deviceInfo" jsonb,
    location text,
    "isActive" boolean DEFAULT true NOT NULL,
    status public."SessionStatus" DEFAULT 'ACTIVE'::public."SessionStatus",
    "expiresAt" timestamp without time zone NOT NULL,
    "refreshExpiresAt" timestamp without time zone,
    "lastUsedAt" timestamp without time zone,
    "lastActivityAt" timestamp without time zone,
    "requestCount" integer DEFAULT 0,
    "revokedAt" timestamp without time zone,
    "revokedBy" text,
    "revokedReason" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupportTicket" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "ticketNumber" text,
    subject text NOT NULL,
    message text NOT NULL,
    category text,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    priority public."TicketPriority" DEFAULT 'MEDIUM'::public."TicketPriority" NOT NULL,
    "assignedTo" text,
    "assignedAt" timestamp without time zone,
    "resolvedAt" timestamp without time zone,
    "resolvedBy" text,
    resolution text,
    "closedAt" timestamp without time zone,
    "closedBy" text,
    metadata jsonb,
    attachments text[],
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastResponseAt" timestamp without time zone
);


--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSetting" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    type text DEFAULT 'STRING'::text,
    category text DEFAULT 'GENERAL'::text,
    "isPublic" boolean DEFAULT false,
    "updatedBy" text,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TicketMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketMessage" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "ticketId" text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    "isStaffReply" boolean DEFAULT false,
    attachments text[],
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(20,8) NOT NULL,
    fee numeric(20,8) DEFAULT 0,
    "netAmount" numeric(20,8),
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    description text,
    notes text,
    "txHash" text,
    network public."Network",
    "blockNumber" bigint,
    confirmations integer DEFAULT 0,
    "fromAddress" text,
    "toAddress" text,
    "referenceId" text,
    "referenceType" text,
    "relatedTransactionId" text,
    "balanceBefore" numeric(20,8),
    "balanceAfter" numeric(20,8),
    "processedBy" text,
    "processedAt" timestamp without time zone,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "completedAt" timestamp without time zone
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    username text,
    "fullName" text,
    phone text,
    "referralCode" text NOT NULL,
    "referredBy" text,
    "referrerId" text,
    "bep20Address" text,
    "trc20Address" text,
    "erc20Address" text,
    "polygonAddress" text,
    "walletAddress" text,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "emailVerificationExpiry" timestamp without time zone,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" text,
    "twoFactorBackupCodes" text[],
    "kycStatus" public."KYCStatus" DEFAULT 'PENDING'::public."KYCStatus" NOT NULL,
    "kycSubmittedAt" timestamp without time zone,
    "kycApprovedAt" timestamp without time zone,
    "kycRejectedAt" timestamp without time zone,
    "kycRejectionReason" text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockReason" text,
    "blockedAt" timestamp without time zone,
    "blockedBy" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "lastLogin" timestamp without time zone,
    "lastLoginIp" text,
    "failedLoginAttempts" integer DEFAULT 0,
    "accountLockedUntil" timestamp without time zone,
    "lastFailedLoginAt" timestamp without time zone,
    "passwordResetToken" text,
    "passwordResetExpiry" timestamp without time zone,
    avatar text,
    "dateOfBirth" date,
    country text,
    city text,
    address text,
    "zipCode" text,
    language text DEFAULT 'en'::text,
    timezone text DEFAULT 'UTC'::text,
    currency text DEFAULT 'USDT'::text,
    "emailNotifications" boolean DEFAULT true,
    "smsNotifications" boolean DEFAULT false,
    "acceptedTermsAt" timestamp without time zone,
    "acceptedPrivacyAt" timestamp without time zone,
    "termsVersion" text,
    "privacyVersion" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastActiveAt" timestamp without time zone,
    "hasPurchasedBot" boolean DEFAULT false NOT NULL
);


--
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Withdrawal" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "transactionId" text,
    amount numeric(20,8) NOT NULL,
    fee numeric(20,8) DEFAULT 0 NOT NULL,
    "feePercentage" numeric(5,2),
    "netAmount" numeric(20,8) NOT NULL,
    "requestedAmount" numeric(20,8),
    type public."WithdrawalType",
    "withdrawalType" text,
    "walletAddress" text NOT NULL,
    network public."Network" NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    "txHash" text,
    "blockNumber" bigint,
    "approvedBy" text,
    "approvedAt" timestamp without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp without time zone,
    "rejectionReason" text,
    "processedBy" text,
    "processedDate" timestamp without time zone,
    "processedAt" timestamp without time zone,
    "completedAt" timestamp without time zone,
    "requestDate" timestamp without time zone DEFAULT now() NOT NULL,
    "requestedAt" timestamp without time zone,
    "userNote" text,
    "adminNote" text,
    notes text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mv_UserEarningsSummary; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public."mv_UserEarningsSummary" AS
 SELECT id AS "userId",
    email,
    "referralCode",
    COALESCE(( SELECT sum(rp.amount) AS sum
           FROM public."RoiPayment" rp
          WHERE ((rp."userId" = u.id) AND (rp.status = 'COMPLETED'::public."RoiPaymentStatus"))), (0)::numeric) AS "totalRoiEarnings",
    COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE ((e."userId" = u.id) AND (e."earningType" = 'DIRECT_REFERRAL'::public."EarningType"))), (0)::numeric) AS "totalDirectReferralEarnings",
    COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE ((e."userId" = u.id) AND (e."earningType" = 'LEVEL_INCOME'::public."EarningType"))), (0)::numeric) AS "totalLevelIncomeEarnings",
    (COALESCE(( SELECT sum(rp.amount) AS sum
           FROM public."RoiPayment" rp
          WHERE ((rp."userId" = u.id) AND (rp.status = 'COMPLETED'::public."RoiPaymentStatus"))), (0)::numeric) + COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE (e."userId" = u.id)), (0)::numeric)) AS "totalEarnings",
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM public."Package" p
          WHERE ((p."userId" = u.id) AND (p.status = ANY (ARRAY['ACTIVE'::public."PackageStatus", 'EXPIRED'::public."PackageStatus", 'COMPLETED'::public."PackageStatus"])))), (0)::numeric) AS "totalInvested",
    COALESCE(( SELECT sum(w.amount) AS sum
           FROM public."Withdrawal" w
          WHERE ((w."userId" = u.id) AND (w.status = 'COMPLETED'::public."WithdrawalStatus"))), (0)::numeric) AS "totalWithdrawn",
    now() AS "lastUpdated"
   FROM public."User" u
  WHERE ("isActive" = true)
  WITH NO DATA;


--
-- Name: ticket_sequence; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_cooldown_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_cooldown_days (
    "coalesce" integer
);


--
-- Name: v_min_withdrawal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_min_withdrawal (
    "coalesce" numeric
);


--
-- Name: vw_ActivePackages; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_ActivePackages" AS
 SELECT p.id,
    p."userId",
    u.email,
    u."fullName",
    p.amount,
    p."packageType",
    p."roiPercentage" AS "maxRoiPercentage",
    p.status,
    p."investmentDate",
    p."expiryDate",
    p."nextRoiDate",
    p."roiPaidCount",
    p."totalRoiPaid",
    (12 - p."roiPaidCount") AS "remainingPayments",
    p."createdAt"
   FROM (public."Package" p
     JOIN public."User" u ON ((u.id = p."userId")))
  WHERE (p.status = 'ACTIVE'::public."PackageStatus");


--
-- Name: vw_AdminQuickStats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_AdminQuickStats" AS
 SELECT ( SELECT count(*) AS count
           FROM public."Withdrawal"
          WHERE ("Withdrawal".status = 'PENDING'::public."WithdrawalStatus")) AS "pendingWithdrawals",
    ( SELECT count(*) AS count
           FROM public."KYCSubmission"
          WHERE ("KYCSubmission".status = 'PENDING'::public."KYCStatus")) AS "pendingKyc",
    ( SELECT count(*) AS count
           FROM public."SupportTicket"
          WHERE ("SupportTicket".status = ANY (ARRAY['OPEN'::public."TicketStatus", 'IN_PROGRESS'::public."TicketStatus"]))) AS "openTickets",
    ( SELECT count(*) AS count
           FROM public."Package"
          WHERE ("Package".status = 'PENDING'::public."PackageStatus")) AS "pendingPackages",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE (date("User"."createdAt") = CURRENT_DATE)) AS "newUsersToday",
    ( SELECT count(*) AS count
           FROM public."Package"
          WHERE (date("Package"."createdAt") = CURRENT_DATE)) AS "newPackagesToday",
    ( SELECT COALESCE(sum("Transaction".amount), (0)::numeric) AS "coalesce"
           FROM public."Transaction"
          WHERE ((date("Transaction"."createdAt") = CURRENT_DATE) AND ("Transaction".type = 'DEPOSIT'::public."TransactionType"))) AS "depositsToday",
    ( SELECT COALESCE(sum("Withdrawal".amount), (0)::numeric) AS "coalesce"
           FROM public."Withdrawal"
          WHERE ((date("Withdrawal"."completedAt") = CURRENT_DATE) AND ("Withdrawal".status = 'COMPLETED'::public."WithdrawalStatus"))) AS "withdrawalsToday",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE (date_trunc('month'::text, "User"."createdAt") = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS "newUsersThisMonth",
    ( SELECT COALESCE(sum("Package".amount), (0)::numeric) AS "coalesce"
           FROM public."Package"
          WHERE (date_trunc('month'::text, "Package"."createdAt") = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) AS "investmentThisMonth",
    ( SELECT count(*) AS count
           FROM public."ErrorLog"
          WHERE (("ErrorLog"."createdAt" >= (now() - '24:00:00'::interval)) AND ("ErrorLog".resolved = false))) AS "unresolvedErrors24h",
    ( SELECT count(*) AS count
           FROM public."LoginAttempt"
          WHERE (("LoginAttempt"."createdAt" >= (now() - '01:00:00'::interval)) AND ("LoginAttempt".success = false))) AS "failedLoginsLastHour";


--
-- Name: vw_MonthlyRevenue; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_MonthlyRevenue" AS
 SELECT date_trunc('month'::text, "createdAt") AS month,
    COALESCE(sum(
        CASE
            WHEN (type = 'PACKAGE_PURCHASE'::public."TransactionType") THEN amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "packageRevenue",
    COALESCE(sum(
        CASE
            WHEN (type = 'BOT_ACTIVATION'::public."TransactionType") THEN amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "botFeeRevenue",
    COALESCE(sum(
        CASE
            WHEN (type = 'WITHDRAWAL'::public."TransactionType") THEN fee
            ELSE (0)::numeric
        END), (0)::numeric) AS "withdrawalFeeRevenue",
    (COALESCE(sum(
        CASE
            WHEN (type = ANY (ARRAY['PACKAGE_PURCHASE'::public."TransactionType", 'BOT_ACTIVATION'::public."TransactionType"])) THEN amount
            ELSE (0)::numeric
        END), (0)::numeric) + COALESCE(sum(
        CASE
            WHEN (type = 'WITHDRAWAL'::public."TransactionType") THEN fee
            ELSE (0)::numeric
        END), (0)::numeric)) AS "totalRevenue",
    count(DISTINCT
        CASE
            WHEN (type = 'PACKAGE_PURCHASE'::public."TransactionType") THEN "userId"
            ELSE NULL::text
        END) AS "uniqueInvestors",
    count(
        CASE
            WHEN (type = 'PACKAGE_PURCHASE'::public."TransactionType") THEN 1
            ELSE NULL::integer
        END) AS "packageCount"
   FROM public."Transaction" t
  WHERE (status = 'COMPLETED'::public."TransactionStatus")
  GROUP BY (date_trunc('month'::text, "createdAt"))
  ORDER BY (date_trunc('month'::text, "createdAt")) DESC;


--
-- Name: vw_PackagePerformance; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_PackagePerformance" AS
 SELECT "packageType",
    count(*) AS "totalPackages",
    count(
        CASE
            WHEN (status = 'ACTIVE'::public."PackageStatus") THEN 1
            ELSE NULL::integer
        END) AS "activePackages",
    count(
        CASE
            WHEN (status = 'EXPIRED'::public."PackageStatus") THEN 1
            ELSE NULL::integer
        END) AS "expiredPackages",
    COALESCE(sum(amount), (0)::numeric) AS "totalInvestment",
    COALESCE(avg(amount), (0)::numeric) AS "averageInvestment",
    COALESCE(sum("totalRoiPaid"), (0)::numeric) AS "totalRoiPaid",
    COALESCE(avg("roiPaidCount"), (0)::numeric) AS "averagePaymentsMade"
   FROM public."Package" p
  WHERE (status = ANY (ARRAY['ACTIVE'::public."PackageStatus", 'EXPIRED'::public."PackageStatus", 'COMPLETED'::public."PackageStatus"]))
  GROUP BY "packageType";


--
-- Name: vw_PendingWithdrawals; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_PendingWithdrawals" AS
 SELECT w.id,
    w."userId",
    u.email,
    u."fullName",
    u."kycStatus",
    w.amount,
    w.fee,
    w."netAmount",
    w.type,
    w."walletAddress",
    w.network,
    w.status,
    w."requestDate",
    w."userNote",
    EXTRACT(day FROM (now() - (w."requestDate")::timestamp with time zone)) AS "daysPending"
   FROM (public."Withdrawal" w
     JOIN public."User" u ON ((u.id = w."userId")))
  WHERE (w.status = 'PENDING'::public."WithdrawalStatus")
  ORDER BY w."requestDate";


--
-- Name: vw_PlatformStatistics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_PlatformStatistics" AS
 SELECT ( SELECT count(*) AS count
           FROM public."User"
          WHERE ("User"."isActive" = true)) AS "totalUsers",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE (("User"."isActive" = true) AND ("User"."createdAt" >= (now() - '30 days'::interval)))) AS "newUsersThisMonth",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE ("User"."lastLogin" >= (now() - '7 days'::interval))) AS "activeUsersWeek",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE ("User"."kycStatus" = 'APPROVED'::public."KYCStatus")) AS "verifiedUsers",
    ( SELECT count(*) AS count
           FROM public."Package") AS "totalPackages",
    ( SELECT count(*) AS count
           FROM public."Package"
          WHERE ("Package".status = 'ACTIVE'::public."PackageStatus")) AS "activePackages",
    ( SELECT count(*) AS count
           FROM public."Package"
          WHERE ("Package".status = 'EXPIRED'::public."PackageStatus")) AS "expiredPackages",
    ( SELECT COALESCE(sum("Package".amount), (0)::numeric) AS "coalesce"
           FROM public."Package"
          WHERE ("Package".status = ANY (ARRAY['ACTIVE'::public."PackageStatus", 'EXPIRED'::public."PackageStatus", 'COMPLETED'::public."PackageStatus"]))) AS "totalInvested",
    ( SELECT COALESCE(sum("RoiPayment".amount), (0)::numeric) AS "coalesce"
           FROM public."RoiPayment"
          WHERE ("RoiPayment".status = 'COMPLETED'::public."RoiPaymentStatus")) AS "totalRoiPaid",
    ( SELECT COALESCE(sum("Earning".amount), (0)::numeric) AS "coalesce"
           FROM public."Earning") AS "totalReferralPaid",
    ( SELECT COALESCE(sum("Withdrawal".amount), (0)::numeric) AS "coalesce"
           FROM public."Withdrawal"
          WHERE ("Withdrawal".status = 'COMPLETED'::public."WithdrawalStatus")) AS "totalWithdrawals",
    ( SELECT COALESCE(sum("Withdrawal".amount), (0)::numeric) AS "coalesce"
           FROM public."Withdrawal"
          WHERE ("Withdrawal".status = 'PENDING'::public."WithdrawalStatus")) AS "pendingWithdrawalAmount",
    ( SELECT count(*) AS count
           FROM public."Withdrawal"
          WHERE ("Withdrawal".status = 'PENDING'::public."WithdrawalStatus")) AS "pendingWithdrawalCount",
    ( SELECT count(*) AS count
           FROM public."BotActivation"
          WHERE ("BotActivation".status = 'ACTIVE'::public."BotStatus")) AS "activeBots",
    ( SELECT count(*) AS count
           FROM public."BotActivation"
          WHERE ("BotActivation"."isExpired" = true)) AS "expiredBots",
    ( SELECT count(*) AS count
           FROM public."User"
          WHERE ("User"."createdAt" >= CURRENT_DATE)) AS "newUsersToday",
    ( SELECT count(*) AS count
           FROM public."Package"
          WHERE ("Package"."createdAt" >= CURRENT_DATE)) AS "newPackagesToday",
    ( SELECT COALESCE(sum("Withdrawal".amount), (0)::numeric) AS "coalesce"
           FROM public."Withdrawal"
          WHERE ("Withdrawal"."createdAt" >= CURRENT_DATE)) AS "withdrawalRequestsToday";


--
-- Name: vw_RoiPaymentSchedule; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_RoiPaymentSchedule" AS
 SELECT p.id AS "packageId",
    p."userId",
    u.email,
    p."packageType",
    p.amount,
    p."roiPercentage" AS "maxRoiPercentage",
    p."investmentDate",
    p."roiPaidCount",
    p."nextRoiDate",
        CASE
            WHEN (p."nextRoiDate" < now()) THEN 'OVERDUE'::text
            WHEN (p."nextRoiDate" < (now() + '3 days'::interval)) THEN 'DUE_SOON'::text
            ELSE 'SCHEDULED'::text
        END AS "nextPaymentStatus",
    EXTRACT(day FROM ((p."nextRoiDate")::timestamp with time zone - now())) AS "daysUntilNext",
    (12 - p."roiPaidCount") AS "paymentsRemaining",
    p."totalRoiPaid",
    p.status
   FROM (public."Package" p
     JOIN public."User" u ON ((u.id = p."userId")))
  WHERE ((p.status = 'ACTIVE'::public."PackageStatus") AND (p."isExpired" = false))
  ORDER BY p."nextRoiDate";


--
-- Name: vw_UserActivityLog; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_UserActivityLog" AS
 SELECT id AS "userId",
    email,
    "lastLogin",
    "lastActiveAt",
    "createdAt" AS "registrationDate",
    ( SELECT count(*) AS count
           FROM public."Transaction" t
          WHERE (t."userId" = u.id)) AS "totalTransactions",
    ( SELECT count(*) AS count
           FROM public."Package" p
          WHERE (p."userId" = u.id)) AS "totalPackages",
    ( SELECT count(*) AS count
           FROM public."Withdrawal" w
          WHERE (w."userId" = u.id)) AS "totalWithdrawals",
    ( SELECT count(*) AS count
           FROM public."LoginAttempt" la
          WHERE ((la.email = u.email) AND (la.success = true))) AS "loginCount",
    ( SELECT max(t."createdAt") AS max
           FROM public."Transaction" t
          WHERE (t."userId" = u.id)) AS "lastTransaction",
    ( SELECT max(w."createdAt") AS max
           FROM public."Withdrawal" w
          WHERE (w."userId" = u.id)) AS "lastWithdrawal",
    ( SELECT max(p."createdAt") AS max
           FROM public."Package" p
          WHERE (p."userId" = u.id)) AS "lastPackagePurchase"
   FROM public."User" u;


--
-- Name: vw_UserBalanceSummary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_UserBalanceSummary" AS
 SELECT u.id AS "userId",
    u.email,
    u."referralCode",
    COALESCE(sum(
        CASE
            WHEN ((t.type = 'ROI_PAYMENT'::public."TransactionType") AND (t.status = 'COMPLETED'::public."TransactionStatus")) THEN t.amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "roiBalance",
    COALESCE(sum(
        CASE
            WHEN ((t.type = ANY (ARRAY['REFERRAL_BONUS'::public."TransactionType", 'LEVEL_INCOME'::public."TransactionType"])) AND (t.status = 'COMPLETED'::public."TransactionStatus")) THEN t.amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "referralBalance",
    COALESCE(sum(
        CASE
            WHEN ((t.type = 'CAPITAL_RETURN'::public."TransactionType") AND (t.status = 'COMPLETED'::public."TransactionStatus")) THEN t.amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "capitalReturned",
    COALESCE(sum(
        CASE
            WHEN ((t.type = ANY (ARRAY['ROI_PAYMENT'::public."TransactionType", 'REFERRAL_BONUS'::public."TransactionType", 'LEVEL_INCOME'::public."TransactionType", 'CAPITAL_RETURN'::public."TransactionType"])) AND (t.status = 'COMPLETED'::public."TransactionStatus")) THEN t.amount
            ELSE (0)::numeric
        END), (0)::numeric) AS "totalEarned",
    COALESCE(( SELECT sum(w.amount) AS sum
           FROM public."Withdrawal" w
          WHERE ((w."userId" = u.id) AND (w.status = ANY (ARRAY['COMPLETED'::public."WithdrawalStatus", 'APPROVED'::public."WithdrawalStatus", 'PROCESSING'::public."WithdrawalStatus"])))), (0)::numeric) AS "totalWithdrawn",
    COALESCE(( SELECT sum(w.amount) AS sum
           FROM public."Withdrawal" w
          WHERE ((w."userId" = u.id) AND (w.status = 'PENDING'::public."WithdrawalStatus"))), (0)::numeric) AS "pendingWithdrawals",
    (COALESCE(sum(
        CASE
            WHEN ((t.type = ANY (ARRAY['ROI_PAYMENT'::public."TransactionType", 'REFERRAL_BONUS'::public."TransactionType", 'LEVEL_INCOME'::public."TransactionType", 'CAPITAL_RETURN'::public."TransactionType"])) AND (t.status = 'COMPLETED'::public."TransactionStatus")) THEN t.amount
            ELSE (0)::numeric
        END), (0)::numeric) - COALESCE(( SELECT sum(w.amount) AS sum
           FROM public."Withdrawal" w
          WHERE ((w."userId" = u.id) AND (w.status = ANY (ARRAY['COMPLETED'::public."WithdrawalStatus", 'APPROVED'::public."WithdrawalStatus", 'PROCESSING'::public."WithdrawalStatus", 'PENDING'::public."WithdrawalStatus"])))), (0)::numeric)) AS "availableBalance",
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM public."Package" p
          WHERE ((p."userId" = u.id) AND (p.status = ANY (ARRAY['ACTIVE'::public."PackageStatus", 'EXPIRED'::public."PackageStatus", 'COMPLETED'::public."PackageStatus"])))), (0)::numeric) AS "totalInvested",
    COALESCE(( SELECT count(*) AS count
           FROM public."Package" p
          WHERE ((p."userId" = u.id) AND (p.status = 'ACTIVE'::public."PackageStatus"))), (0)::bigint) AS "activePackages"
   FROM (public."User" u
     LEFT JOIN public."Transaction" t ON ((t."userId" = u.id)))
  GROUP BY u.id, u.email, u."referralCode";


--
-- Name: vw_UserReferralStats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."vw_UserReferralStats" AS
 SELECT id AS "userId",
    email,
    "referralCode",
    ( SELECT count(*) AS count
           FROM public."User" r
          WHERE (r."referredBy" = u."referralCode")) AS "directReferrals",
    ( SELECT count(*) AS count
           FROM public.get_referral_tree(u."referralCode", 6) get_referral_tree("userId", email, "fullName", "referralCode", level, "createdAt")) AS "totalTeamSize",
    COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE ((e."userId" = u.id) AND (e."earningType" = 'DIRECT_REFERRAL'::public."EarningType"))), (0)::numeric) AS "directReferralEarnings",
    COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE ((e."userId" = u.id) AND (e."earningType" = 'LEVEL_INCOME'::public."EarningType"))), (0)::numeric) AS "levelIncomeEarnings",
    COALESCE(( SELECT sum(e.amount) AS sum
           FROM public."Earning" e
          WHERE ((e."userId" = u.id) AND (e."earningType" = ANY (ARRAY['DIRECT_REFERRAL'::public."EarningType", 'LEVEL_INCOME'::public."EarningType"])))), (0)::numeric) AS "totalReferralEarnings",
    ( SELECT count(DISTINCT p."userId") AS count
           FROM (public."Package" p
             JOIN public."User" r ON ((r.id = p."userId")))
          WHERE ((r."referredBy" = u."referralCode") AND (p.status = 'ACTIVE'::public."PackageStatus"))) AS "activeReferrals"
   FROM public."User" u;


--
-- Name: RoiSettings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiSettings" ALTER COLUMN id SET DEFAULT nextval('public."RoiSettings_id_seq"'::regclass);


--
-- Name: AdminLog AdminLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminLog"
    ADD CONSTRAINT "AdminLog_pkey" PRIMARY KEY (id);


--
-- Name: ApiLog ApiLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiLog"
    ADD CONSTRAINT "ApiLog_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BlockchainScanState BlockchainScanState_network_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockchainScanState"
    ADD CONSTRAINT "BlockchainScanState_network_key" UNIQUE (network);


--
-- Name: BlockchainScanState BlockchainScanState_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockchainScanState"
    ADD CONSTRAINT "BlockchainScanState_pkey" PRIMARY KEY (id);


--
-- Name: BotActivation BotActivation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BotActivation"
    ADD CONSTRAINT "BotActivation_pkey" PRIMARY KEY (id);


--
-- Name: CronJobExecution CronJobExecution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CronJobExecution"
    ADD CONSTRAINT "CronJobExecution_pkey" PRIMARY KEY (id);


--
-- Name: CronJob CronJob_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CronJob"
    ADD CONSTRAINT "CronJob_name_key" UNIQUE (name);


--
-- Name: CronJob CronJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CronJob"
    ADD CONSTRAINT "CronJob_pkey" PRIMARY KEY (id);


--
-- Name: Earning Earning_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Earning"
    ADD CONSTRAINT "Earning_pkey" PRIMARY KEY (id);


--
-- Name: EmailLog EmailLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLog"
    ADD CONSTRAINT "EmailLog_pkey" PRIMARY KEY (id);


--
-- Name: ErrorLog ErrorLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ErrorLog"
    ADD CONSTRAINT "ErrorLog_pkey" PRIMARY KEY (id);


--
-- Name: KYCSubmission KYCSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KYCSubmission"
    ADD CONSTRAINT "KYCSubmission_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempt LoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: LostCommission LostCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LostCommission"
    ADD CONSTRAINT "LostCommission_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Package Package_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Package"
    ADD CONSTRAINT "Package_pkey" PRIMARY KEY (id);


--
-- Name: PaymentConfirmation PaymentConfirmation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentConfirmation"
    ADD CONSTRAINT "PaymentConfirmation_pkey" PRIMARY KEY (id);


--
-- Name: PaymentConfirmation PaymentConfirmation_txHash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentConfirmation"
    ADD CONSTRAINT "PaymentConfirmation_txHash_key" UNIQUE ("txHash");


--
-- Name: PaymentRequest PaymentRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRequest"
    ADD CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY (id);


--
-- Name: PaymentWebhook PaymentWebhook_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentWebhook"
    ADD CONSTRAINT "PaymentWebhook_pkey" PRIMARY KEY (id);


--
-- Name: PlatformWallet PlatformWallet_network_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlatformWallet"
    ADD CONSTRAINT "PlatformWallet_network_key" UNIQUE (network);


--
-- Name: PlatformWallet PlatformWallet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlatformWallet"
    ADD CONSTRAINT "PlatformWallet_pkey" PRIMARY KEY (id);


--
-- Name: RateLimitTracking RateLimitTracking_identifier_endpoint_windowStart_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RateLimitTracking"
    ADD CONSTRAINT "RateLimitTracking_identifier_endpoint_windowStart_key" UNIQUE (identifier, endpoint, "windowStart");


--
-- Name: RateLimitTracking RateLimitTracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RateLimitTracking"
    ADD CONSTRAINT "RateLimitTracking_pkey" PRIMARY KEY (id);


--
-- Name: ReferralCounter ReferralCounter_counterType_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCounter"
    ADD CONSTRAINT "ReferralCounter_counterType_key" UNIQUE ("counterType");


--
-- Name: ReferralCounter ReferralCounter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCounter"
    ADD CONSTRAINT "ReferralCounter_pkey" PRIMARY KEY (id);


--
-- Name: RoiPayment RoiPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiPayment"
    ADD CONSTRAINT "RoiPayment_pkey" PRIMARY KEY (id);


--
-- Name: RoiSettings RoiSettings_packageAmount_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiSettings"
    ADD CONSTRAINT "RoiSettings_packageAmount_key" UNIQUE ("packageAmount");


--
-- Name: RoiSettings RoiSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiSettings"
    ADD CONSTRAINT "RoiSettings_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_token_key" UNIQUE (token);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_ticketNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_ticketNumber_key" UNIQUE ("ticketNumber");


--
-- Name: SystemSetting SystemSetting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_key_key" UNIQUE (key);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: TicketMessage TicketMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_referralCode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_referralCode_key" UNIQUE ("referralCode");


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- Name: Earning_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Earning_userId_idx" ON public."Earning" USING btree ("userId");


--
-- Name: Package_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Package_status_idx" ON public."Package" USING btree (status);


--
-- Name: Package_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Package_userId_idx" ON public."Package" USING btree ("userId");


--
-- Name: RoiPayment_packageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RoiPayment_packageId_idx" ON public."RoiPayment" USING btree ("packageId");


--
-- Name: RoiPayment_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RoiPayment_userId_idx" ON public."RoiPayment" USING btree ("userId");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: Transaction_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_status_idx" ON public."Transaction" USING btree (status);


--
-- Name: Transaction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_userId_idx" ON public."Transaction" USING btree ("userId");


--
-- Name: Withdrawal_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_status_idx" ON public."Withdrawal" USING btree (status);


--
-- Name: Withdrawal_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_userId_idx" ON public."Withdrawal" USING btree ("userId");


--
-- Name: idx_active_packages_roi_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_packages_roi_due ON public."Package" USING btree ("nextRoiDate") WHERE ((status = 'ACTIVE'::public."PackageStatus") AND ("isExpired" = false) AND ("nextRoiDate" IS NOT NULL));


--
-- Name: idx_active_sessions_only; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_sessions_only ON public."Session" USING btree ("lastUsedAt" DESC) WHERE ("isActive" = true);


--
-- Name: idx_active_users_only; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_users_only ON public."User" USING btree ("createdAt" DESC) WHERE (("isActive" = true) AND ("isBlocked" = false));


--
-- Name: idx_adminlog_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adminlog_action ON public."AdminLog" USING btree (action);


--
-- Name: idx_adminlog_action_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adminlog_action_created ON public."AdminLog" USING btree (action, "createdAt" DESC);


--
-- Name: idx_adminlog_adminId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_adminlog_adminId" ON public."AdminLog" USING btree ("adminId");


--
-- Name: idx_adminlog_admin_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adminlog_admin_created ON public."AdminLog" USING btree ("adminId", "createdAt" DESC);


--
-- Name: idx_adminlog_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_adminlog_createdAt" ON public."AdminLog" USING btree ("createdAt" DESC);


--
-- Name: idx_adminlog_details_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adminlog_details_gin ON public."AdminLog" USING gin (details);


--
-- Name: idx_adminlog_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_adminlog_target ON public."AdminLog" USING btree ("targetType", "targetId");


--
-- Name: idx_adminlog_targetId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_adminlog_targetId" ON public."AdminLog" USING btree ("targetId");


--
-- Name: idx_adminlog_targetType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_adminlog_targetType" ON public."AdminLog" USING btree ("targetType");


--
-- Name: idx_apilog_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_apilog_createdAt" ON public."ApiLog" USING btree ("createdAt" DESC);


--
-- Name: idx_apilog_error; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apilog_error ON public."ApiLog" USING btree ("createdAt" DESC) WHERE (error IS NOT NULL);


--
-- Name: idx_apilog_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apilog_path ON public."ApiLog" USING btree (path);


--
-- Name: idx_apilog_slow_requests; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apilog_slow_requests ON public."ApiLog" USING btree ("createdAt" DESC) WHERE ("responseTime" > 1000);


--
-- Name: idx_apilog_statusCode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_apilog_statusCode" ON public."ApiLog" USING btree ("statusCode");


--
-- Name: idx_apilog_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_apilog_userId" ON public."ApiLog" USING btree ("userId");


--
-- Name: idx_apilog_user_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apilog_user_path ON public."ApiLog" USING btree ("userId", path, "createdAt" DESC) WHERE ("userId" IS NOT NULL);


--
-- Name: idx_auditlog_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditlog_action ON public."AuditLog" USING btree (action);


--
-- Name: idx_auditlog_changes_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditlog_changes_gin ON public."AuditLog" USING gin (changes);


--
-- Name: idx_auditlog_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_auditlog_createdAt" ON public."AuditLog" USING btree ("createdAt" DESC);


--
-- Name: idx_auditlog_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditlog_entity ON public."AuditLog" USING btree ("entityType", "entityId");


--
-- Name: idx_auditlog_entityId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_auditlog_entityId" ON public."AuditLog" USING btree ("entityId");


--
-- Name: idx_auditlog_entityType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_auditlog_entityType" ON public."AuditLog" USING btree ("entityType");


--
-- Name: idx_auditlog_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_auditlog_userId" ON public."AuditLog" USING btree ("userId");


--
-- Name: idx_auditlog_user_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditlog_user_action ON public."AuditLog" USING btree ("userId", action, "createdAt" DESC);


--
-- Name: idx_bot_active_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bot_active_expiry ON public."BotActivation" USING btree (status, "expiryDate") WHERE (status = 'ACTIVE'::public."BotStatus");


--
-- Name: idx_bot_expired_flag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bot_expired_flag ON public."BotActivation" USING btree ("isExpired", "expiryDate");


--
-- Name: idx_bot_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bot_user_status ON public."BotActivation" USING btree ("userId", status);


--
-- Name: idx_botactivation_activationDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_activationDate" ON public."BotActivation" USING btree ("activationDate");


--
-- Name: idx_botactivation_botType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_botType" ON public."BotActivation" USING btree ("botType");


--
-- Name: idx_botactivation_expiryDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_expiryDate" ON public."BotActivation" USING btree ("expiryDate");


--
-- Name: idx_botactivation_isExpired; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_isExpired" ON public."BotActivation" USING btree ("isExpired");


--
-- Name: idx_botactivation_packageId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_packageId" ON public."BotActivation" USING btree ("packageId");


--
-- Name: idx_botactivation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_botactivation_status ON public."BotActivation" USING btree (status);


--
-- Name: idx_botactivation_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_botactivation_userId" ON public."BotActivation" USING btree ("userId");


--
-- Name: idx_cronjob_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjob_enabled ON public."CronJob" USING btree (enabled);


--
-- Name: idx_cronjob_enabled_next; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjob_enabled_next ON public."CronJob" USING btree (enabled, "nextRunAt") WHERE (enabled = true);


--
-- Name: idx_cronjob_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjob_name ON public."CronJob" USING btree (name);


--
-- Name: idx_cronjob_nextRunAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_cronjob_nextRunAt" ON public."CronJob" USING btree ("nextRunAt");


--
-- Name: idx_cronjob_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjob_status ON public."CronJob" USING btree (status);


--
-- Name: idx_cronjob_status_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjob_status_name ON public."CronJob" USING btree (status, name);


--
-- Name: idx_cronjobexec_failed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjobexec_failed ON public."CronJobExecution" USING btree ("cronJobId", "startedAt" DESC) WHERE (success = false);


--
-- Name: idx_cronjobexec_job_started; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjobexec_job_started ON public."CronJobExecution" USING btree ("cronJobId", "startedAt" DESC);


--
-- Name: idx_cronjobexecution_cronJobId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_cronjobexecution_cronJobId" ON public."CronJobExecution" USING btree ("cronJobId");


--
-- Name: idx_cronjobexecution_startedAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_cronjobexecution_startedAt" ON public."CronJobExecution" USING btree ("startedAt" DESC);


--
-- Name: idx_cronjobexecution_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cronjobexecution_status ON public."CronJobExecution" USING btree (status);


--
-- Name: idx_earning_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_earning_createdAt" ON public."Earning" USING btree ("createdAt" DESC);


--
-- Name: idx_earning_earningType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_earning_earningType" ON public."Earning" USING btree ("earningType");


--
-- Name: idx_earning_fromUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_earning_fromUserId" ON public."Earning" USING btree ("fromUserId");


--
-- Name: idx_earning_from_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_from_type ON public."Earning" USING btree ("fromUserId", "earningType");


--
-- Name: idx_earning_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_level ON public."Earning" USING btree (level);


--
-- Name: idx_earning_level_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_level_created ON public."Earning" USING btree (level, "createdAt" DESC) WHERE (level IS NOT NULL);


--
-- Name: idx_earning_packageId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_earning_packageId" ON public."Earning" USING btree ("packageId");


--
-- Name: idx_earning_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_status ON public."Earning" USING btree (status);


--
-- Name: idx_earning_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_earning_userId" ON public."Earning" USING btree ("userId");


--
-- Name: idx_earning_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_user_created ON public."Earning" USING btree ("userId", "createdAt" DESC);


--
-- Name: idx_earning_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_earning_user_type ON public."Earning" USING btree ("userId", "earningType");


--
-- Name: idx_emaillog_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_emaillog_createdAt" ON public."EmailLog" USING btree ("createdAt" DESC);


--
-- Name: idx_emaillog_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emaillog_status ON public."EmailLog" USING btree (status);


--
-- Name: idx_emaillog_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emaillog_status_created ON public."EmailLog" USING btree (status, "createdAt" DESC);


--
-- Name: idx_emaillog_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emaillog_to ON public."EmailLog" USING btree ("to");


--
-- Name: idx_emaillog_to_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emaillog_to_created ON public."EmailLog" USING btree ("to", "createdAt" DESC);


--
-- Name: idx_emaillog_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_emaillog_userId" ON public."EmailLog" USING btree ("userId");


--
-- Name: idx_emaillog_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emaillog_user_status ON public."EmailLog" USING btree ("userId", status);


--
-- Name: idx_errorlog_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_errorlog_createdAt" ON public."ErrorLog" USING btree ("createdAt" DESC);


--
-- Name: idx_errorlog_errorType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_errorlog_errorType" ON public."ErrorLog" USING btree ("errorType");


--
-- Name: idx_errorlog_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_errorlog_resolved ON public."ErrorLog" USING btree (resolved);


--
-- Name: idx_errorlog_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_errorlog_severity ON public."ErrorLog" USING btree (severity);


--
-- Name: idx_errorlog_unresolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_errorlog_unresolved ON public."ErrorLog" USING btree ("createdAt" DESC) WHERE (resolved = false);


--
-- Name: idx_errorlog_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_errorlog_userId" ON public."ErrorLog" USING btree ("userId");


--
-- Name: idx_failed_transactions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_failed_transactions ON public."Transaction" USING btree ("createdAt" DESC) WHERE (status = 'FAILED'::public."TransactionStatus");


--
-- Name: idx_kyc_approved_users; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_approved_users ON public."User" USING btree ("createdAt" DESC) WHERE ("kycStatus" = 'APPROVED'::public."KYCStatus");


--
-- Name: idx_kyc_pending_submitted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_pending_submitted ON public."KYCSubmission" USING btree ("submittedAt") WHERE (status = 'PENDING'::public."KYCStatus");


--
-- Name: idx_kyc_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_user_status ON public."KYCSubmission" USING btree ("userId", status);


--
-- Name: idx_kycsubmission_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kycsubmission_status ON public."KYCSubmission" USING btree (status);


--
-- Name: idx_kycsubmission_submittedAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_kycsubmission_submittedAt" ON public."KYCSubmission" USING btree ("submittedAt" DESC);


--
-- Name: idx_kycsubmission_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_kycsubmission_userId" ON public."KYCSubmission" USING btree ("userId");


--
-- Name: idx_loginattempt_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_loginattempt_createdAt" ON public."LoginAttempt" USING btree ("createdAt" DESC);


--
-- Name: idx_loginattempt_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loginattempt_email ON public."LoginAttempt" USING btree (email);


--
-- Name: idx_loginattempt_email_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loginattempt_email_created ON public."LoginAttempt" USING btree (email, "createdAt" DESC);


--
-- Name: idx_loginattempt_email_success; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loginattempt_email_success ON public."LoginAttempt" USING btree (email, success, "createdAt" DESC);


--
-- Name: idx_loginattempt_ipAddress; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_loginattempt_ipAddress" ON public."LoginAttempt" USING btree ("ipAddress");


--
-- Name: idx_loginattempt_ip_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loginattempt_ip_created ON public."LoginAttempt" USING btree ("ipAddress", "createdAt" DESC);


--
-- Name: idx_loginattempt_success; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loginattempt_success ON public."LoginAttempt" USING btree (success);


--
-- Name: idx_loginattempt_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_loginattempt_userId" ON public."LoginAttempt" USING btree ("userId");


--
-- Name: idx_lostcommission_package; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lostcommission_package ON public."LostCommission" USING btree ("packageId");


--
-- Name: idx_lostcommission_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lostcommission_recipient ON public."LostCommission" USING btree ("wouldBeRecipientId");


--
-- Name: idx_notification_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_notification_createdAt" ON public."Notification" USING btree ("createdAt" DESC);


--
-- Name: idx_notification_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_read ON public."Notification" USING btree (read);


--
-- Name: idx_notification_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_type ON public."Notification" USING btree (type);


--
-- Name: idx_notification_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_unread ON public."Notification" USING btree ("userId") WHERE (read = false);


--
-- Name: idx_notification_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_notification_userId" ON public."Notification" USING btree ("userId");


--
-- Name: idx_notification_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_user_read ON public."Notification" USING btree ("userId", read, "createdAt" DESC);


--
-- Name: idx_notification_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_user_type ON public."Notification" USING btree ("userId", type) WHERE (read = false);


--
-- Name: idx_package_active_nextpayment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_active_nextpayment ON public."Package" USING btree (status, "nextRoiDate") WHERE (status = 'ACTIVE'::public."PackageStatus");


--
-- Name: idx_package_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_createdAt" ON public."Package" USING btree ("createdAt" DESC);


--
-- Name: idx_package_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_created_date ON public."Package" USING btree (date("createdAt"));


--
-- Name: idx_package_expired_flag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_expired_flag ON public."Package" USING btree ("isExpired", "expiryDate") WHERE ("isExpired" = false);


--
-- Name: idx_package_expiryDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_expiryDate" ON public."Package" USING btree ("expiryDate");


--
-- Name: idx_package_investmentDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_investmentDate" ON public."Package" USING btree ("investmentDate");


--
-- Name: idx_package_isExpired; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_isExpired" ON public."Package" USING btree ("isExpired");


--
-- Name: idx_package_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_metadata_gin ON public."Package" USING gin (metadata);


--
-- Name: idx_package_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_month ON public."Package" USING btree (date_trunc('month'::text, "createdAt"));


--
-- Name: idx_package_nextRoiDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_nextRoiDate" ON public."Package" USING btree ("nextRoiDate");


--
-- Name: idx_package_packageType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_packageType" ON public."Package" USING btree ("packageType");


--
-- Name: idx_package_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_status ON public."Package" USING btree (status);


--
-- Name: idx_package_status_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_status_type ON public."Package" USING btree (status, "packageType");


--
-- Name: idx_package_summary_covering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_summary_covering ON public."Package" USING btree ("userId", status) INCLUDE (amount, "packageType", "roiPercentage", "investmentDate");


--
-- Name: idx_package_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_package_userId" ON public."Package" USING btree ("userId");


--
-- Name: idx_package_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_user_active ON public."Package" USING btree ("userId", status) WHERE (status = 'ACTIVE'::public."PackageStatus");


--
-- Name: idx_package_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_package_user_status ON public."Package" USING btree ("userId", status);


--
-- Name: idx_packages_expiring_soon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_packages_expiring_soon ON public."Package" USING btree ("expiryDate") WHERE (status = 'ACTIVE'::public."PackageStatus");


--
-- Name: idx_payment_network_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_network_status ON public."PaymentRequest" USING btree (network, status);


--
-- Name: idx_payment_pending_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_pending_expires ON public."PaymentRequest" USING btree ("expiresAt") WHERE (status = 'PENDING'::public."PaymentStatus");


--
-- Name: idx_payment_purpose_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_purpose_status ON public."PaymentRequest" USING btree (purpose, status);


--
-- Name: idx_payment_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_status_created ON public."PaymentRequest" USING btree (status, "createdAt" DESC);


--
-- Name: idx_payment_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_user_status ON public."PaymentRequest" USING btree ("userId", status);


--
-- Name: idx_paymentconf_network_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentconf_network_status ON public."PaymentConfirmation" USING btree (network, status);


--
-- Name: idx_paymentconf_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentconf_pending ON public."PaymentConfirmation" USING btree ("isConfirmed", "nextCheckAt") WHERE ("isConfirmed" = false);


--
-- Name: idx_paymentconfirmation_isConfirmed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentconfirmation_isConfirmed" ON public."PaymentConfirmation" USING btree ("isConfirmed");


--
-- Name: idx_paymentconfirmation_network; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentconfirmation_network ON public."PaymentConfirmation" USING btree (network);


--
-- Name: idx_paymentconfirmation_nextCheckAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentconfirmation_nextCheckAt" ON public."PaymentConfirmation" USING btree ("nextCheckAt");


--
-- Name: idx_paymentconfirmation_paymentRequestId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentconfirmation_paymentRequestId" ON public."PaymentConfirmation" USING btree ("paymentRequestId");


--
-- Name: idx_paymentconfirmation_txHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentconfirmation_txHash" ON public."PaymentConfirmation" USING btree ("txHash");


--
-- Name: idx_paymentrequest_depositAddress; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentrequest_depositAddress" ON public."PaymentRequest" USING btree ("depositAddress");


--
-- Name: idx_paymentrequest_expiresAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentrequest_expiresAt" ON public."PaymentRequest" USING btree ("expiresAt");


--
-- Name: idx_paymentrequest_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentrequest_metadata_gin ON public."PaymentRequest" USING gin (metadata);


--
-- Name: idx_paymentrequest_network; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentrequest_network ON public."PaymentRequest" USING btree (network);


--
-- Name: idx_paymentrequest_purpose; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentrequest_purpose ON public."PaymentRequest" USING btree (purpose);


--
-- Name: idx_paymentrequest_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentrequest_status ON public."PaymentRequest" USING btree (status);


--
-- Name: idx_paymentrequest_txHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentrequest_txHash" ON public."PaymentRequest" USING btree ("txHash");


--
-- Name: idx_paymentrequest_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentrequest_userId" ON public."PaymentRequest" USING btree ("userId");


--
-- Name: idx_paymentwebhook_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentwebhook_createdAt" ON public."PaymentWebhook" USING btree ("createdAt" DESC);


--
-- Name: idx_paymentwebhook_paymentRequestId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentwebhook_paymentRequestId" ON public."PaymentWebhook" USING btree ("paymentRequestId");


--
-- Name: idx_paymentwebhook_processed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paymentwebhook_processed ON public."PaymentWebhook" USING btree (processed);


--
-- Name: idx_paymentwebhook_txHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_paymentwebhook_txHash" ON public."PaymentWebhook" USING btree ("txHash");


--
-- Name: idx_pending_withdrawals_queue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_withdrawals_queue ON public."Withdrawal" USING btree ("requestDate") WHERE (status = 'PENDING'::public."WithdrawalStatus");


--
-- Name: idx_ratelimit_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratelimit_identifier ON public."RateLimitTracking" USING btree (identifier);


--
-- Name: idx_ratelimit_windowEnd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ratelimit_windowEnd" ON public."RateLimitTracking" USING btree ("windowEnd");


--
-- Name: idx_roi_package_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roi_package_month ON public."RoiPayment" USING btree ("packageId", "monthNumber");


--
-- Name: idx_roi_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roi_payment_date ON public."RoiPayment" USING btree ("paymentDate" DESC);


--
-- Name: idx_roi_scheduled_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roi_scheduled_pending ON public."RoiPayment" USING btree ("scheduledDate") WHERE (status = 'PENDING'::public."RoiPaymentStatus");


--
-- Name: idx_roi_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roi_user_status ON public."RoiPayment" USING btree ("userId", status);


--
-- Name: idx_roipayment_monthNumber; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_roipayment_monthNumber" ON public."RoiPayment" USING btree ("monthNumber");


--
-- Name: idx_roipayment_packageId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_roipayment_packageId" ON public."RoiPayment" USING btree ("packageId");


--
-- Name: idx_roipayment_paymentDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_roipayment_paymentDate" ON public."RoiPayment" USING btree ("paymentDate" DESC);


--
-- Name: idx_roipayment_scheduledDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_roipayment_scheduledDate" ON public."RoiPayment" USING btree ("scheduledDate");


--
-- Name: idx_roipayment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roipayment_status ON public."RoiPayment" USING btree (status);


--
-- Name: idx_roipayment_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_roipayment_userId" ON public."RoiPayment" USING btree ("userId");


--
-- Name: idx_session_expiresAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_session_expiresAt" ON public."Session" USING btree ("expiresAt");


--
-- Name: idx_session_expires_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_expires_active ON public."Session" USING btree ("expiresAt", "isActive");


--
-- Name: idx_session_isActive; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_session_isActive" ON public."Session" USING btree ("isActive");


--
-- Name: idx_session_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_status ON public."Session" USING btree (status);


--
-- Name: idx_session_status_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_status_expires ON public."Session" USING btree (status, "expiresAt");


--
-- Name: idx_session_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_token ON public."Session" USING btree (token);


--
-- Name: idx_session_tokenHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_session_tokenHash" ON public."Session" USING btree ("tokenHash");


--
-- Name: idx_session_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_session_userId" ON public."Session" USING btree ("userId");


--
-- Name: idx_session_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_user_active ON public."Session" USING btree ("userId", "isActive") WHERE ("isActive" = true);


--
-- Name: idx_supportticket_assignedTo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_supportticket_assignedTo" ON public."SupportTicket" USING btree ("assignedTo");


--
-- Name: idx_supportticket_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_supportticket_createdAt" ON public."SupportTicket" USING btree ("createdAt" DESC);


--
-- Name: idx_supportticket_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supportticket_priority ON public."SupportTicket" USING btree (priority);


--
-- Name: idx_supportticket_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supportticket_status ON public."SupportTicket" USING btree (status);


--
-- Name: idx_supportticket_ticketNumber; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_supportticket_ticketNumber" ON public."SupportTicket" USING btree ("ticketNumber");


--
-- Name: idx_supportticket_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_supportticket_userId" ON public."SupportTicket" USING btree ("userId");


--
-- Name: idx_systemsetting_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_systemsetting_category ON public."SystemSetting" USING btree (category);


--
-- Name: idx_systemsetting_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_systemsetting_key ON public."SystemSetting" USING btree (key);


--
-- Name: idx_ticket_assigned_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_assigned_status ON public."SupportTicket" USING btree ("assignedTo", status) WHERE ("assignedTo" IS NOT NULL);


--
-- Name: idx_ticket_fulltext; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_fulltext ON public."SupportTicket" USING gin (to_tsvector('english'::regconfig, ((COALESCE(subject, ''::text) || ' '::text) || COALESCE(message, ''::text))));


--
-- Name: idx_ticket_open_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_open_created ON public."SupportTicket" USING btree ("createdAt" DESC) WHERE (status = ANY (ARRAY['OPEN'::public."TicketStatus", 'IN_PROGRESS'::public."TicketStatus"]));


--
-- Name: idx_ticket_status_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_status_priority ON public."SupportTicket" USING btree (status, priority);


--
-- Name: idx_ticket_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_user_status ON public."SupportTicket" USING btree ("userId", status);


--
-- Name: idx_ticketmessage_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ticketmessage_createdAt" ON public."TicketMessage" USING btree ("createdAt");


--
-- Name: idx_ticketmessage_ticketId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ticketmessage_ticketId" ON public."TicketMessage" USING btree ("ticketId");


--
-- Name: idx_ticketmessage_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ticketmessage_userId" ON public."TicketMessage" USING btree ("userId");


--
-- Name: idx_transaction_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transaction_createdAt" ON public."Transaction" USING btree ("createdAt" DESC);


--
-- Name: idx_transaction_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_created_date ON public."Transaction" USING btree (date("createdAt"));


--
-- Name: idx_transaction_history_covering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_history_covering ON public."Transaction" USING btree ("userId", "createdAt" DESC) INCLUDE (type, amount, status, description);


--
-- Name: idx_transaction_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_metadata_gin ON public."Transaction" USING gin (metadata);


--
-- Name: idx_transaction_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_month ON public."Transaction" USING btree (date_trunc('month'::text, "createdAt"));


--
-- Name: idx_transaction_network; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_network ON public."Transaction" USING btree (network);


--
-- Name: idx_transaction_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_reference ON public."Transaction" USING btree ("referenceType", "referenceId");


--
-- Name: idx_transaction_referenceId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transaction_referenceId" ON public."Transaction" USING btree ("referenceId");


--
-- Name: idx_transaction_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_status ON public."Transaction" USING btree (status);


--
-- Name: idx_transaction_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_status_created ON public."Transaction" USING btree (status, "createdAt" DESC);


--
-- Name: idx_transaction_txHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transaction_txHash" ON public."Transaction" USING btree ("txHash");


--
-- Name: idx_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_type ON public."Transaction" USING btree (type);


--
-- Name: idx_transaction_type_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_type_created ON public."Transaction" USING btree (type, "createdAt" DESC);


--
-- Name: idx_transaction_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transaction_userId" ON public."Transaction" USING btree ("userId");


--
-- Name: idx_transaction_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_user_created ON public."Transaction" USING btree ("userId", "createdAt" DESC);


--
-- Name: idx_transaction_user_type_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_user_type_status ON public."Transaction" USING btree ("userId", type, status);


--
-- Name: idx_unconfirmed_payments; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_unconfirmed_payments ON public."PaymentConfirmation" USING btree ("lastCheckedAt") WHERE (("isConfirmed" = false) AND ("errorCount" < 10));


--
-- Name: idx_unread_notifications_only; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_unread_notifications_only ON public."Notification" USING btree ("createdAt" DESC) WHERE (read = false);


--
-- Name: idx_user_active_kyc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_active_kyc ON public."User" USING btree ("isActive", "kycStatus") WHERE ("isActive" = true);


--
-- Name: idx_user_blocked_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_blocked_created ON public."User" USING btree ("isBlocked", "createdAt") WHERE ("isBlocked" = false);


--
-- Name: idx_user_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_createdAt" ON public."User" USING btree ("createdAt" DESC);


--
-- Name: idx_user_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_created_date ON public."User" USING btree (date("createdAt"));


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_email ON public."User" USING btree (email);


--
-- Name: idx_user_email_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_email_domain ON public."User" USING btree (lower(split_part(email, '@'::text, 2)));


--
-- Name: idx_user_fulltext; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_fulltext ON public."User" USING gin (to_tsvector('english'::regconfig, ((COALESCE("fullName", ''::text) || ' '::text) || COALESCE(email, ''::text))));


--
-- Name: idx_user_hasPurchasedBot; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_hasPurchasedBot" ON public."User" USING btree ("hasPurchasedBot");


--
-- Name: idx_user_isActive; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_isActive" ON public."User" USING btree ("isActive");


--
-- Name: idx_user_isBlocked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_isBlocked" ON public."User" USING btree ("isBlocked");


--
-- Name: idx_user_kycStatus; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_kycStatus" ON public."User" USING btree ("kycStatus");


--
-- Name: idx_user_lastLogin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_lastLogin" ON public."User" USING btree ("lastLogin" DESC);


--
-- Name: idx_user_lookup_covering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lookup_covering ON public."User" USING btree (email) INCLUDE (id, "fullName", "isActive", "kycStatus");


--
-- Name: idx_user_referralCode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_referralCode" ON public."User" USING btree ("referralCode");


--
-- Name: idx_user_referredBy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_referredBy" ON public."User" USING btree ("referredBy");


--
-- Name: idx_user_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role ON public."User" USING btree (role);


--
-- Name: idx_user_role_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_role_active ON public."User" USING btree (role, "isActive") WHERE ("isActive" = true);


--
-- Name: idx_withdrawal_approvedBy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_withdrawal_approvedBy" ON public."Withdrawal" USING btree ("approvedBy");


--
-- Name: idx_withdrawal_approved_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_approved_user ON public."Withdrawal" USING btree ("approvedBy", "approvedAt") WHERE ("approvedBy" IS NOT NULL);


--
-- Name: idx_withdrawal_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_withdrawal_createdAt" ON public."Withdrawal" USING btree ("createdAt" DESC);


--
-- Name: idx_withdrawal_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_created_date ON public."Withdrawal" USING btree (date("createdAt"));


--
-- Name: idx_withdrawal_network; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_network ON public."Withdrawal" USING btree (network);


--
-- Name: idx_withdrawal_network_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_network_status ON public."Withdrawal" USING btree (network, status);


--
-- Name: idx_withdrawal_pending_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_pending_date ON public."Withdrawal" USING btree ("requestDate") WHERE (status = 'PENDING'::public."WithdrawalStatus");


--
-- Name: idx_withdrawal_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_status ON public."Withdrawal" USING btree (status);


--
-- Name: idx_withdrawal_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_status_created ON public."Withdrawal" USING btree (status, "createdAt" DESC);


--
-- Name: idx_withdrawal_txHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_withdrawal_txHash" ON public."Withdrawal" USING btree ("txHash");


--
-- Name: idx_withdrawal_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_withdrawal_userId" ON public."Withdrawal" USING btree ("userId");


--
-- Name: idx_withdrawal_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawal_user_status ON public."Withdrawal" USING btree ("userId", status);


--
-- Name: mv_UserEarningsSummary_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "mv_UserEarningsSummary_userId_idx" ON public."mv_UserEarningsSummary" USING btree ("userId");


--
-- Name: mv_UserEarningsSummary_userId_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "mv_UserEarningsSummary_userId_idx1" ON public."mv_UserEarningsSummary" USING btree ("userId");


--
-- Name: BotActivation botactivation_assign_referral_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER botactivation_assign_referral_code AFTER INSERT OR UPDATE ON public."BotActivation" FOR EACH ROW EXECUTE FUNCTION public.assign_unique_referral_code_after_bot_purchase();


--
-- Name: BotActivation botactivation_update_user_status; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER botactivation_update_user_status AFTER INSERT OR UPDATE ON public."BotActivation" FOR EACH ROW EXECUTE FUNCTION public.update_user_bot_purchase_status();


--
-- Name: User log_user_actions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_user_actions AFTER UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();


--
-- Name: Withdrawal log_withdrawal_actions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_withdrawal_actions AFTER UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();


--
-- Name: Package package_referral_earnings; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER package_referral_earnings AFTER INSERT OR UPDATE ON public."Package" FOR EACH ROW EXECUTE FUNCTION public.process_referral_earnings();


--
-- Name: Package package_status_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER package_status_notification AFTER UPDATE ON public."Package" FOR EACH ROW EXECUTE FUNCTION public.create_event_notification();


--
-- Name: RoiPayment roipayment_update_package; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER roipayment_update_package AFTER INSERT ON public."RoiPayment" FOR EACH ROW EXECUTE FUNCTION public.update_package_roi_stats();


--
-- Name: Session session_auto_expire; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER session_auto_expire BEFORE UPDATE ON public."Session" FOR EACH ROW EXECUTE FUNCTION public.auto_expire_sessions();


--
-- Name: SupportTicket supportticket_generate_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER supportticket_generate_number BEFORE INSERT ON public."SupportTicket" FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();


--
-- Name: Transaction transaction_update_activity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER transaction_update_activity AFTER INSERT ON public."Transaction" FOR EACH ROW EXECUTE FUNCTION public.update_last_activity();


--
-- Name: BotActivation update_botactivation_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_botactivation_updated_at BEFORE UPDATE ON public."BotActivation" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: CronJob update_cronjob_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cronjob_updated_at BEFORE UPDATE ON public."CronJob" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: KYCSubmission update_kycsubmission_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_kycsubmission_updated_at BEFORE UPDATE ON public."KYCSubmission" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Package update_package_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_package_updated_at BEFORE UPDATE ON public."Package" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: PaymentConfirmation update_paymentconfirmation_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_paymentconfirmation_updated_at BEFORE UPDATE ON public."PaymentConfirmation" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: PaymentRequest update_paymentrequest_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_paymentrequest_updated_at BEFORE UPDATE ON public."PaymentRequest" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: PlatformWallet update_platformwallet_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_platformwallet_updated_at BEFORE UPDATE ON public."PlatformWallet" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: SupportTicket update_supportticket_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_supportticket_updated_at BEFORE UPDATE ON public."SupportTicket" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: SystemSetting update_systemsetting_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_systemsetting_updated_at BEFORE UPDATE ON public."SystemSetting" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Transaction update_transaction_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transaction_updated_at BEFORE UPDATE ON public."Transaction" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: User update_user_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Withdrawal update_withdrawal_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_withdrawal_updated_at BEFORE UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: User user_generate_referral_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_generate_referral_code BEFORE INSERT ON public."User" FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();


--
-- Name: User user_kyc_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_kyc_notification AFTER UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.create_event_notification();


--
-- Name: Withdrawal withdrawal_calculate_net; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawal_calculate_net BEFORE INSERT OR UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.calculate_withdrawal_net_amount();


--
-- Name: Withdrawal withdrawal_create_transaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawal_create_transaction AFTER UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.create_withdrawal_transaction();


--
-- Name: Withdrawal withdrawal_status_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawal_status_notification AFTER UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.create_event_notification();


--
-- Name: Withdrawal withdrawal_update_activity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawal_update_activity AFTER INSERT ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.update_last_activity();


--
-- Name: Withdrawal withdrawal_validate_amount; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawal_validate_amount BEFORE INSERT ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.validate_withdrawal_amount();


--
-- Name: AdminLog AdminLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminLog"
    ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: ApiLog ApiLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiLog"
    ADD CONSTRAINT "ApiLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: BotActivation BotActivation_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BotActivation"
    ADD CONSTRAINT "BotActivation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Package"(id) ON DELETE SET NULL;


--
-- Name: BotActivation BotActivation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BotActivation"
    ADD CONSTRAINT "BotActivation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: CronJobExecution CronJobExecution_cronJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CronJobExecution"
    ADD CONSTRAINT "CronJobExecution_cronJobId_fkey" FOREIGN KEY ("cronJobId") REFERENCES public."CronJob"(id) ON DELETE CASCADE;


--
-- Name: Earning Earning_fromUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Earning"
    ADD CONSTRAINT "Earning_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: Earning Earning_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Earning"
    ADD CONSTRAINT "Earning_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Package"(id) ON DELETE SET NULL;


--
-- Name: Earning Earning_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Earning"
    ADD CONSTRAINT "Earning_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: EmailLog EmailLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLog"
    ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: ErrorLog ErrorLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ErrorLog"
    ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: KYCSubmission KYCSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KYCSubmission"
    ADD CONSTRAINT "KYCSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Package Package_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Package"
    ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: PaymentConfirmation PaymentConfirmation_paymentRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentConfirmation"
    ADD CONSTRAINT "PaymentConfirmation_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES public."PaymentRequest"(id) ON DELETE CASCADE;


--
-- Name: PaymentRequest PaymentRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRequest"
    ADD CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: PaymentWebhook PaymentWebhook_paymentRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentWebhook"
    ADD CONSTRAINT "PaymentWebhook_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES public."PaymentRequest"(id) ON DELETE SET NULL;


--
-- Name: RoiPayment RoiPayment_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiPayment"
    ADD CONSTRAINT "RoiPayment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Package"(id) ON DELETE CASCADE;


--
-- Name: RoiPayment RoiPayment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RoiPayment"
    ADD CONSTRAINT "RoiPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: SupportTicket SupportTicket_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: TicketMessage TicketMessage_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON DELETE CASCADE;


--
-- Name: TicketMessage TicketMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Withdrawal Withdrawal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict uiffZNchhWzmPfn0xZ40Ot3antBdFPru0P0DUOw0XFT3PSDARhG4ye0Po9kBacF

