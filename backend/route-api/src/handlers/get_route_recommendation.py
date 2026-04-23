import os

import boto3

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROUTE_RECOMMENDATIONS_TABLE"])


def handler(event, context):
    try:
        route_id = (
            event.get("pathParameters", {}) or {}
        ).get("routeId")

        if not route_id:
            return json_response(400, {
                "message": "routeId is required"
            })

        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )
        requester_user_id = claims.get("sub")

        response = table.get_item(
            Key={"routeId": route_id}
        )

        item = response.get("Item")
        if not item:
            return json_response(404, {
                "message": "Route recommendation not found"
            })

        if item.get("userId") != requester_user_id:
            return json_response(403, {
                "message": "You are not allowed to access this route"
            })

        return json_response(200, item)

    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {"message": "Internal server error"})