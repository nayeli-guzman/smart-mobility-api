import os
import boto3
from datetime import datetime, timezone

from src.utils.response import json_response

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    try:
        path_params = event.get("pathParameters") or {}
        requested_user_id = path_params.get("userId")

        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("jwt", {})
            .get("claims", {})
        )

        token_user_id = claims.get("sub")
        email = claims.get("email")

        if not requested_user_id:
            return json_response(400, {"message": "userId is required"})

        if token_user_id != requested_user_id:
            return json_response(403, {"message": "Forbidden"})

        response = table.get_item(Key={"userId": requested_user_id})
        item = response.get("Item")

        if item:
            return json_response(200, item)

        now = datetime.now(timezone.utc).isoformat()

        new_user = {
            "userId": requested_user_id,
            "email": email,
            "preferredMode": None,
            "avoidCongestion": False,
            "createdAt": now,
            "updatedAt": now
        }

        table.put_item(Item=new_user)

        return json_response(200, new_user)

    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return json_response(500, {"message": "Internal server error"})