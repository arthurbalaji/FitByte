import jwt
import datetime
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User, ClothingType, Fabric, FabricColor, Pattern, MeasurementField, SavedMeasurement, Address, Order, OrderStatusHistory, CartItem
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ClothingTypeSerializer, FabricSerializer, FabricColorSerializer,
    PatternSerializer, MeasurementFieldSerializer, SavedMeasurementSerializer,
    AddressSerializer, OrderSerializer, OrderCreateSerializer, OrderStatusHistorySerializer,
    CartItemSerializer
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
        'total_cart_items': CartItem.objects.count(),
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


# ─── ADDRESS MANAGEMENT ──────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def addresses(request):
    """List all addresses or create a new address for the authenticated user."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        user_addresses = Address.objects.filter(user=user)
        return Response(AddressSerializer(user_addresses, many=True).data)

    elif request.method == 'POST':
        serializer = AddressSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def address_detail(request, pk):
    """Retrieve, update or delete an address."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        address = Address.objects.get(pk=pk, user=user)
    except Address.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AddressSerializer(address).data)

    elif request.method == 'PUT':
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    elif request.method == 'DELETE':
        address.delete()
        return Response({'message': 'Address deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def set_default_address(request, pk):
    """Set an address as the default."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        address = Address.objects.get(pk=pk, user=user)
    except Address.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    address.is_default = True
    address.save()
    return Response(AddressSerializer(address).data)


# ─── ORDER MANAGEMENT (CUSTOMER) ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
def orders(request):
    """List all orders or create a new order for the authenticated user."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        user_orders = Order.objects.filter(user=user)
        status_filter = request.query_params.get('status')
        if status_filter:
            user_orders = user_orders.filter(status=status_filter)
        return Response(OrderSerializer(user_orders, many=True).data)

    elif request.method == 'POST':
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        order = serializer.save(user=user)
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            changed_by=user,
            notes='Order placed'
        )
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


# ─── CART MANAGEMENT (CUSTOMER) ──────────────────────────────────────────────

@api_view(['GET', 'POST'])
def cart_items(request):
    """List cart items or add a new item to cart."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        items = CartItem.objects.filter(user=user)
        return Response(CartItemSerializer(items, many=True).data)

    serializer = CartItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    item = serializer.save(user=user)
    return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
def cart_item_detail(request, pk):
    """Update quantity/notes or remove an item from cart."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        item = CartItem.objects.get(pk=pk, user=user)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    item.delete()
    return Response({'message': 'Cart item removed'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def checkout_cart(request):
    """Checkout all cart items into orders using one delivery address."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    items = list(CartItem.objects.filter(user=user))
    if not items:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    delivery_address = request.data.get('delivery_address')
    if not isinstance(delivery_address, dict):
        return Response({'error': 'delivery_address is required'}, status=status.HTTP_400_BAD_REQUEST)

    required_address_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country']
    missing = [f for f in required_address_fields if not delivery_address.get(f)]
    if missing:
        return Response({'error': f"Missing delivery address fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

    global_notes = request.data.get('customer_notes', '')
    checkout_group = request.data.get('checkout_group')

    created_orders = []
    with transaction.atomic():
        for item in items:
            merged_notes = item.customer_notes or ''
            if global_notes:
                merged_notes = f"{merged_notes}\n{global_notes}".strip() if merged_notes else global_notes

            order = Order.objects.create(
                user=user,
                checkout_group=checkout_group,
                gender=item.gender,
                clothing_type=item.clothing_type,
                fabric=item.fabric,
                fabric_color=item.fabric_color,
                pattern=item.pattern,
                size_type=item.size_type,
                standard_size=item.standard_size,
                measurements=item.measurements,
                fabric_source=item.fabric_source,
                delivery_address=delivery_address,
                quantity=item.quantity,
                customer_notes=merged_notes,
                unit_price=1000,
                total_price=item.quantity * 1000,
            )

            OrderStatusHistory.objects.create(
                order=order,
                status='pending',
                changed_by=user,
                notes='Order placed from cart checkout'
            )
            created_orders.append(order)

        CartItem.objects.filter(user=user).delete()

    return Response({
        'message': f'{len(created_orders)} order(s) placed successfully',
        'orders': OrderSerializer(created_orders, many=True).data,
        'order_numbers': [o.order_number for o in created_orders],
        'checkout_group': created_orders[0].checkout_group if created_orders else None,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_detail(request, pk):
    """Retrieve order details."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        # Customers can only see their own orders
        if user.role == 'customer':
            order = Order.objects.get(pk=pk, user=user)
        else:
            order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def cancel_order(request, pk):
    """Customer can cancel an order if it's still pending."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        order = Order.objects.get(pk=pk, user=user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status not in ['pending', 'confirmed']:
        return Response({'error': 'Order cannot be cancelled at this stage'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'cancelled'
    order.save()
    
    OrderStatusHistory.objects.create(
        order=order,
        status='cancelled',
        changed_by=user,
        notes='Cancelled by customer'
    )
    
    return Response(OrderSerializer(order).data)


# ─── ORDER MANAGEMENT (ADMIN) ────────────────────────────────────────────────

@api_view(['GET'])
def admin_orders(request):
    """List all orders (admin only)."""
    user, err = require_role(request, ['admin'])
    if err:
        return err

    orders_qs = Order.objects.all()
    
    # Filters
    status_filter = request.query_params.get('status')
    if status_filter:
        orders_qs = orders_qs.filter(status=status_filter)
    
    customer_id = request.query_params.get('customer_id')
    if customer_id:
        orders_qs = orders_qs.filter(user_id=customer_id)
    
    date_from = request.query_params.get('date_from')
    if date_from:
        orders_qs = orders_qs.filter(created_at__date__gte=date_from)
    
    date_to = request.query_params.get('date_to')
    if date_to:
        orders_qs = orders_qs.filter(created_at__date__lte=date_to)
    
    return Response(OrderSerializer(orders_qs, many=True).data)


@api_view(['PUT'])
def admin_update_order_status(request, pk):
    """Update order status (admin only)."""
    user, err = require_role(request, ['admin'])
    if err:
        return err

    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if not new_status:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

    valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({'error': f'Invalid status. Valid options: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = order.status
    order.status = new_status
    
    # Update additional fields if provided
    if 'admin_notes' in request.data:
        order.admin_notes = request.data['admin_notes']
    if 'estimated_delivery' in request.data:
        order.estimated_delivery = request.data['estimated_delivery']
    if 'payment_status' in request.data:
        order.payment_status = request.data['payment_status']
    
    # Set delivered_at if status is delivered
    if new_status == 'delivered' and not order.delivered_at:
        order.delivered_at = datetime.datetime.now()
    
    order.save()
    
    # Create status history
    OrderStatusHistory.objects.create(
        order=order,
        status=new_status,
        changed_by=user,
        notes=request.data.get('notes', f'Status changed from {old_status} to {new_status}')
    )
    
    return Response(OrderSerializer(order).data)


@api_view(['GET'])
def admin_order_stats(request):
    """Get order statistics (admin only)."""
    user, err = require_role(request, ['admin'])
    if err:
        return err

    from django.db.models import Count, Sum

    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    in_progress_orders = Order.objects.filter(status='in_progress').count()
    completed_orders = Order.objects.filter(status='delivered').count()
    cancelled_orders = Order.objects.filter(status='cancelled').count()
    
    total_revenue = Order.objects.filter(
        status__in=['delivered', 'shipped', 'ready']
    ).aggregate(total=Sum('total_price'))['total'] or 0

    return Response({
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'in_progress_orders': in_progress_orders,
        'completed_orders': completed_orders,
        'cancelled_orders': cancelled_orders,
        'total_revenue': float(total_revenue),
    })
