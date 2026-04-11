import os
import json
import base64
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


def encode_next_token(last_evaluated_key):
    if not last_evaluated_key:
        return None
    raw = json.dumps(last_evaluated_key)
    return base64.b64encode(raw.encode("utf-8")).decode("utf-8")


def decode_next_token(token):
    if not token:
        return None
    raw = base64.b64decode(token.encode("utf-8")).decode("utf-8")
    return json.loads(raw)


def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}

        user_id = query_params.get("userId")
        zone_id = query_params.get("zoneId")
        vehicle_id = query_params.get("vehicleId")
        next_token = query_params.get("nextToken")

        limit = int(query_params.get("limit", "20"))

        if limit < 1:
            limit = 1
        if limit > 100:
            limit = 100

        exclusive_start_key = decode_next_token(next_token) if next_token else None

        filters_used = sum([
            1 if user_id else 0,
            1 if zone_id else 0,
            1 if vehicle_id else 0
        ])

        if filters_used > 1:
            return json_response(400, {
                "message": "Usa solo uno de estos filtros por solicitud: userId, zoneId o vehicleId"
            })

        query_args = {
            "Limit": limit,
            "ExclusiveStartKey": exclusive_start_key
        } if exclusive_start_key else {
            "Limit": limit
        }

        if user_id:
            result = table.query(
                IndexName=USER_INDEX,
                KeyConditionExpression=Key("userId").eq(user_id),
                ScanIndexForward=False,
                **query_args
            )

        elif zone_id:
            result = table.query(
                IndexName=ZONE_INDEX,
                KeyConditionExpression=Key("zoneId").eq(zone_id),
                ScanIndexForward=False,
                **query_args
            )

        elif vehicle_id:
            result = table.query(
                IndexName=VEHICLE_INDEX,
                KeyConditionExpression=Key("vehicleId").eq(vehicle_id),
                ScanIndexForward=False,
                **query_args
            )

        else:
            result = table.scan(**query_args)

        items = result.get("Items", [])
        last_evaluated_key = result.get("LastEvaluatedKey")

        return json_response(200, {
            "count": len(items),
            "items": normalize(items),
            "nextToken": encode_next_token(last_evaluated_key),
            "hasMore": last_evaluated_key is not None
        })

    except ValueError:
        return json_response(400, {"message": "limit debe ser numérico"})

    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {"message": "Internal server error"})