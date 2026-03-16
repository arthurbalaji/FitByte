from rest_framework import serializers
from .models import User, ClothingType, Fabric, FabricColor, Pattern, MeasurementField, SavedMeasurement, Address, Order, OrderStatusHistory, CartItem


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    role = serializers.ChoiceField(choices=['customer', 'admin'], default='customer')
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined', 'is_active']


class ClothingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClothingType
        fields = '__all__'


class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = '__all__'


class FabricColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FabricColor
        fields = '__all__'


class PatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pattern
        fields = '__all__'


class MeasurementFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementField
        fields = '__all__'


class SavedMeasurementSerializer(serializers.ModelSerializer):
    clothing_type_name = serializers.CharField(source='clothing_type.name', read_only=True)

    class Meta:
        model = SavedMeasurement
        fields = ['id', 'label', 'clothing_type', 'clothing_type_name', 'size_type',
                  'standard_size', 'measurements', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'label', 'address_type', 'full_name', 'phone', 
                  'address_line1', 'address_line2', 'city', 'state', 
                  'postal_code', 'country', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'changed_by', 'changed_by_name', 'notes', 'created_at']
        read_only_fields = ['created_at']

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}"
        return "System"


class OrderSerializer(serializers.ModelSerializer):
    clothing_type_name = serializers.CharField(source='clothing_type.name', read_only=True)
    fabric_name = serializers.CharField(source='fabric.name', read_only=True)
    fabric_color_name = serializers.CharField(source='fabric_color.name', read_only=True)
    fabric_color_hex = serializers.CharField(source='fabric_color.hex_code', read_only=True)
    pattern_name = serializers.CharField(source='pattern.name', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'checkout_group', 'user',
            'gender', 'clothing_type', 'clothing_type_name',
            'fabric', 'fabric_name', 'fabric_color', 'fabric_color_name', 'fabric_color_hex',
            'pattern', 'pattern_name',
            'size_type', 'standard_size', 'measurements',
            'fabric_source', 'delivery_address',
            'quantity', 'unit_price', 'total_price',
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'customer_notes', 'admin_notes',
            'created_at', 'updated_at', 'estimated_delivery', 'delivered_at',
            'customer_name', 'customer_email', 'status_history'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class OrderCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for order creation."""
    class Meta:
        model = Order
        fields = [
            'gender', 'clothing_type', 'fabric', 'fabric_color', 'pattern',
            'size_type', 'standard_size', 'measurements', 'fabric_source',
            'delivery_address', 'quantity', 'customer_notes'
        ]

    def create(self, validated_data):
        # Set default pricing (you can customize this based on clothing type/fabric)
        validated_data['unit_price'] = 1000  # Default price
        validated_data['total_price'] = validated_data.get('quantity', 1) * 1000
        return super().create(validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    clothing_type_name = serializers.CharField(source='clothing_type.name', read_only=True)
    fabric_name = serializers.CharField(source='fabric.name', read_only=True)
    fabric_color_name = serializers.CharField(source='fabric_color.name', read_only=True)
    fabric_color_hex = serializers.CharField(source='fabric_color.hex_code', read_only=True)
    pattern_name = serializers.CharField(source='pattern.name', read_only=True)
    unit_price = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'user', 'gender',
            'clothing_type', 'clothing_type_name',
            'fabric', 'fabric_name',
            'fabric_color', 'fabric_color_name', 'fabric_color_hex',
            'pattern', 'pattern_name',
            'size_type', 'standard_size', 'measurements',
            'fabric_source', 'quantity', 'customer_notes',
            'unit_price', 'total_price',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'user']

    def get_unit_price(self, obj):
        return 1000

    def get_total_price(self, obj):
        return obj.quantity * 1000
