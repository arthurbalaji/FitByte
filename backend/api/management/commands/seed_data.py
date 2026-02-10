from django.core.management.base import BaseCommand
from api.models import ClothingType, Fabric, FabricColor, Pattern, MeasurementField


class Command(BaseCommand):
    help = 'Seed database with initial data for clothing types, fabrics, colors, patterns, and measurement fields'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # ── Clothing Types ──
        clothing_data = {
            'male': ['Shirt', 'Pant', 'Kurta', 'Suit', 'Blazer', 'Sherwani'],
            'female': ['Blouse', 'Salwar', 'Lehenga', 'Dress', 'Kurti', 'Saree Blouse'],
            'kids': ['School Uniform', 'Casual Wear', 'Party Wear', 'Ethnic Wear'],
        }
        for gender, types in clothing_data.items():
            for name in types:
                ClothingType.objects.get_or_create(name=name, gender=gender)
        self.stdout.write(self.style.SUCCESS('  ✓ Clothing types seeded'))

        # ── Fabrics ──
        fabrics = ['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Chiffon', 'Georgette', 'Velvet', 'Denim', 'Satin']
        for name in fabrics:
            Fabric.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS('  ✓ Fabrics seeded'))

        # ── Colors ──
        colors = [
            ('White', '#FFFFFF'), ('Black', '#000000'), ('Navy Blue', '#000080'),
            ('Red', '#FF0000'), ('Maroon', '#800000'), ('Green', '#008000'),
            ('Beige', '#F5F5DC'), ('Grey', '#808080'), ('Pink', '#FFC0CB'),
            ('Sky Blue', '#87CEEB'), ('Cream', '#FFFDD0'), ('Brown', '#8B4513'),
            ('Yellow', '#FFD700'), ('Purple', '#800080'), ('Olive', '#808000'),
        ]
        for name, hex_code in colors:
            FabricColor.objects.get_or_create(name=name, defaults={'hex_code': hex_code})
        self.stdout.write(self.style.SUCCESS('  ✓ Colors seeded'))

        # ── Patterns ──
        patterns = ['Plain', 'Checks', 'Stripes', 'Polka Dots', 'Floral', 'Paisley', 'Abstract', 'Solid']
        for name in patterns:
            Pattern.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS('  ✓ Patterns seeded'))

        # ── Measurement Fields ──
        upper_body = ['Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Full Length', 'Neck']
        lower_body = ['Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh', 'Full Length']
        full_body = ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Full Length', 'Neck']

        measurement_map = {
            # Male
            'Shirt': upper_body,
            'Kurta': upper_body + ['Hip'],
            'Suit': full_body,
            'Blazer': upper_body,
            'Sherwani': full_body,
            'Pant': lower_body,
            # Female
            'Blouse': ['Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Full Length', 'Neck', 'Front Neck Depth'],
            'Salwar': lower_body,
            'Lehenga': ['Waist', 'Hip', 'Full Length'],
            'Dress': full_body,
            'Kurti': upper_body + ['Hip', 'Full Length'],
            'Saree Blouse': ['Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Full Length', 'Front Neck Depth', 'Back Neck Depth'],
            # Kids
            'School Uniform': ['Chest', 'Waist', 'Shoulder', 'Sleeve Length', 'Full Length'],
            'Casual Wear': ['Chest', 'Waist', 'Full Length'],
            'Party Wear': full_body,
            'Ethnic Wear': full_body,
        }

        for clothing_name, fields in measurement_map.items():
            clothing_types = ClothingType.objects.filter(name=clothing_name)
            for ct in clothing_types:
                for field in fields:
                    field_name = field.lower().replace(' ', '_')
                    MeasurementField.objects.get_or_create(
                        clothing_type=ct,
                        field_name=field_name,
                        defaults={
                            'field_label': field,
                            'unit': 'inches',
                            'is_required': True,
                        }
                    )
        self.stdout.write(self.style.SUCCESS('  ✓ Measurement fields seeded'))
        self.stdout.write(self.style.SUCCESS('Database seeding complete!'))
