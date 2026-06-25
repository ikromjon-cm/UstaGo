import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class OpenAIService:
    @staticmethod
    def _get_client():
        key = settings.OPENAI_API_KEY
        if not key:
            return None
        try:
            from openai import OpenAI
            return OpenAI(api_key=key)
        except ImportError:
            logger.warning("openai package not installed")
            return None
        except Exception as e:
            logger.error(f"OpenAI init failed: {e}")
            return None

    @staticmethod
    def categorize(text):
        client = OpenAIService._get_client()
        if not client:
            return None
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a service categorizer. Given a user's request text, identify the most likely service category. Return only a JSON object with fields: category (str), confidence (float 0-1). No other text."},
                    {"role": "user", "content": text},
                ],
                temperature=0.1,
                max_tokens=100,
            )
            raw = resp.choices[0].message.content.strip()
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"OpenAI categorize failed: {e}")
            return None

    @staticmethod
    def estimate_price(category_name, text):
        client = OpenAIService._get_client()
        if not client:
            return None
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a pricing estimator for services in Uzbekistan (UZS). Given a service category and user request, estimate a fair price range. Return only JSON: {\"price_min\": int, \"price_max\": int}. No other text."},
                    {"role": "user", "content": f"Category: {category_name}\nRequest: {text}"},
                ],
                temperature=0.1,
                max_tokens=100,
            )
            raw = resp.choices[0].message.content.strip()
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"OpenAI estimate_price failed: {e}")
            return None

    @staticmethod
    def chat(user_message, user_name="User"):
        client = OpenAIService._get_client()
        if not client:
            return None
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI assistant for UstaGo, a service marketplace in Uzbekistan. Help users find services, estimate prices, and answer questions about the platform. Be friendly, concise, and respond in Uzbek. If you don't know something, say so."},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.7,
                max_tokens=300,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI chat failed: {e}")
            return None
