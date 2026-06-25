from constance import config
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response


@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def platform_settings(request):
    fields = {
        'PLATFORM_COMMISSION': {'value': config.PLATFORM_COMMISSION, 'type': 'int', 'label': 'Platform commission %'},
        'MINIMUM_WITHDRAWAL': {'value': config.MINIMUM_WITHDRAWAL, 'type': 'int', 'label': 'Min withdrawal (UZS)'},
        'MAXIMUM_WITHDRAWAL': {'value': config.MAXIMUM_WITHDRAWAL, 'type': 'int', 'label': 'Max withdrawal (UZS)'},
        'NEW_USER_BONUS': {'value': config.NEW_USER_BONUS, 'type': 'int', 'label': 'New user bonus (UZS)'},
        'FREE_ORDERS_PER_DAY': {'value': config.FREE_ORDERS_PER_DAY, 'type': 'int', 'label': 'Free orders/day'},
        'ORDER_CANCELLATION_TIME': {'value': config.ORDER_CANCELLATION_TIME, 'type': 'int', 'label': 'Cancel time (min)'},
        'MASTER_VERIFICATION_REQUIRED': {'value': config.MASTER_VERIFICATION_REQUIRED, 'type': 'bool', 'label': 'Require master verification'},
        'MAINTENANCE_MODE': {'value': config.MAINTENANCE_MODE, 'type': 'bool', 'label': 'Maintenance mode'},
        'EMERGENCY_CONTACT': {'value': config.EMERGENCY_CONTACT, 'type': 'str', 'label': 'Emergency contact'},
    }

    if request.method == 'GET':
        return Response(fields)

    data = request.data
    from constance.admin import ConstanceAdmin
    from constance import settings as constance_settings
    for key, value in data.items():
        if key in fields:
            setattr(config, key, value)
    return Response(fields)
