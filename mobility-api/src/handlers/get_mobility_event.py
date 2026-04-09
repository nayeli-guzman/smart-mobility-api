import os

import boto3

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["MOBILITY_EVENTS_TABLE"])


def handler(event, context):
    try:
        path_params = event.get("pathParameters") or {}
        event_id = path_params.get("eventId")

        if not event_id:
            return json_response(400, {"message": "eventId es obligatorio"})

        result = table.get_item(
            Key={"eventId": event_id}
        )

        item = result.get("Item")
        if not item:
            return json_response(404, {"message": "Evento no encontrado"})

        return json_response(200, item)

    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {"message": "Internal server error"})