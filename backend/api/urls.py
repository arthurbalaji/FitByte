from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register),
    path('login/', views.login),
    path('me/', views.me),
    path('forgot-password/', views.forgot_password),

    # Module 2
    path('clothing-types/', views.clothing_types),
    path('fabrics/', views.fabrics),
    path('fabric-colors/', views.fabric_colors),
    path('patterns/', views.patterns),

    # Module 3
    path('measurement-fields/', views.measurement_fields),
    path('saved-measurements/', views.saved_measurements),
    path('saved-measurements/<int:pk>/', views.saved_measurement_detail),

    # Admin
    path('admin/users/', views.admin_users),
    path('admin/users/<int:pk>/', views.admin_update_user),
    path('admin/users/<int:pk>/delete/', views.admin_delete_user),
    path('admin/stats/', views.admin_stats),
    path('admin/clothing-types/', views.manage_clothing_type),
    path('admin/clothing-types/<int:pk>/', views.manage_clothing_type),
    path('admin/fabrics/', views.manage_fabric),
    path('admin/fabrics/<int:pk>/', views.manage_fabric),

    # Tailor
    path('tailor/customers/', views.tailor_customers),
    path('tailor/customers/<int:customer_id>/measurements/', views.tailor_customer_measurements),
]
