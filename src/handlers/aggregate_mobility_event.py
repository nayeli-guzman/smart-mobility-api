import json
import os
from datetime import datetime, timezone
from decimal import Decimal

from src.lib.dynamo import get_table


def _to_decimal(value):
    if value is None:
        return Decimal("0")
    return Decimal(str(value))


def handler(event, context):
    try:
        print(f"aggregate_mobility_event input: {json.dumps(event)}")

        zone_id = event.get("zoneId")
        if not zone_id:
            raise ValueError("zoneId is required in aggregate event")

        summary_key = f"ZONE#{zone_id}"
        summary_table = get_table(os.environ["SUMMARY_TABLE"])

        result = summary_table.get_item(Key={"summaryKey": summary_key})
        current = result.get("Item", {
            "summaryKey": summary_key,
            "zoneId": zone_id,
            "totalEvents": 0,
            "totalCongestion": Decimal("0"),
            "avgCongestion": Decimal("0"),
            "updatedAt": None
        })

        current_total_events = int(current.get("totalEvents", 0))
        current_total_congestion = _to_decimal(current.get("totalCongestion", 0))
        new_congestion = _to_decimal(event.get("congestionLevel", 0))

        next_total_events = current_total_events + 1
        next_total_congestion = current_total_congestion + new_congestion
        next_avg = next_total_congestion / Decimal(str(next_total_events))

        updated_item = {
            "summaryKey": summary_key,
            "zoneId": zone_id,
            "totalEvents": next_total_events,
            "totalCongestion": next_total_congestion,
            "avgCongestion": next_avg,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }

        summary_table.put_item(Item=updated_item)

        print(f"Summary updated: {updated_item}")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Summary updated",
                "zoneId": zone_id
            })
        }

    except Exception as exc:
        print(f"aggregate_mobility_event error: {str(exc)}")
        raise