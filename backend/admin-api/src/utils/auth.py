import json
from src.utils.response import json_response


def require_admin(event):
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )

    print("CLAIMS:", claims)

    raw_groups = claims.get("cognito:groups", [])
    print("RAW GROUPS:", raw_groups)

    groups = []

    if isinstance(raw_groups, list):
        groups = raw_groups

    elif isinstance(raw_groups, str):
        value = raw_groups.strip()

        if value.startswith("[") and value.endswith("]"):
            try:
                parsed = json.loads(value.replace("'", '"'))
                groups = parsed if isinstance(parsed, list) else [parsed]
            except Exception:
                # fallback manual
                value = value.strip("[]")
                groups = [g.strip() for g in value.split(",") if g.strip()]
        else:
            groups = [g.strip() for g in value.split(",") if g.strip()]

    print("PARSED GROUPS:", groups)

    if "admin" not in groups:
        return json_response(
            403,
            {"message": "Forbidden. Admin role required."}
        )


    return None