# -*- coding: utf-8 -*-
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
import torch

tokenizer = AutoTokenizer.from_pretrained("cl-tohoku/bert-base-japanese-whole-word-masking")
model = AutoModelForQuestionAnswering.from_pretrained("output")

questions = [
     "今年に入ってから、何に関する事件が絶えないのか？",
]

text = "今年に入ってから、自分が乗っている車に関する事件が絶えません。雪が降ったため、ガソリンスタンドでタイヤ交換を頼んだところ、荷台の部分の扉を支える伸縮棒が無理な力で折れ曲がり、上へ上がるはずの扉が半分までしか開かない状態に。どうやら、スタンドのスタッフが、交換したタイヤを車に積み込んだ際に、無理に扉を閉めたことが原因のようでした。この件は、ガソリンスタンド側の過失ということで、修理をしてもらいました。"

for question in questions:
    inputs = tokenizer(question, text, add_special_tokens=True, return_tensors="pt")
    input_ids = inputs["input_ids"].tolist()[0]
    outputs = model(**inputs)
    answer_start_scores = outputs.start_logits
    answer_end_scores = outputs.end_logits

    answer_start = torch.argmax(
        answer_start_scores
    )  # Get the most likely beginning of answer with the argmax of the score
    answer_end = torch.argmax(answer_end_scores) + 1  # Get the most likely end of answer with the argmax of the score

    print(answer_start, answer_end)
    answer = tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(input_ids[answer_start:answer_end]))

    print(f"Question: {question}")
    print(f"Answer: {answer}")
