import json
import os
from datetime import datetime, timezone
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
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,PATCH",
        },
        "body": json.dumps(body, default=decimal_default),
    }


def handler(event, context):
    try:
        user_id = event.get("pathParameters", {}).get("userId")

        if not user_id:
            return response(400, {"message": "userId is required"})

        body = json.loads(event.get("body") or "{}")
        transport_mode = body.get("transportMode")
        avoid_congestion = body.get("avoidCongestion")

        result = table.update_item(
            Key={"userId": user_id},
            UpdateExpression="""
                SET preferences.transportMode = :tm,
                    preferences.avoidCongestion = :ac,
                    updatedAt = :ua
            """,
            ExpressionAttributeValues={
                ":tm": transport_mode,
                ":ac": avoid_congestion,
                ":ua": datetime.now(timezone.utc).isoformat(),
            },
            ReturnValues="ALL_NEW",
        )

        return response(200, {
            "message": "Preferences updated",
            "user": result.get("Attributes", {})
        })

    except Exception as e:
        return response(500, {
            "message": "Internal server error",
            "error": str(e)
        })