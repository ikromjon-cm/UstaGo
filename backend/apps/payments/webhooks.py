import hashlib
import json
import hmac
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from django.utils import timezone
from .models import Payment
from .services import PaymentService


@csrf_exempt
@require_POST
def payme_webhook(request):
    try:
        body = json.loads(request.body)
        method = body.get('method')
        params = body.get('params', {})

        if method == 'CheckPerformTransaction':
            payment_id = params.get('account', {}).get('payment_id')
            amount = params.get('amount', 0)
            try:
                payment = Payment.objects.get(id=payment_id)
                return JsonResponse({'result': {'allow': True}})
            except Payment.DoesNotExist:
                return JsonResponse({'error': {'code': -31050, 'message': 'Payment not found'}}, status=200)

        elif method == 'CreateTransaction':
            payment_id = params.get('account', {}).get('payment_id')
            trans_id = params.get('id')
            time_str = params.get('time')
            try:
                payment = Payment.objects.get(id=payment_id)
                payment.transaction_id = trans_id
                payment.status = Payment.Status.PROCESSING
                payment.save()
                return JsonResponse({
                    'result': {
                        'create_time': int(timezone.now().timestamp() * 1000),
                        'transaction': str(payment.id),
                        'state': 1,
                    }
                })
            except Payment.DoesNotExist:
                return JsonResponse({'error': {'code': -31050, 'message': 'Payment not found'}}, status=200)

        elif method == 'PerformTransaction':
            trans_id = params.get('id')
            try:
                payment = Payment.objects.get(transaction_id=trans_id)
                payment.status = Payment.Status.HELD
                payment.paid_at = timezone.now()
                payment.save()
                return JsonResponse({
                    'result': {
                        'transaction': str(payment.id),
                        'perform_time': int(timezone.now().timestamp() * 1000),
                        'state': 2,
                    }
                })
            except Payment.DoesNotExist:
                return JsonResponse({'error': {'code': -31050, 'message': 'Transaction not found'}}, status=200)

        elif method == 'CancelTransaction':
            trans_id = params.get('id')
            reason = params.get('reason', 1)
            try:
                payment = Payment.objects.get(transaction_id=trans_id)
                payment.status = Payment.Status.CANCELLED
                payment.metadata['cancel_reason'] = reason
                payment.save()
                return JsonResponse({
                    'result': {
                        'transaction': str(payment.id),
                        'cancel_time': int(timezone.now().timestamp() * 1000),
                        'state': -1,
                    }
                })
            except Payment.DoesNotExist:
                return JsonResponse({'error': {'code': -31050, 'message': 'Transaction not found'}}, status=200)

        return JsonResponse({'error': {'code': -32000, 'message': 'Unknown method'}}, status=200)
    except Exception as e:
        return JsonResponse({'error': {'code': -32400, 'message': str(e)}}, status=200)


@csrf_exempt
@require_POST
def click_webhook(request):
    try:
        body = json.loads(request.body)
        payment_id = body.get('payment_id') or body.get('merchant_trans_id')
        trans_id = body.get('click_trans_id')
        sign_string = body.get('sign_string', '')
        amount = body.get('amount', '0')
        action = body.get('action', '0')
        sign_time = body.get('sign_time', '')

        expected_sign = hashlib.md5(
            f"{trans_id}{sign_time}{payment_id}{body.get('merchant_prepare_id', '')}{action}{amount}{settings.CLICK_SECRET_KEY}".encode()
        ).hexdigest()

        if sign_string != expected_sign and settings.CLICK_SECRET_KEY:
            return JsonResponse({'error': -1, 'error_note': 'Invalid sign'})

        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return JsonResponse({'error': -5, 'error_note': 'Payment not found'})

        if action == '0':
            if payment.status != Payment.Status.PENDING:
                return JsonResponse({'error': -4, 'error_note': 'Already paid'})
            payment.status = Payment.Status.PROCESSING
            payment.transaction_id = trans_id
            payment.save()
            return JsonResponse({
                'click_trans_id': trans_id,
                'merchant_trans_id': payment_id,
                'merant_confirm_id': str(payment.id),
            })

        elif action == '1':
            payment.status = Payment.Status.HELD
            payment.paid_at = timezone.now()
            payment.save()
            return JsonResponse({
                'click_trans_id': trans_id,
                'merchant_trans_id': payment_id,
                'merchant_confirm_id': str(payment.id),
            })

        return JsonResponse({'error': -2, 'error_note': 'Action not supported'})
    except Exception as e:
        return JsonResponse({'error': -9, 'error_note': str(e)})


@csrf_exempt
@require_POST
def uzum_webhook(request):
    try:
        body = json.loads(request.body)
        payment_id = body.get('account', {}).get('payment_id') or body.get('order_id')
        trans_id = body.get('trans_id') or body.get('id')
        status = body.get('status', '')
        amount = body.get('amount', 0)

        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return JsonResponse({'error': {'code': 'NOT_FOUND', 'message': 'Payment not found'}}, status=404)

        if status == 'paid' or status == 'confirmed':
            payment.status = Payment.Status.HELD
            payment.transaction_id = trans_id
            payment.paid_at = timezone.now()
            payment.save()
        elif status == 'cancelled' or status == 'failed':
            payment.status = Payment.Status.FAILED
            payment.save()

        return JsonResponse({'result': {'status': 'ok'}})
    except Exception as e:
        return JsonResponse({'error': {'code': 'ERROR', 'message': str(e)}}, status=500)
