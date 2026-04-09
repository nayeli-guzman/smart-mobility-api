import os
import boto3
from decimal import Decimal
from collections import defaultdict
from datetime import datetime, timezone

from src.utils.response import json_response

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
                    "activeUsers": 0,
                    "activeVehicles": 0,
                    "zonesMonitored": 0,
                    "highCongestionZones": [],
                    "topZonesByEvents": []
                }
            )

        unique_users = set()
        unique_vehicles = set()
        zone_stats = defaultdict(lambda: {
            "events": 0,
            "speed_sum": 0.0
        })

        for raw_item in items:
            item = decimal_to_native(raw_item)

            user_id = item.get("userId")
            vehicle_id = item.get("vehicleId")
            zone_id = item.get("zoneId", "unknown")
            speed = float(item.get("speed", 0))

            if user_id:
                unique_users.add(user_id)

            if vehicle_id:
                unique_vehicles.add(vehicle_id)

            zone_stats[zone_id]["events"] += 1
            zone_stats[zone_id]["speed_sum"] += speed

        high_congestion_zones = []
        top_zones = []

        for zone_id, data in zone_stats.items():
            avg_speed = data["speed_sum"] / data["events"]
            congestion = classify_congestion(avg_speed)

            if congestion == "HIGH":
                high_congestion_zones.append(zone_id)

            top_zones.append({
                "zoneId": zone_id,
                "events": data["events"]
            })

        top_zones.sort(key=lambda z: (-z["events"], z["zoneId"]))

        return json_response(
            200,
            {
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "totalEvents": len(items),
                "activeUsers": len(unique_users),
                "activeVehicles": len(unique_vehicles),
                "zonesMonitored": len(zone_stats),
                "highCongestionZones": sorted(high_congestion_zones),
                "topZonesByEvents": top_zones[:5]
            }
        )

    except Exception as e:
        print(f"Error generating admin summary: {str(e)}")
        return json_response(
            500,
            {"message": "Internal server error"}
        )