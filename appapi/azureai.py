import openai
from openai import util
import config

class GPT35():

    def __init__(self, logger):
        self.logger = logger
        self.deployment_name = config.OPENAI_GPT_DEPLOYMENT_NAME
        openai.api_type = config.OPENAI_API_TYPE
        openai.api_base = config.OPENAI_API_ENDPOINT
        openai.api_version = config.OPENAI_API_VERSION
        openai.api_key = config.OPENAI_API_KEY

    def chat(self, message):
        try:
            response = openai.ChatCompletion.create(
                engine = self.deployment_name,
                messages = [{"role":"user","content":message}],
                temperature = 0.7,
                max_tokens = 800,
                top_p = 0.95,
                frequency_penalty = 0,
                presence_penalty = 0,
                stop = None
            )

            response_txt = util.convert_to_dict(response)
            return response_txt
        except:
            raise
    