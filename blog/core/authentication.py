from rest_framework_simplejwt.tokens import RefreshToken
from blog_pro.serializers import BlogTokenObtainPairSerializer

def get_tokens_for_user(user):
    refresh = BlogTokenObtainPairSerializer.get_token(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
