from src.utils.response import json_response


def extract_claims(event):
    return (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )


def normalize_groups(groups_claim):
    if not groups_claim:
        return []

    if isinstance(groups_claim, list):
        return groups_claim

    if isinstance(groups_claim, str):
        return [group.strip() for group in groups_claim.split(",") if group.strip()]

    return []


def require_admin(event):
    claims = extract_claims(event)
    groups = normalize_groups(claims.get("cognito:groups"))

    if "admin" not in groups:
        return json_response(
            403,
            {
                "message": "Forbidden. Admin role required."
            }
        )

    return None