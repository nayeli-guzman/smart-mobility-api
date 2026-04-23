import json
import os
import uuid
from datetime import datetime, timezone

import boto3

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROUTE_RECOMMENDATIONS_TABLE"])


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        start_point = body.get("startPoint")
        end_point = body.get("endPoint")
        travel_mode = body.get("travelMode", "car")

        if not start_point or not end_point:
            return json_response(400, {
                "message": "startPoint and endPoint are required"
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
            "routeId": str(uuid.uuid4()),
            "userId": user_id,
            "email": email,
            "startPoint": start_point,
            "endPoint": end_point,
            "travelMode": travel_mode,
            "status": "saved",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }

        table.put_item(Item=item)

        return json_response(201, {
            "message": "Route recommendation created successfully",
            "routeId": item["routeId"],
            "data": item
        })

    except json.JSONDecodeError:
        return json_response(400, {"message": "Invalid JSON"})
    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {"message": "Internal server error"})