from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.email} ({self.role})"


class ClothingType(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('kids', 'Kids'),
    )
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    class Meta:
        unique_together = ('name', 'gender')

    def __str__(self):
        return f"{self.name} ({self.gender})"


class Fabric(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class FabricColor(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, blank=True, null=True)

    def __str__(self):
        return self.name


class Pattern(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class MeasurementField(models.Model):
    """Defines which measurement fields apply to which clothing type."""
    clothing_type = models.ForeignKey(ClothingType, on_delete=models.CASCADE, related_name='measurement_fields')
    field_name = models.CharField(max_length=50)
    field_label = models.CharField(max_length=100)
    unit = models.CharField(max_length=10, default='inches')
    is_required = models.BooleanField(default=True)

    class Meta:
        unique_together = ('clothing_type', 'field_name')

    def __str__(self):
        return f"{self.clothing_type.name} - {self.field_label}"


class SavedMeasurement(models.Model):
    """User's saved measurements for reuse."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_measurements')
    label = models.CharField(max_length=100)
    clothing_type = models.ForeignKey(ClothingType, on_delete=models.CASCADE)
    size_type = models.CharField(max_length=10, choices=(('standard', 'Standard'), ('custom', 'Custom')))
    standard_size = models.CharField(max_length=5, blank=True, null=True)
    measurements = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.label}"


class Address(models.Model):
    """User's saved shipping/delivery addresses."""
    ADDRESS_TYPE_CHOICES = (
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)  # e.g., "Home", "Office"
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES, default='home')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.label} ({self.city})"

    def save(self, *args, **kwargs):
        # If this is set as default, unset other defaults for this user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class Order(models.Model):
    """Customer order for tailored clothing."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('ready', 'Ready for Delivery'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    )
    
    # Order identification
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Product details
    gender = models.CharField(max_length=10)
    clothing_type = models.ForeignKey(ClothingType, on_delete=models.PROTECT)
    fabric = models.ForeignKey(Fabric, on_delete=models.PROTECT)
    fabric_color = models.ForeignKey(FabricColor, on_delete=models.PROTECT)
    pattern = models.ForeignKey(Pattern, on_delete=models.PROTECT)
    
    # Measurements
    size_type = models.CharField(max_length=10, choices=(('standard', 'Standard'), ('custom', 'Custom')))
    standard_size = models.CharField(max_length=5, blank=True, null=True)
    measurements = models.JSONField(default=dict)
    
    # Fabric source
    fabric_source = models.CharField(max_length=20, default='tailor')  # 'tailor' or 'customer'
    
    # Delivery address (snapshot at order time)
    delivery_address = models.JSONField(default=dict)
    
    # Pricing
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_delivery = models.DateField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            import datetime
            import random
            date_str = datetime.datetime.now().strftime('%Y%m%d')
            random_str = ''.join([str(random.randint(0, 9)) for _ in range(4)])
            self.order_number = f"FB{date_str}{random_str}"
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    """Track order status changes."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Order status histories'

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"
