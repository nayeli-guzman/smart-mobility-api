import json
import os
from decimal import Decimal

from src.lib.dynamo import get_table


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


def response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }


def handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        zone_id = query_params.get("zoneId")

        if not zone_id:
            return response(400, {
                "message": "zoneId es obligatorio"
            })

        summary_key = f"ZONE#{zone_id}"
        summary_table = get_table(os.environ["SUMMARY_TABLE"])

        result = summary_table.get_item(Key={"summaryKey": summary_key})
        item = result.get("Item")

        if not item:
            return response(200, {
                "summaryKey": summary_key,
                "zoneId": zone_id,
                "totalEvents": 0,
                "avgCongestion": 0
            })

        return response(200, item)

    except Exception as exc:
        print(f"get_summary error: {str(exc)}")
        return response(500, {
            "message": "Internal server error"
        })