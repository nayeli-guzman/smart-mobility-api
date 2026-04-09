import os
import boto3

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

        if not requested_user_id:
            return json_response(400, {"message": "userId is required"})

        if token_user_id != requested_user_id:
            return json_response(403, {"message": "Forbidden"})

        response = table.get_item(Key={"userId": requested_user_id})
        item = response.get("Item")

        if not item:
            return json_response(404, {"message": "User not found"})

        return json_response(200, item)

    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return json_response(500, {"message": "Internal server error"})