import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["MOBILITY_EVENTS_TABLE"])

USER_INDEX = os.environ["USER_ID_TIMESTAMP_INDEX"]
ZONE_INDEX = os.environ["ZONE_ID_TIMESTAMP_INDEX"]
VEHICLE_INDEX = os.environ["VEHICLE_ID_TIMESTAMP_INDEX"]


def normalize(item):
    if isinstance(item, list):
        return [normalize(x) for x in item]
    if isinstance(item, dict):
        return {k: normalize(v) for k, v in item.items()}
    if isinstance(item, Decimal):
        if item % 1 == 0:
            return int(item)
        return float(item)
    return item


def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}

        user_id = query_params.get("userId")
        zone_id = query_params.get("zoneId")
        vehicle_id = query_params.get("vehicleId")
        limit = int(query_params.get("limit", "20"))

        if limit < 1:
            limit = 1
        if limit > 100:
            limit = 100

        filters_used = sum([
            1 if user_id else 0,
            1 if zone_id else 0,
            1 if vehicle_id else 0
        ])

        if filters_used > 1:
            return json_response(400, {
                "message": "Usa solo uno de estos filtros por solicitud: userId, zoneId o vehicleId"
            })

        if user_id:
            result = table.query(
                IndexName=USER_INDEX,
                KeyConditionExpression=Key("userId").eq(user_id),
                ScanIndexForward=False,
                Limit=limit
            )
            items = result.get("Items", [])

        elif zone_id:
            result = table.query(
                IndexName=ZONE_INDEX,
                KeyConditionExpression=Key("zoneId").eq(zone_id),
                ScanIndexForward=False,
                Limit=limit
            )
            items = result.get("Items", [])

        elif vehicle_id:
            result = table.query(
                IndexName=VEHICLE_INDEX,
                KeyConditionExpression=Key("vehicleId").eq(vehicle_id),
                ScanIndexForward=False,
                Limit=limit
            )
            items = result.get("Items", [])

        else:
            result = table.scan(Limit=limit)
            items = result.get("Items", [])

        return json_response(200, {
            "count": len(items),
            "items": normalize(items)
        })

    except ValueError:
        return json_response(400, {"message": "limit debe ser numérico"})

    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {"message": "Internal server error"})