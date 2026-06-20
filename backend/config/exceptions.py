import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import IntegrityError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        errors = []
        if isinstance(response.data, dict):
            for field, messages in response.data.items():
                if isinstance(messages, list):
                    for message in messages:
                        errors.append({
                            'field': field,
                            'message': str(message),
                        })
                else:
                    errors.append({
                        'field': field,
                        'message': str(messages),
                    })
        elif isinstance(response.data, list):
            for message in response.data:
                errors.append({
                    'field': None,
                    'message': str(message),
                })

        response.data = {
            'success': False,
            'status_code': response.status_code,
            'errors': errors,
        }
        return response

    if isinstance(exc, ValidationError):
        return Response({
            'success': False,
            'status_code': status.HTTP_400_BAD_REQUEST,
            'errors': [{'field': None, 'message': str(exc)}],
        }, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, ObjectDoesNotExist):
        return Response({
            'success': False,
            'status_code': status.HTTP_404_NOT_FOUND,
            'errors': [{'field': None, 'message': 'Object not found.'}],
        }, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, IntegrityError):
        return Response({
            'success': False,
            'status_code': status.HTTP_409_CONFLICT,
            'errors': [{'field': None, 'message': 'Resource already exists.'}],
        }, status=status.HTTP_409_CONFLICT)

    logger.error(f'Unhandled exception: {exc}', exc_info=True)
    return Response({
        'success': False,
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'errors': [{'field': None, 'message': 'Internal server error.'}],
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
