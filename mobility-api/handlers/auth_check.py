import json


def handler(event, context):
    jwt_context = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
    )

    claims = jwt_context.get("claims", {})
    scopes = jwt_context.get("scopes", [])

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "message": "Usuario autenticado correctamente",
            "user": {
                "sub": claims.get("sub"),
                "email": claims.get("email"),
                "username": claims.get("cognito:username")
            },
            "scopes": scopes
        })
    }