# -*- coding: utf-8 -*-
import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer
import config

class robertaQA:

  def __init__(self, logger):
    self.logger = logger
    self.model = AutoModelForQuestionAnswering.from_pretrained(config.ROBERTA_QA_MODEL)
    self.tokenizer = AutoTokenizer.from_pretrained(config.ROBERTA_QA_TOKENIZER)

  def predict(self, question, context):
    inputs = self.tokenizer(question, context, add_special_tokens=True, return_tensors="pt")
    input_ids = inputs["input_ids"].tolist()[0]
    outputs = self.model(**inputs)
    answer_start_scores = outputs.start_logits
    answer_end_scores = outputs.end_logits
    answer_start = torch.argmax(answer_start_scores)
    answer_end = torch.argmax(answer_end_scores) + 1
    answer = self.tokenizer.convert_tokens_to_string(
        self.tokenizer.convert_ids_to_tokens(input_ids[answer_start:answer_end]))
    answer = answer.replace("<unk>", "")
    return answer