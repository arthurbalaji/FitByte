from django.contrib import admin
from .models import User, ClothingType, Fabric, FabricColor, Pattern, MeasurementField, SavedMeasurement, Address, Order, OrderStatusHistory, CartItem

admin.site.register(User)
admin.site.register(ClothingType)
admin.site.register(Fabric)
admin.site.register(FabricColor)
admin.site.register(Pattern)
admin.site.register(MeasurementField)
admin.site.register(SavedMeasurement)
admin.site.register(Address)
admin.site.register(Order)
admin.site.register(OrderStatusHistory)
admin.site.register(CartItem)
