import jwt
import datetime
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User, ClothingType, Fabric, FabricColor, Pattern, MeasurementField, SavedMeasurement
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ClothingTypeSerializer, FabricSerializer, FabricColorSerializer,
    PatternSerializer, MeasurementFieldSerializer, SavedMeasurementSerializer
)


def generate_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def get_user_from_token(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return User.objects.get(id=payload['user_id'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
        return None


# ─── AUTH ────────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    if User.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data.get('role', 'customer'),
        phone=data.get('phone', ''),
    )
    token = generate_token(user)
    return Response({
        'token': token,
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    # Authenticate using username (which we set to email)
    user = authenticate(username=data['email'], password=data['password'])
    if user is None:
        # Try finding user by email field
        try:
            u = User.objects.get(email=data['email'])
            user = authenticate(username=u.username, password=data['password'])
        except User.DoesNotExist:
            pass

    if user is None:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    token = generate_token(user)
    return Response({
        'token': token,
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
def me(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(UserSerializer(user).data)


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not User.objects.filter(email=email).exists():
        # Don't reveal if user exists
        return Response({'message': 'If the email exists, a reset link has been sent.'})
    return Response({'message': 'If the email exists, a reset link has been sent.'})


# ─── MODULE 2: GENDER & CLOTHING & FABRIC ────────────────────────────────────

@api_view(['GET'])
def clothing_types(request):
    gender = request.query_params.get('gender', None)
    qs = ClothingType.objects.all()
    if gender:
        qs = qs.filter(gender=gender)
    return Response(ClothingTypeSerializer(qs, many=True).data)


@api_view(['GET'])
def fabrics(request):
    return Response(FabricSerializer(Fabric.objects.all(), many=True).data)


@api_view(['GET'])
def fabric_colors(request):
    return Response(FabricColorSerializer(FabricColor.objects.all(), many=True).data)


@api_view(['GET'])
def patterns(request):
    return Response(PatternSerializer(Pattern.objects.all(), many=True).data)


# ─── MODULE 3: MEASUREMENTS ─────────────────────────────────────────────────

@api_view(['GET'])
def measurement_fields(request):
    clothing_type_id = request.query_params.get('clothing_type_id')
    if not clothing_type_id:
        return Response({'error': 'clothing_type_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    fields = MeasurementField.objects.filter(clothing_type_id=clothing_type_id)
    return Response(MeasurementFieldSerializer(fields, many=True).data)


@api_view(['GET', 'POST'])
def saved_measurements(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        measurements = SavedMeasurement.objects.filter(user=user).order_by('-updated_at')
        return Response(SavedMeasurementSerializer(measurements, many=True).data)

    elif request.method == 'POST':
        serializer = SavedMeasurementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
def saved_measurement_detail(request, pk):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        measurement = SavedMeasurement.objects.get(pk=pk, user=user)
    except SavedMeasurement.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = SavedMeasurementSerializer(measurement, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    elif request.method == 'DELETE':
        measurement.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)


# ─── ADMIN / TAILOR ENDPOINTS ────────────────────────────────────────────────

def require_role(request, allowed_roles):
    user = get_user_from_token(request)
    if not user:
        return None, Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    if user.role not in allowed_roles:
        return None, Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return user, None


@api_view(['GET'])
def admin_users(request):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    role = request.query_params.get('role', None)
    qs = User.objects.all().order_by('-date_joined')
    if role:
        qs = qs.filter(role=role)
    return Response(UserSerializer(qs, many=True).data)


@api_view(['PUT'])
def admin_update_user(request, pk):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    allowed_fields = ['first_name', 'last_name', 'role', 'phone', 'is_active']
    for field in allowed_fields:
        if field in request.data:
            setattr(target, field, request.data[field])
    target.save()
    return Response(UserSerializer(target).data)


@api_view(['DELETE'])
def admin_delete_user(request, pk):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    if target.id == user.id:
        return Response({'error': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
    target.delete()
    return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def admin_stats(request):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    return Response({
        'total_users': User.objects.count(),
        'customers': User.objects.filter(role='customer').count(),
        'admins': User.objects.filter(role='admin').count(),
        'total_clothing_types': ClothingType.objects.count(),
        'total_fabrics': Fabric.objects.count(),
        'total_measurements': SavedMeasurement.objects.count(),
    })


@api_view(['POST', 'PUT', 'DELETE'])
def manage_clothing_type(request, pk=None):
    user, err = require_role(request, ['admin'])
    if err:
        return err

    if request.method == 'POST':
        serializer = ClothingTypeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    try:
        obj = ClothingType.objects.get(pk=pk)
    except ClothingType.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ClothingTypeSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST', 'PUT', 'DELETE'])
def manage_fabric(request, pk=None):
    user, err = require_role(request, ['admin'])
    if err:
        return err

    if request.method == 'POST':
        serializer = FabricSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    try:
        obj = Fabric.objects.get(pk=pk)
    except Fabric.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = FabricSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def tailor_customers(request):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    customers = User.objects.filter(role='customer').order_by('-date_joined')
    return Response(UserSerializer(customers, many=True).data)


@api_view(['GET'])
def tailor_customer_measurements(request, customer_id):
    user, err = require_role(request, ['admin'])
    if err:
        return err
    measurements = SavedMeasurement.objects.filter(user_id=customer_id).order_by('-updated_at')
    return Response(SavedMeasurementSerializer(measurements, many=True).data)
