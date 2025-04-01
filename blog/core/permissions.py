from rest_framework import permissions
from rest_framework.permissions import DjangoModelPermissions, BasePermission
from rest_framework.permissions import SAFE_METHODS


class IsOwnerOrModelPermissions(DjangoModelPermissions):
    # we already have has_permission method in DjangoModelPermissions
    # so we need to override has_object_permission

    def has_object_permission(self, request, view, obj):
        if (
            request.method in permissions.SAFE_METHODS
            and super().has_permission(request, view)
        ):
            return True

        return (
            obj.author.user == request.user
            or request.user.is_superuser
            or request.user.groups.filter(name='moderators').exists()
        )


class IsAdminOrModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = (
            request.user and request.user.is_authenticated and request.user.is_superuser
        )
        if is_admin:
            return True
        in_moderators_group = (
            request.user and request.user.is_authenticated and request.user.groups.filter(
                name='users').exists()
        )
        return in_moderators_group


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.author.user == request.user


class AllowDeleteOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method == 'DELETE'


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True 
        return request.user and request.user.is_authenticated and request.user.is_staff
