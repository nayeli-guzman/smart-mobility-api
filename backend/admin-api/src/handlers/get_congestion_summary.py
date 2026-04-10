import os
import boto3
from decimal import Decimal
from collections import defaultdict
from datetime import datetime, timezone

from src.utils.response import json_response
from src.utils.auth import require_admin

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["MOBILITY_EVENTS_TABLE"])


def decimal_to_native(value):
    if isinstance(value, list):
        return [decimal_to_native(v) for v in value]
    if isinstance(value, dict):
        return {k: decimal_to_native(v) for k, v in value.items()}
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    return value


def classify_congestion(avg_speed: float) -> str:
    if avg_speed < 20:
        return "HIGH"
    if avg_speed < 50:
        return "MEDIUM"
    return "LOW"


def handler(event, context):

    auth_error = require_admin(event)
    if auth_error:
        return auth_error
    
    try:
        items = []
        scan_kwargs = {}

        while True:
            response = table.scan(**scan_kwargs)
            items.extend(response.get("Items", []))

            last_evaluated_key = response.get("LastEvaluatedKey")
            if not last_evaluated_key:
                break

            scan_kwargs["ExclusiveStartKey"] = last_evaluated_key

        if not items:
            return json_response(
                200,
                {
                    "generatedAt": datetime.now(timezone.utc).isoformat(),
                    "totalEvents": 0,
                    "zones": []
                }
            )

        grouped = defaultdict(lambda: {
            "events": 0,
            "speedSum": 0.0,
            "latestTimestamp": None,
            "uniqueVehicles": set()
        })

        for raw_item in items:
            item = decimal_to_native(raw_item)

            zone_id = item.get("zoneId", "unknown")
            speed = float(item.get("speed", 0))
            timestamp = item.get("timestamp")
            vehicle_id = item.get("vehicleId")

            grouped[zone_id]["events"] += 1
            grouped[zone_id]["speedSum"] += speed

            if vehicle_id:
                grouped[zone_id]["uniqueVehicles"].add(vehicle_id)

            if timestamp:
                current_latest = grouped[zone_id]["latestTimestamp"]
                if current_latest is None or timestamp > current_latest:
                    grouped[zone_id]["latestTimestamp"] = timestamp

        zones = []
        for zone_id, data in grouped.items():
            avg_speed = round(data["speedSum"] / data["events"], 2)

            zones.append({
                "zoneId": zone_id,
                "events": data["events"],
                "avgSpeed": avg_speed,
                "congestionLevel": classify_congestion(avg_speed),
                "activeVehicles": len(data["uniqueVehicles"]),
                "lastEventTimestamp": data["latestTimestamp"]
            })

        zones.sort(key=lambda z: (-z["events"], z["zoneId"]))

        return json_response(
            200,
            {
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "totalEvents": len(items),
                "zones": zones
            }
        )

    except Exception as e:
        print(f"Error generating congestion summary: {str(e)}")
        return json_response(
            500,
            {"message": "Internal server error"}
        )