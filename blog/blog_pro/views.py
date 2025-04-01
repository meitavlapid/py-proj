from core.authentication import get_tokens_for_user
from blog_pro.throttling import CreatePostAnonRateThrottle, CreatePostUserRateThrottle
from .serializers import *
from .models import *
from core.utils import try_parse_int
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.response import Response
from core.permissions import IsOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.permissions import IsAdminOrReadOnly
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.reverse import reverse
from django.contrib.auth import login, logout
from rest_framework.authtoken.serializers import AuthTokenSerializer
from blog_pro.throttling import (
    CreatePostUserRateThrottle,
    CreatePostAnonRateThrottle,
    ListPostsUserRateThrottle,
    ListPostsAnonRateThrottle
)
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

import logging

logging.basicConfig(level=logging.INFO)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    if not request.user.is_authenticated:
        return Response({"error": "User is not authenticated"}, status=403)

    return Response({"user": request.user.username, "id": request.user.id})


class AuthViewSet(ViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        logging.debug("This is a debug message")

        serializer = AuthTokenSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        jwt = get_tokens_for_user(user)
        login(request, user)
        return Response({
            "token": token.key,
            "jwt": jwt
        })

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            logout(request)
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'Logout successful'})

    def list(self, request):
        return Response({
            "login": reverse('auth-login', request=request),
            "register": reverse('auth-register', request=request),
            "logout": reverse('auth-logout', request=request),
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': 'הרשמה נכשלה',
                'errors': serializer.errors
            },)

        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        jwt = get_tokens_for_user(user)

        return Response({
            'message': 'ההרשמה בוצעה בהצלחה',
            'token': token.key,
            'jwt': jwt,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        },)


class UsersViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile not found"}, status=404)

        if request.method == "GET":
            role = "admin" if user.is_superuser or user.is_staff else "user"
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": profile.bio,
                "birth_date": profile.birth_date,
                "profile_pic": profile.profile_pic_url,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff
            })

        elif request.method == "PATCH":
            user.first_name = request.data.get("first_name", user.first_name)
            user.last_name = request.data.get("last_name", user.last_name)
            user.email = request.data.get("email", user.email)
            user.save()

            profile.bio = request.data.get("bio", profile.bio)
            profile.birth_date = request.data.get(
                "birth_date", profile.birth_date)
            profile.profile_pic_url = request.data.get(
                "profile_pic_url", profile.profile_pic_url)

            profile.save()

            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": profile.bio,
                "birth_date": profile.birth_date,
                "profile_pic": profile.profile_pic_url,
            })


class CommentsViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user

        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            print(" No UserProfile for user:", user)
            return Response({"error": "UserProfile not found"}, status=403)

        serializer.save(author=profile)

    def create(self, request, *args, **kwargs):
        logging.debug(" Creating comment...")
        data = request.data
        reply_to = data.get("reply_to")
        post_id = try_parse_int(data.get('post'))

        if reply_to:
            replied = Comment.objects.filter(id=reply_to).first()
            if replied and replied.post_id != post_id:
                return Response(
                    {"error": "Cannot reply to a comment on a different post"},
                    status=400
                )

        return super().create(request, *args, **kwargs)

    def list(self, request, post_id=None, *args, **kwargs):
        logging.debug(" Fetching comments list...")
        if post_id is not None:
            self.queryset = self.queryset.filter(post=post_id)

        res = super().list(request, *args, **kwargs)
        comments = res.data
        comments_dict = {comment["id"]: comment for comment in comments}
        root_comments = []

        for comment in comments:
            parent_id = comment['reply_to']
            if parent_id is None:
                root_comments.append(comment)
            else:
                parent = comments_dict.get(parent_id)
                if parent:
                    parent.setdefault("replies", []).append(comment)

        res.data = root_comments
        return res


class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [OrderingFilter, DjangoFilterBackend, SearchFilter]

    filterset_fields = ['author', 'title', 'text', 'created_at', 'updated_at']
    search_fields = ['title', 'text']
    mapping = {
        'create': [CreatePostUserRateThrottle, CreatePostAnonRateThrottle],
        'list': [ListPostsUserRateThrottle, ListPostsAnonRateThrottle],
    }

    def get_throttles(self):
        throttles = self.mapping.get(self.action, [])
        return [throttle() for throttle in throttles]

    def perform_create(self, serializer):
        try:
            profile = UserProfile.objects.get(user=self.request.user)
            serializer.save(author=profile)
        except UserProfile.DoesNotExist:
            raise ValueError(" UserProfile not found for current user")


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


class LikesViewSet(ModelViewSet):
    queryset = PostUserLikes.objects.all()
    serializer_class = PostUserLikesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post']

    def perform_create(self, serializer):
        user_profile = self.request.user.userprofile
        serializer.save(user=user_profile)

    @action(detail=False, methods=["post"], url_path="like")
    def like(self, request):
        post_id = request.data.get("post")
        if not post_id:
            return Response({"error": "Missing post ID"}, status=400)

        user_profile = request.user.userprofile
        already_liked = PostUserLikes.objects.filter(
            post_id=post_id, user=user_profile).first()
        if already_liked:
            return Response({"message": "Already liked"}, status=200)

        like = PostUserLikes.objects.create(post_id=post_id, user=user_profile)
        return Response(PostUserLikesSerializer(like).data, status=201)

    @action(detail=False, methods=["post"], url_path="unlike")
    def unlike(self, request):
        post_id = request.data.get("post")
        if not post_id:
            return Response({"error": "Missing post ID"}, status=400)

        user_profile = request.user.userprofile
        like = PostUserLikes.objects.filter(
            post_id=post_id, user=user_profile).first()
        if not like:
            return Response({"message": "Like not found"}, status=404)

        like.delete()
        return Response({"message": "Like removed"}, status=204)
