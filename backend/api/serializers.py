from rest_framework import serializers
from .models import User, ClothingType, Fabric, FabricColor, Pattern, MeasurementField, SavedMeasurement


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    role = serializers.ChoiceField(choices=['customer', 'tailor', 'admin'], default='customer')
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
