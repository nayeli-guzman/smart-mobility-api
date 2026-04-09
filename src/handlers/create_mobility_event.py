import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["MOBILITY_EVENTS_TABLE"])


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body)
    }


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        zone_id = body.get("zoneId")
        vehicle_id = body.get("vehicleId")
        speed = body.get("speed")
        congestion_level = body.get("congestionLevel")
        timestamp = body.get("timestamp")

        if not zone_id or not timestamp:
            return response(400, {
                "message": "zoneId y timestamp son obligatorios"
            })

        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )

        user_id = claims.get("sub")
        email = claims.get("email")

        item = {
            "eventId": str(uuid.uuid4()),
            "userId": user_id,
            "email": email,
            "zoneId": zone_id,
            "vehicleId": vehicle_id,
            "speed": speed,
            "congestionLevel": congestion_level,
            "timestamp": timestamp,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }

        print("Saving event:", json.dumps(item))

        table.put_item(Item=item)

        return response(201, {
            "message": "Evento creado correctamente",
            "eventId": item["eventId"]
        })

    except json.JSONDecodeError:
        return response(400, {"message": "JSON inválido"})

    except Exception as e:
        print("ERROR:", str(e))
        return response(500, {"message": "Internal server error"})