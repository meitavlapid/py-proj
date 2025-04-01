from .models import Post, Comment, UserProfile, PostUserLikes

from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.serializers import *
from django.contrib.auth.models import User


class BlogTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.username
        token['isadmin'] = user.is_superuser
        # ...

        return token


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'password', 'first_name', 'last_name', 'bio', 'birth_date', 'profile_pic', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': False, 'required': True},
            'id': {'read_only': True},
            'email': {'required': True},
            'username': {'required': True, 'min_length': 3},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'bio': {'required': False},
            'birth_date': {'required': False},
            'profile_pic': {'required': False},

        }

    def validate_password(self, value):
        if len(value) < 8:
            raise ValidationError(
                'Password must be at least 8 characters long.')
        return value

    def validate(self, attrs):
        return super().validate(attrs)

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance: User, validated_data):

        password = validated_data.pop('password', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.set_password(password)
        instance.save()
        return instance


class TagField(TagListSerializerField):

    def to_internal_value(self, value):
        request = self.context.get('request')

        is_browsable_api = (
            request
            and hasattr(request, 'accepted_renderer')
            and request.accepted_renderer.format == 'api'
        )

        if (
            is_browsable_api
            and isinstance(value, list)
            and len(value) == 1
            and isinstance(value[0], str)
        ):
            value = value[0].split() 

        return super().to_internal_value(value)


class CurrentUserDefault():
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context['request']
        return request.user.userprofile


class PostSerializer(TaggitSerializer, ModelSerializer):
    tags = TagListSerializerField()
    author = HiddenField(default=CurrentUserDefault())
    author_id = SerializerMethodField()
    author_username = SerializerMethodField()
    is_liked_by_me = SerializerMethodField()
    likes_count = SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'

    def get_author_id(self, obj):
        return obj.author.id

    def get_author_username(self, obj):
        return obj.author.username

    def get_is_liked_by_me(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.postuserlikes_set.filter(user__user=request.user).exists()
        return False

    def get_likes_count(self, obj):
        return obj.postuserlikes_set.count()


class CommentSerializer(ModelSerializer):
    author_id = SerializerMethodField()
    author_username = SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author'] 
    def get_author_id(self, obj):
        return obj.author.id

    def get_author_username(self, obj):
        return obj.author.username


class UserProfileSerializer(ModelSerializer):
    username = CharField(source="user.username",
                         read_only=True)  

    class Meta:
        model = UserProfile
        fields = ["id", "bio", "profile_pic", "birth_date", "created_at",
                  "updated_at", "user", "username"]  


class PostUserLikesSerializer(ModelSerializer):
    username = SerializerMethodField()

    class Meta:
        model = PostUserLikes
        fields = '__all__'

    def get_username(self, obj):
        return obj.user.user.username
