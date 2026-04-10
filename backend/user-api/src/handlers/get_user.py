import json
import os
from decimal import Decimal

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body, default=decimal_default),
    }


def handler(event, context):
    try:
        user_id = event.get("pathParameters", {}).get("userId")

        if not user_id:
            return response(400, {"message": "userId is required"})

        result = table.get_item(Key={"userId": user_id})
        item = result.get("Item")

        if not item:
            return response(404, {"message": "User not found"})

        return response(200, item)

    except Exception as e:
        return response(500, {
            "message": "Internal server error",
            "error": str(e)
        })