import json
import os
import random
import uuid
from datetime import datetime, timezone
from urllib import request, error

API_MOBILITY_URL = os.environ["API_MOBILITY_URL"]

USERS = [
    {"userId": "user-001", "email": "user1@example.com"},
    {"userId": "user-002", "email": "user2@example.com"},
    {"userId": "user-003", "email": "user3@example.com"},
]

ZONES = ["zone-a", "zone-b", "zone-c", "zone-d", "zone-e"]
VEHICLES = [f"vehicle-{i:03d}" for i in range(1, 11)]


def infer_congestion(speed: int) -> str:
    if speed < 20:
        return "HIGH"
    elif speed < 50:
        return "MEDIUM"
    return "LOW"


def build_event():
    user = random.choice(USERS)
    speed = random.randint(0, 120)
    now = datetime.now(timezone.utc).isoformat()

    return {
        "eventId": str(uuid.uuid4()),
        "userId": user["userId"],
        "email": user["email"],
        "zoneId": random.choice(ZONES),
        "vehicleId": random.choice(VEHICLES),
        "speed": speed,
        "congestionLevel": infer_congestion(speed),
        "timestamp": now,
        "createdAt": now
    }


def post_event(item: dict):
    data = json.dumps(item).encode("utf-8")

    req = request.Request(
        API_MOBILITY_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8")
        return resp.status, body


def lambda_handler(event, context):
    events_per_run = int(os.environ.get("EVENTS_PER_RUN", "10"))

    results = {
        "sent": 0,
        "failed": 0,
        "details": []
    }

    for _ in range(events_per_run):
        item = build_event()

        try:
            status, body = post_event(item)
            results["sent"] += 1
            results["details"].append({
                "eventId": item["eventId"],
                "status": status,
                "response": body[:200]
            })

            print(json.dumps({
                "level": "INFO",
                "message": "event_sent",
                "eventId": item["eventId"],
                "vehicleId": item["vehicleId"],
                "zoneId": item["zoneId"],
                "status": status
            }))

        except error.HTTPError as e:
            results["failed"] += 1
            print(json.dumps({
                "level": "ERROR",
                "message": "http_error",
                "eventId": item["eventId"],
                "status": e.code,
                "reason": str(e.reason)
            }))

        except Exception as e:
            results["failed"] += 1
            print(json.dumps({
                "level": "ERROR",
                "message": "unexpected_error",
                "eventId": item["eventId"],
                "error": str(e)
            }))

    return {
        "statusCode": 200,
        "body": json.dumps(results)
    }