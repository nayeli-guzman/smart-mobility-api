import boto3

dynamodb = boto3.resource("dynamodb")


def get_table(table_name: str):
    return dynamodb.Table(table_name)