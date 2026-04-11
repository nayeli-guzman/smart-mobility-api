FROM public.ecr.aws/lambda/python:3.11

COPY handler.py ${LAMBDA_TASK_ROOT}

RUN pip install boto3 --target "${LAMBDA_TASK_ROOT}"

CMD ["handler.lambda_handler"]