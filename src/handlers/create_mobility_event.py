import json
import os
import uuid
from datetime import datetime, timezone

import boto3

from src.lib.dynamo import get_table

lambda_client = boto3.client("lambda")


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        user_id = body.get("userId")
        zone_id = body.get("zoneId")
        vehicle_id = body.get("vehicleId")
        speed = body.get("speed")
        congestion_level = body.get("congestionLevel")
        timestamp = body.get("timestamp")

        if not user_id or not zone_id or not timestamp:
            return response(400, {
                "message": "userId, zoneId y timestamp son obligatorios"
            })

        item = {
            "eventId": str(uuid.uuid4()),
            "userId": user_id,
            "zoneId": zone_id,
            "vehicleId": vehicle_id,
            "speed": speed,
            "congestionLevel": congestion_level if congestion_level is not None else 0,
            "timestamp": timestamp,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }

        print(f"Saving mobility event: {json.dumps(item)}")

        events_table = get_table(os.environ["MOBILITY_EVENTS_TABLE"])
        events_table.put_item(Item=item)

        lambda_client.invoke(
            FunctionName=os.environ["AGGREGATE_FUNCTION_NAME"],
            InvocationType="Event",
            Payload=json.dumps(item).encode("utf-8")
        )

        return response(201, {
            "message": "Evento creado",
            "eventId": item["eventId"]
        })

    except Exception as exc:
        print(f"create_mobility_event error: {str(exc)}")
        return response(500, {
            "message": "Internal server error"
        })