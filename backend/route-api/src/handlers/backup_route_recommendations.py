import json
import os
from datetime import datetime, timezone
from decimal import Decimal

import boto3

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

table = dynamodb.Table(os.environ["ROUTE_RECOMMENDATIONS_TABLE"])
bucket_name = os.environ["ROUTE_BACKUPS_BUCKET"]


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def scan_all_items():
    items = []
    response = table.scan()
    items.extend(response.get("Items", []))

    while "LastEvaluatedKey" in response:
        response = table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response.get("Items", []))

    return items


def handler(event, context):
    try:
        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )

        requester = claims.get("email") or claims.get("sub") or "eventbridge-scheduler"

        items = scan_all_items()
        now = datetime.now(timezone.utc).isoformat()

        backup_payload = {
            "backupType": "route-recommendations",
            "createdAt": now,
            "createdBy": requester,
            "count": len(items),
            "items": items,
        }

        file_key = f"route-recommendations/backup-{now}.json"

        s3.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=json.dumps(backup_payload, cls=DecimalEncoder, indent=2),
            ContentType="application/json",
        )

        return json_response(201, {
            "message": "Route recommendations backup created successfully",
            "bucket": bucket_name,
            "key": file_key,
            "count": len(items),
        })

    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {
            "message": "Internal server error"
        })