from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.contrib import admin



class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email')


# בטל את הרישום הקיים ותרשום מחדש:
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
