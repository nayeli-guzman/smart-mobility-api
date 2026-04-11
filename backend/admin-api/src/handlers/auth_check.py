import json

from src.utils.response import json_response


def get_claims(event):
    return (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )


def extract_groups(claims):
    groups = claims.get("cognito:groups", [])

    if isinstance(groups, list):
        return groups

    if isinstance(groups, str):
        value = groups.strip()

        if not value:
            return []

        if value.startswith("[") and value.endswith("]"):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed]
            except Exception:
                pass

        return [part.strip() for part in value.split(",") if part.strip()]

    return [str(groups).strip()]


def require_admin(event):
    claims = get_claims(event)
    groups = extract_groups(claims)

    print("AUTH CLAIMS:", json.dumps(claims))
    print("AUTH GROUPS:", json.dumps(groups))

    if "admin" not in groups:
        return json_response(
            403,
            {"message": "Forbidden. Admin role required."}
        )

    return None