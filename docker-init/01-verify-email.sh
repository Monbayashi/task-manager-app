#!/bin/bash
sleep 10
echo "Verifying SES email identity..."
aws ses verify-email-identity --email-address "noreply@joji-monbayashi.click" --region ap-northeast-1 --endpoint-url http://localhost:4566
