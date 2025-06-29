-- Add unique constraint on email column for Auth.js compatibility
-- Run this in your Supabase SQL Editor

ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
