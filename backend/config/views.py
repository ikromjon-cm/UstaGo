import os
import subprocess
from django.conf import settings
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from datetime import datetime


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'UstaGo API',
        'version': '1.0.0',
        'description': "Uzbekistan's largest service marketplace platform",
        'documentation': request.build_absolute_uri('/api/v1/docs/'),
        'schema': request.build_absolute_uri('/api/v1/schema/'),
        'health': request.build_absolute_uri('/api/v1/health/'),
        'endpoints': {
            'auth': '/api/v1/auth/',
            'categories': '/api/v1/categories/',
            'orders': '/api/v1/orders/',
            'payments': '/api/v1/payments/',
            'reviews': '/api/v1/reviews/',
            'chat': '/api/v1/chat/',
            'notifications': '/api/v1/notifications/',
            'analytics': '/api/v1/analytics/',
            'ai': '/api/v1/ai/',
        },
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    db_status = 'ok'
    cache_status = 'ok'
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except Exception as e:
        db_status = str(e)
    try:
        cache.set('health_check', 'ok', 5)
        if cache.get('health_check') != 'ok':
            cache_status = 'cache_miss'
    except Exception as e:
        cache_status = str(e)
    all_ok = db_status == 'ok' and cache_status == 'ok'
    status_code = 200 if all_ok else 503
    return Response({
        'status': 'healthy' if all_ok else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'database': db_status,
        'cache': cache_status,
        'disk_usage': get_disk_usage(),
    }, status=status_code)


def get_disk_usage():
    try:
        stat = os.statvfs(settings.BASE_DIR)
        total = stat.f_frsize * stat.f_blocks
        free = stat.f_frsize * stat.f_bfree
        used = total - free
        return {
            'total_gb': round(total / (1024**3), 2),
            'used_gb': round(used / (1024**3), 2),
            'free_gb': round(free / (1024**3), 2),
            'percent_used': round((used / total) * 100, 1),
        }
    except Exception:
        return {'error': 'disk_usage_unavailable'}


@api_view(['GET'])
@permission_classes([AllowAny])
def metrics_view(request):
    return Response(
        generate_latest(),
        content_type=CONTENT_TYPE_LATEST,
    )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def backup_database(request):
    db_settings = settings.DATABASES['default']
    db_name = db_settings['NAME']
    db_user = db_settings['USER']
    db_password = db_settings['PASSWORD']
    db_host = db_settings.get('HOST', 'localhost')
    db_port = db_settings.get('PORT', '5432')
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'ustago_backup_{timestamp}.sql'
    filepath = os.path.join(backup_dir, filename)
    try:
        os.environ['PGPASSWORD'] = db_password
        result = subprocess.run(
            ['pg_dump', '-h', db_host, '-p', str(db_port), '-U', db_user, '-d', db_name, '-f', filepath],
            capture_output=True, text=True, timeout=300,
        )
        file_size = os.path.getsize(filepath)
        return Response({
            'success': True,
            'filename': filename,
            'size_bytes': file_size,
            'path': filepath,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def restore_database(request):
    db_settings = settings.DATABASES['default']
    db_name = db_settings['NAME']
    db_user = db_settings['USER']
    db_password = db_settings['PASSWORD']
    db_host = db_settings.get('HOST', 'localhost')
    db_port = db_settings.get('PORT', '5432')
    filename = request.data.get('filename')
    if not filename:
        return Response({'error': 'filename required'}, status=400)
    filepath = os.path.join(settings.BASE_DIR, 'backups', filename)
    if not os.path.exists(filepath):
        return Response({'error': 'backup file not found'}, status=404)
    try:
        os.environ['PGPASSWORD'] = db_password
        result = subprocess.run(
            ['psql', '-h', db_host, '-p', str(db_port), '-U', db_user, '-d', db_name, '-f', filepath],
            capture_output=True, text=True, timeout=600,
        )
        return Response({
            'success': True,
            'message': 'Database restored successfully',
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
        }, status=500)
