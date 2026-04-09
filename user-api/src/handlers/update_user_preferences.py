import json
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

        body = json.loads(event.get("body") or "{}")

        preferred_mode = body.get("preferredMode")
        avoid_congestion = body.get("avoidCongestion")

        if preferred_mode is None and avoid_congestion is None:
            return json_response(
                400,
                {"message": "At least one preference must be provided"}
            )

        now = datetime.now(timezone.utc).isoformat()

        expression_parts = []
        expression_values = {
            ":email": email,
            ":updatedAt": now
        }

        expression_parts.append("email = :email")
        expression_parts.append("updatedAt = :updatedAt")

        if preferred_mode is not None:
            expression_parts.append("preferredMode = :preferredMode")
            expression_values[":preferredMode"] = preferred_mode

        if avoid_congestion is not None:
            expression_parts.append("avoidCongestion = :avoidCongestion")
            expression_values[":avoidCongestion"] = avoid_congestion

        expression_parts.append("createdAt = if_not_exists(createdAt, :createdAt)")
        expression_values[":createdAt"] = now

        update_expression = "SET " + ", ".join(expression_parts)

        response = table.update_item(
            Key={"userId": requested_user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues="ALL_NEW"
        )

        return json_response(
            200,
            {
                "message": "User preferences updated successfully",
                "user": response.get("Attributes", {})
            }
        )

    except json.JSONDecodeError:
        return json_response(400, {"message": "Invalid JSON body"})
    except Exception as e:
        print(f"Error updating user preferences: {str(e)}")
        return json_response(500, {"message": "Internal server error"})