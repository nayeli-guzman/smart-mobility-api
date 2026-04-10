import json
import os
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        "body": json.dumps(body, default=decimal_default),
    }


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def handler(event, context):
    try:
        authorizer = event.get("requestContext", {}).get("authorizer", {}).get("jwt", {})
        claims = authorizer.get("claims", {})

        user_id = claims.get("sub")
        email = claims.get("email")

        if not user_id or not email:
            return response(400, {
                "message": "Missing required claims in JWT",
                "receivedClaims": list(claims.keys())
            })

        existing = table.get_item(Key={"userId": user_id})
        if "Item" in existing:
            return response(200, {
                "message": "User already exists",
                "user": existing["Item"],
                "created": False
            })

        item = {
            "userId": user_id,
            "email": email,
            "preferences": {
                "transportMode": "car",
                "avoidCongestion": True
            },
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }

        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(userId)"
        )

        return response(201, {
            "message": "User profile created",
            "user": item,
            "created": True
        })

    except ClientError as e:
        error_code = e.response["Error"]["Code"]

        if error_code == "ConditionalCheckFailedException":
            return response(200, {
                "message": "User already exists",
                "created": False
            })

        return response(500, {
            "message": "DynamoDB error",
            "error": str(e)
        })

    except Exception as e:
        return response(500, {
            "message": "Internal server error",
            "error": str(e)
        })