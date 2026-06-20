import time
import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

logger = logging.getLogger(__name__)


class RequestLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        request.request_id = f'{int(time.time())}_{id(request)}'

    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            if duration > 1:
                logger.warning(
                    f'Slow request: {request.method} {request.path} '
                    f'duration={duration:.2f}s '
                    f'user={request.user.id if request.user.is_authenticated else "anonymous"}'
                )
            response['X-Request-ID'] = getattr(request, 'request_id', '')
            response['X-Duration-MS'] = str(int(duration * 1000))
        return response


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            from django.core.cache import cache
            key = f'metrics:endpoint:{request.method}:{request.path}'
            data = cache.get(key, {'count': 0, 'total_time': 0, 'max_time': 0})
            data['count'] += 1
            data['total_time'] += duration
            data['max_time'] = max(data['max_time'], duration)
            data['avg_time'] = data['total_time'] / data['count']
            cache.set(key, data, timeout=3600)
        return response


class DeviceTrackingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        request.device_info = {
            'user_agent': user_agent,
            'ip': self.get_client_ip(request),
            'device_type': self.get_device_type(user_agent),
        }

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')

    def get_device_type(self, user_agent):
        if not user_agent:
            return 'unknown'
        ua = user_agent.lower()
        if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
            return 'mobile'
        if 'tablet' in ua or 'ipad' in ua:
            return 'tablet'
        return 'desktop'
