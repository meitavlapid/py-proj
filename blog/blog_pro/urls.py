from django.urls import path, include
from rest_framework.authtoken import views as auth_views
from rest_framework.routers import DefaultRouter
from blog_pro.views import AuthViewSet, UsersViewSet, PostViewSet, CommentsViewSet, UserProfileViewSet, LikesViewSet

router = DefaultRouter()
router.register(r'users', UsersViewSet, basename="user")
router.register(r'auth', AuthViewSet, basename="auth")

router.register(r'comments', CommentsViewSet, basename='comment')
router.register(r'posts', PostViewSet, basename='post')
router.register('user-profile', UserProfileViewSet, basename='user-profile')
router.register('likes', LikesViewSet, basename='likes')


urlpatterns = [
    path('', include(router.urls)),
    path('comments/post/<int:post_id>/',
         CommentsViewSet.as_view({'get': 'list'}), name='comments-by-post'),
    path('api-auth/', include('rest_framework.urls')),
]
