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
