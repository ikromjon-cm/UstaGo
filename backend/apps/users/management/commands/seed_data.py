from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.categories.models import Category, Service

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed initial data for development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                phone='+998901234567',
                full_name='Admin',
                password='admin123',
            )
            self.stdout.write(self.style.SUCCESS('Super admin created: +998901234567 / admin123'))

        categories_data = [
            {'uz': 'Santexnik', 'ru': 'Сантехник', 'en': 'Plumber', 'icon': 'plumbing'},
            {'uz': 'Elektrik', 'ru': 'Электрик', 'en': 'Electrician', 'icon': 'electric'},
            {'uz': 'Tozalash', 'ru': 'Уборка', 'en': 'Cleaning', 'icon': 'cleaning'},
            {'uz': 'Ta\'mirlash', 'ru': 'Ремонт', 'en': 'Repair', 'icon': 'repair'},
            {'uz': 'Qurilish', 'ru': 'Строительство', 'en': 'Construction', 'icon': 'construction'},
            {'uz': 'Ko\'chirish', 'ru': 'Перевозка', 'en': 'Moving', 'icon': 'moving'},
            {'uz': 'Go\'zallik', 'ru': 'Красота', 'en': 'Beauty', 'icon': 'beauty'},
            {'uz': 'Konditsioner', 'ru': 'Кондиционер', 'en': 'AC Service', 'icon': 'ac'},
            {'uz': "Bog'bonlik", 'ru': 'Садоводство', 'en': 'Gardening', 'icon': 'garden'},
            {'uz': 'Uy hayvonlari', 'ru': 'Домашние животные', 'en': 'Pets', 'icon': 'pets'},
            {'uz': 'O\'qituvchi', 'ru': 'Репетитор', 'en': 'Tutor', 'icon': 'tutor'},
            {'uz': 'Shifokor', 'ru': 'Врач', 'en': 'Doctor', 'icon': 'doctor'},
        ]

        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                title_uz=cat_data['uz'],
                defaults={
                    'title_ru': cat_data['ru'],
                    'title_en': cat_data['en'],
                    'icon': cat_data['icon'],
                    'is_active': True,
                    'is_featured': True,
                }
            )
            if created:
                self.stdout.write(f'  Created category: {cat.title_uz}')

        self.stdout.write(self.style.SUCCESS(f'Seeding complete. Categories: {Category.objects.count()}'))
