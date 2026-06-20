import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Order


class OrderTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'order_{self.order_id}'
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()
        order = await self.get_order()
        if order:
            await self.send(text_data=json.dumps({
                'type': 'order_status',
                'order_id': str(order.id),
                'status': order.status,
                'master_location': {
                    'lat': float(order.master.latitude) if order.master and order.master.latitude else None,
                    'lng': float(order.master.longitude) if order.master and order.master.longitude else None,
                } if order.master else None,
                'customer_location': {
                    'lat': float(order.latitude),
                    'lng': float(order.longitude),
                },
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'location_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'lat': data['lat'],
                    'lng': data['lng'],
                    'user_id': self.scope['user'].id,
                }
            )

    async def location_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'lat': event['lat'],
            'lng': event['lng'],
            'user_id': event['user_id'],
        }))

    async def order_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'status': event['status'],
            'message': event.get('message', ''),
        }))

    @database_sync_to_async
    def get_order(self):
        try:
            return Order.objects.select_related('master__user', 'customer').get(id=self.order_id)
        except Order.DoesNotExist:
            return None
