import base64
import json
import os

import boto3
from boto3.dynamodb.conditions import Key

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROUTE_RECOMMENDATIONS_TABLE"])
index_name = os.environ["USER_ID_CREATED_AT_INDEX"]


def encode_next_token(last_evaluated_key):
    if not last_evaluated_key:
        return None
    return base64.b64encode(
        json.dumps(last_evaluated_key).encode("utf-8")
    ).decode("utf-8")


def decode_next_token(next_token):
    if not next_token:
        return None
    return json.loads(
        base64.b64decode(next_token.encode("utf-8")).decode("utf-8")
    )


def handler(event, context):
    try:
        path_params = event.get("pathParameters", {}) or {}
        query_params = event.get("queryStringParameters", {}) or {}

        requested_user_id = path_params.get("userId")
        limit = int(query_params.get("limit", "10"))
        next_token = query_params.get("nextToken")

        if limit < 1:
            limit = 1
        if limit > 50:
            limit = 50

        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )
        authenticated_user_id = claims.get("sub")

        if not requested_user_id:
            return json_response(400, {
                "message": "userId is required"
            })

        if requested_user_id != authenticated_user_id:
            return json_response(403, {
                "message": "You are not allowed to access this user's history"
            })

        query_kwargs = {
            "IndexName": index_name,
            "KeyConditionExpression": Key("userId").eq(requested_user_id),
            "ScanIndexForward": False,
            "Limit": limit
        }

        exclusive_start_key = decode_next_token(next_token)
        if exclusive_start_key:
            query_kwargs["ExclusiveStartKey"] = exclusive_start_key

        response = table.query(**query_kwargs)

        items = response.get("Items", [])
        outgoing_next_token = encode_next_token(
            response.get("LastEvaluatedKey")
        )

        return json_response(200, {
            "items": items,
            "count": len(items),
            "limit": limit,
            "nextToken": outgoing_next_token
        })

    except ValueError:
        return json_response(400, {
            "message": "limit must be a valid integer"
        })
    except Exception as e:
        print("ERROR:", str(e))
        return json_response(500, {
            "message": "Internal server error"
        })